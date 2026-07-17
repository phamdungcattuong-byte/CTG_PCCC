// Overrides for chat-ai.js — loaded after chat-ai.js.
// Replaces the prototype's askAI() stub (which called a non-existent
// `window.genspark.complete(...)` hook and always fell back to canned
// keyword-matched replies) with a real call to the backend AI route
// POST /api/v1/ai/chat, which proxies to an OpenAI-compatible LLM. The
// hardcoded fallbackAI() from chat-ai.js is preserved as an offline/error
// fallback so the assistant never goes fully silent if the AI backend is
// briefly unavailable.
(function () {
  window.askAI = async function (text) {
    text = text || document.getElementById('aiInput').value.trim();
    if (!text) return;
    const inp = document.getElementById('aiInput');
    if (inp) inp.value = '';
    window.AI.messages.push({ role: 'me', text, time: Date.now() });
    window.AI.thinking = true;
    window.renderAI();

    const lv = window.currentLevel();
    const me = window.byId(window.PEOPLE, window.STATE.me);

    let reply;
    let usedFallback = false;
    try {
      const res = await window.API.post('/ai/chat', {
        message: text,
        context: {
          levelCode: lv ? lv.code : null,
          levelName: lv ? lv.name : null,
          eventName: window.SIM.eventName || '',
          userName: me ? me.name : null,
          userRole: me ? me.role : null,
        },
      });
      reply = res.reply;
    } catch (e) {
      console.warn('AI backend error, falling back to canned reply:', e);
      reply = typeof window.__ctgFallbackAI === 'function' ? window.__ctgFallbackAI(text) : 'Xin lỗi, trợ lý AI hiện không phản hồi được. Vui lòng thử lại sau.';
      usedFallback = true;
    }

    // Format reply: newlines to <br>, list bullets kept
    reply = String(reply).replace(/</g, '&lt;').replace(/&lt;br&gt;/gi, '<br>').replace(/\n/g, '<br>');
    // basic bold ** **
    reply = reply.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    if (usedFallback) {
      reply += '<div class="muted small" style="margin-top:4px">⚠️ Câu trả lời dự phòng ngoại tuyến — dịch vụ AI tạm thời không phản hồi.</div>';
    }
    window.AI.thinking = false;
    window.AI.messages.push({ role: 'ai', text: reply, time: Date.now() });
    window.renderAI();
  };
})();
