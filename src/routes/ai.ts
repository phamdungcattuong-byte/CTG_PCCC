// AI Assistant backend — proxies chat completions to the OpenAI-compatible
// LLM endpoint configured via OPENAI_API_KEY/OPENAI_BASE_URL secrets (see
// get_external_api_docs "openai" — Genspark sandbox LLM proxy). Replaces the
// prototype's client-side `window.genspark.complete(...)` stub (which never
// existed in production) with a real server-side call, so the frontend
// override just POSTs { message, context } and gets a real answer back.
//
// Every turn is logged to ai_chat_logs (see migration 0006) for audit —
// question, answer, context snapshot, model, and any error that triggered a
// local fallback reply instead of a real LLM answer.
import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth } from '../middleware/auth'
import { newUuid } from '../lib/crypto'

const ai = new Hono<AppEnv>()
ai.use('*', requireAuth)

const MODEL = 'gpt-5-mini'

const SYSTEM_PROMPT_BASE = `Bạn là trợ lý AI của Trung tâm Điều hành PCLB-PCCC Cát Tường Group (Bắc Ninh, Việt Nam).
Trả lời NGẮN GỌN, tiếng Việt, dùng dấu bullet (–) và số bước rõ ràng khi phù hợp. TỐI ĐA 5-6 dòng. Tập trung hành động cụ thể.
Nếu câu hỏi liên quan quy định, luôn dẫn số Điều của QĐ.03 nếu biết.`

async function logChatTurn(
  db: D1Database,
  entry: { userId: string; question: string; answer: string | null; context: string | null; model: string | null; error: string | null }
) {
  try {
    await db
      .prepare(
        `INSERT INTO ai_chat_logs (id, user_id, question, answer, context, model, error) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(newUuid(), entry.userId, entry.question, entry.answer, entry.context, entry.model, entry.error)
      .run()
  } catch (e) {
    // Audit logging must never break the chat response itself.
    console.error('ai_chat_logs insert failed', e)
  }
}

// POST /ai/chat  { message: string, context?: { levelCode, levelName, eventName, userName, userRole } }
// -> { ok: true, data: { reply: string, model: string } }
ai.post('/chat', async (c) => {
  const body = await c.req.json().catch(() => null)
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!message) {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu nội dung câu hỏi' } }, 400)
  }
  const user = c.var.user!
  const ctx = body?.context ?? {}
  const contextJson = JSON.stringify(ctx)

  const apiKey = c.env.OPENAI_API_KEY
  const baseUrl = c.env.OPENAI_BASE_URL

  if (!apiKey || !baseUrl) {
    await logChatTurn(c.env.DB, { userId: user.id, question: message, answer: null, context: contextJson, model: null, error: 'MISSING_API_KEY' })
    return c.json({ ok: false, error: { code: 'AI_UNAVAILABLE', message: 'AI backend chưa được cấu hình (thiếu API key)' } }, 503)
  }

  const sysContext = `${SYSTEM_PROMPT_BASE}
Bối cảnh hiện tại: Cấp độ vận hành ${ctx.levelCode ?? '?'} — ${ctx.levelName ?? ''}. ${ctx.eventName ? 'Sự kiện: ' + ctx.eventName + '.' : 'Không có sự kiện.'}
Người hỏi: ${ctx.userName ? ctx.userName + (ctx.userRole ? ' (' + ctx.userRole + ')' : '') : 'Cán bộ trực'}.`

  try {
    const resp = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: sysContext },
          { role: 'user', content: message },
        ],
        max_tokens: 1500,
      }),
    })

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '')
      await logChatTurn(c.env.DB, { userId: user.id, question: message, answer: null, context: contextJson, model: MODEL, error: `HTTP ${resp.status}: ${errText.slice(0, 300)}` })
      return c.json({ ok: false, error: { code: 'AI_UPSTREAM_ERROR', message: 'Lỗi từ dịch vụ AI, vui lòng thử lại' } }, 502)
    }

    const data: any = await resp.json()
    const reply = data?.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      await logChatTurn(c.env.DB, { userId: user.id, question: message, answer: null, context: contextJson, model: MODEL, error: 'EMPTY_RESPONSE' })
      return c.json({ ok: false, error: { code: 'AI_UPSTREAM_ERROR', message: 'AI không trả lời được, vui lòng thử lại' } }, 502)
    }

    await logChatTurn(c.env.DB, { userId: user.id, question: message, answer: reply, context: contextJson, model: MODEL, error: null })
    return c.json({ ok: true, data: { reply, model: MODEL } })
  } catch (e: any) {
    await logChatTurn(c.env.DB, { userId: user.id, question: message, answer: null, context: contextJson, model: MODEL, error: String(e?.message ?? e) })
    return c.json({ ok: false, error: { code: 'AI_UPSTREAM_ERROR', message: 'Không kết nối được dịch vụ AI' } }, 502)
  }
})

export default ai
