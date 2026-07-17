// ============================================================
// CTG CHAT & AI — Command chatroom + AI assistant panel
// ============================================================
(function () {
  'use strict';

  // ---------- Chat state (in-memory only) ----------
  const CHAT = window.CHAT = {
    messages: [
      { id:'m1', personId:'ct',  text:'Yêu cầu tất cả trưởng đơn vị báo cáo tình trạng vật tư PCLB trước 17:00 hôm nay.', time: Date.now() - 3600000*3 },
      { id:'m2', personId:'tgd', text:'Đã tiếp nhận. Tôi phân công CHT và các trưởng BQL báo cáo lên nhóm này.', time: Date.now() - 3600000*3 + 5*60000 },
      { id:'m3', personId:'cht', text:'Kho tổng Cát Tường: đủ định mức 100%. Máy bơm chống úng đã chạy thử OK. Bao cát còn 82% do đã cấp phát diễn tập tháng 6.', time: Date.now() - 3600000*2 },
      { id:'m4', personId:'tn1', text:'BQL Thống Nhất: OK. Riêng túi y tế TN-B02 hết hạn 12 gói bông băng — đã lập đơn xin cấp bù.', time: Date.now() - 3600000*2 + 8*60000 },
      { id:'m5', personId:'eco1',text:'ECO: OK. Bơm B-ECO-01 phát hiện rò dầu, đang cho thay gioăng, dự kiến xong 15:00.', time: Date.now() - 3600000 },
      { id:'m6', personId:'chp1',text:'Đã cập nhật lịch trực tuần này lên Zalo. Nhắc: chỉ huy phó phải nhận đủ báo cáo đóng cửa/cắt điện trước 19:00.', time: Date.now() - 45*60000 },
    ],
  };

  function fmtTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toTimeString().slice(0,5);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${d.toTimeString().slice(0,5)}`;
  }

  function personById(id) { return window.PEOPLE.find(p => p.id === id); }

  window.renderChat = function () {
    const body = document.getElementById('chatBody');
    if (!body) return;
    body.innerHTML = CHAT.messages.map(m => {
      if (m.role === 'ai') {
        return `<div class="chat-msg ai">
          <div class="avatar avatar-sm grad-c">AI</div>
          <div class="cm-body"><div class="cm-head"><span class="cm-name">Trợ lý AI</span><span class="cm-time">${fmtTime(m.time)}</span></div>
          <div class="cm-text">${m.text}</div></div></div>`;
      }
      if (m.role === 'system') {
        return `<div class="chat-msg system"><div class="avatar avatar-sm">i</div>
          <div class="cm-body"><div class="cm-text">${m.text}</div></div></div>`;
      }
      const p = personById(m.personId);
      if (!p) return '';
      const me = window.STATE.me === m.personId;
      return `<div class="chat-msg ${me ? 'me' : ''}">
        <div class="avatar avatar-sm ${p.gradient}">${p.short}</div>
        <div class="cm-body">
          <div class="cm-head"><span class="cm-name">${p.name}${me ? ' (bạn)' : ''}</span><span class="cm-time">${fmtTime(m.time)}</span></div>
          <div class="cm-text">${m.text}</div>
        </div>
      </div>`;
    }).join('');
    body.scrollTop = body.scrollHeight;
  };

  window.sendChat = function () {
    const inp = document.getElementById('chatInput');
    if (!inp || !inp.value.trim()) return;
    const text = inp.value.trim();
    inp.value = '';
    CHAT.messages.push({ id:'m'+Date.now(), personId: window.STATE.me || 'cht', text, time: Date.now() });
    window.renderChat();
    // Auto reply from a random online team member after ~1.5s
    setTimeout(() => {
      const others = window.PEOPLE.filter(p => p.online && p.id !== window.STATE.me);
      const p = others[Math.floor(Math.random() * others.length)];
      const canned = [
        'Đã ghi nhận. Tôi đang xử lý.',
        'Rõ. Sẽ báo cáo lại trước ' + new Date(Date.now()+3600000).toTimeString().slice(0,5) + '.',
        'Ok, tôi cử người xuống hiện trường ngay.',
        'Đã đưa vào checklist trực hôm nay.',
        'Nhất trí. Chờ chỉ đạo tiếp theo.',
      ];
      CHAT.messages.push({ id:'m'+Date.now(), personId: p.id, text: canned[Math.floor(Math.random() * canned.length)], time: Date.now() });
      window.renderChat();
    }, 1200 + Math.random() * 800);
  };

  window.openChat = function () {
    document.getElementById('chatDrawer').classList.add('open');
    window.renderChat();
  };
  window.closeChat = function () {
    document.getElementById('chatDrawer').classList.remove('open');
  };

  // ============================================================
  // AI ASSISTANT
  // ============================================================

  const AI = window.AI = {
    messages: [
      { role:'ai', text:'Xin chào chỉ huy. Tôi là <b>Trợ lý Điều hành PCLB-PCCC</b>. Tôi có thể tra cứu quy định QĐ.03, gợi ý hành động theo cấp độ, tính toán vật tư, và soạn thảo lệnh điều động. Bạn cần hỗ trợ gì?', time: Date.now() }
    ],
    thinking: false,
  };

  const AI_SUGGESTIONS = [
    'Bão cấp 10 sắp vào — tôi cần làm gì trong 6h tới?',
    'Định mức bao cát cho công trường HIJ-KL cần bao nhiêu?',
    'Ai chịu trách nhiệm ra quyết định kích hoạt Cấp 3?',
    'Nếu có người bị thương, quy trình y tế và báo cáo thế nào?',
    'Soạn thông báo Zalo yêu cầu 100% nhân sự ứng trực đêm nay.',
    'Kịch bản CHÁY xưởng — 3 bước đầu tiên là gì?',
  ];

  window.renderAI = function () {
    const body = document.getElementById('aiBody');
    if (!body) return;
    body.innerHTML = AI.messages.map(m => {
      const cls = m.role === 'ai' ? 'chat-msg ai' : 'chat-msg me';
      const av = m.role === 'ai'
        ? `<div class="avatar avatar-sm grad-c">🤖</div>`
        : `<div class="avatar avatar-sm ${window.byId(window.PEOPLE, window.STATE.me)?.gradient||''}">${window.byId(window.PEOPLE, window.STATE.me)?.short||'ME'}</div>`;
      const nm = m.role === 'ai' ? 'Trợ lý AI' : 'Bạn';
      return `<div class="${cls}">${av}<div class="cm-body">
        <div class="cm-head"><span class="cm-name">${nm}</span><span class="cm-time">${fmtTime(m.time)}</span></div>
        <div class="cm-text">${m.text}</div>
      </div></div>`;
    }).join('');
    if (AI.thinking) {
      body.insertAdjacentHTML('beforeend', `<div class="chat-msg ai"><div class="avatar avatar-sm grad-c">🤖</div><div class="cm-body"><div class="cm-text"><div class="typing"><span></span><span></span><span></span></div></div></div></div>`);
    }
    // Pills
    const pills = document.getElementById('aiPills');
    if (pills && !AI.thinking && AI.messages.length < 3) {
      pills.innerHTML = AI_SUGGESTIONS.map(s => `<button class="ai-pill" onclick="window.askAI('${s.replace(/'/g,"\\'")}')">${s}</button>`).join('');
      pills.style.display = '';
    } else if (pills) {
      pills.style.display = 'none';
    }
    body.scrollTop = body.scrollHeight;
  };

  window.askAI = async function (text) {
    text = text || document.getElementById('aiInput').value.trim();
    if (!text) return;
    const inp = document.getElementById('aiInput');
    if (inp) inp.value = '';
    AI.messages.push({ role:'me', text, time: Date.now() });
    AI.thinking = true;
    window.renderAI();

    // Build context prompt
    const lv = window.currentLevel();
    const me = window.byId(window.PEOPLE, window.STATE.me);
    const sysContext = `Bạn là trợ lý AI của Trung tâm Điều hành PCLB-PCCC Cát Tường Group (Bắc Ninh, Việt Nam).
Bối cảnh hiện tại: Cấp độ vận hành ${lv.code} — ${lv.name}. ${window.SIM.eventName ? 'Sự kiện: ' + window.SIM.eventName + '.' : 'Không có sự kiện.'}
Người hỏi: ${me ? me.name + ' ('+me.role+')' : 'Cán bộ trực'}.
Trả lời NGẮN GỌN, tiếng Việt, dùng dấu bullet (–) và số bước rõ ràng khi phù hợp. TỐI ĐA 5-6 dòng. Tập trung hành động cụ thể.
Nếu câu hỏi liên quan quy định, luôn dẫn số Điều của QĐ.03 nếu biết.`;

    let reply;
    try {
      if (window.genspark && window.genspark.complete) {
        reply = await window.genspark.complete({
          messages: [
            { role:'system', content: sysContext },
            { role:'user', content: text },
          ]
        });
      } else {
        reply = fallbackAI(text);
      }
    } catch (e) {
      reply = fallbackAI(text);
    }

    // Format reply: newlines to <br>, list bullets kept
    reply = String(reply).replace(/</g,'&lt;').replace(/&lt;br&gt;/gi,'<br>').replace(/\n/g,'<br>');
    // basic bold ** **
    reply = reply.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
    AI.thinking = false;
    AI.messages.push({ role:'ai', text: reply, time: Date.now() });
    window.renderAI();
  };

  function fallbackAI(q) {
    q = q.toLowerCase();
    if (q.includes('cấp 10') || q.includes('6h')) {
      return `Trong 6h tới (T-6h), theo QĐ.03 Điều 30:<br>
– <b>1)</b> Dừng toàn bộ thi công trên cao, di chuyển cẩu tháp về vị trí an toàn.<br>
– <b>2)</b> Chằng buộc lần cuối tất cả vật tư ngoài trời; niêm phong tủ điện.<br>
– <b>3)</b> Chốt 100% quân số trực 24/24; kích hoạt bếp dã chiến.<br>
– <b>4)</b> Sơ tán công nhân về khu trú ẩn (TT Đông y – KS: 80 chỗ).<br>
– <b>5)</b> Mở mã chi phí ứng phó theo Cấp 3.`;
    }
    if (q.includes('bao cát')) {
      return `Định mức bao cát công trường HIJ-KL (142 người):<br>
– Cấp 1: 300 bao · Cấp 2: 600 bao · Cấp 3: 1.200 bao<br>
– Chằng chống mái tôn + chặn cửa tầng hầm.<br>
– Nguồn: kho tổng Cát Tường + hợp đồng nguồn (Đ.72 QĐ.03).`;
    }
    if (q.includes('cấp 3') && (q.includes('quyết định')||q.includes('ai'))) {
      return `Theo <b>Điều 8, QĐ.03</b>:<br>
– Chủ tịch HĐQT quyết định kích hoạt Cấp 3–4.<br>
– TGĐ/người ủy quyền: Cấp 1–2.<br>
– Chỉ huy hiện trường được kích hoạt tại chỗ khi có nguy cơ trực tiếp, báo cáo VP Chủ tịch ngay sau đó.`;
    }
    if (q.includes('bị thương') || q.includes('y tế')) {
      return `Quy trình theo QĐ.03 Điều 46-48:<br>
– <b>1)</b> Sơ cứu tại chỗ, gọi 115.<br>
– <b>2)</b> Báo cáo Chỉ huy trưởng công trường (ĐT khẩn) + VPCT trong 15 phút.<br>
– <b>3)</b> Lập biên bản BM-TN-01, ảnh hiện trường.<br>
– <b>4)</b> Phối hợp Pháp chế + HC-NS xử lý bảo hiểm.<br>
– <b>5)</b> Báo cáo Chủ tịch trước 24h; nếu tử vong hoặc >2 người: báo cáo ngay.`;
    }
    if (q.includes('zalo') || q.includes('soạn')) {
      return `<b>[LỆNH ĐIỀU ĐỘNG – KHẨN]</b><br>
Kính gửi toàn thể CBNV Cát Tường Group,<br>
Do diễn biến bão số 3 phức tạp, BCH yêu cầu:<br>
– 100% trưởng đơn vị + tổ trực có mặt tại vị trí trước 20:00 đêm nay.<br>
– Bật đầy đủ liên lạc, đăng ký vắng mặt qua VPCT.<br>
– Bất kỳ sự cố nào báo ngay hotline: 0913.***.001<br>
– Trân trọng — VP Chủ tịch.`;
    }
    if (q.includes('cháy')) {
      return `Kịch bản CHÁY xưởng — 3 bước đầu tiên:<br>
– <b>1)</b> Phát chuông báo cháy + gọi 114 (KHÔNG mở cửa nếu khói dày).<br>
– <b>2)</b> Sơ tán theo đường thoát đã diễn tập, điểm tập kết ngoài xưởng ≥15m.<br>
– <b>3)</b> Đội PCCC cơ sở tiếp cận với bình MFZL4/CO₂, ngắt điện tổng.<br>
Sau đó: kiểm điểm quân số, lập biên bản hiện trường, báo VPCT + Pháp chế.`;
    }
    return `Tôi hiểu bạn cần thông tin về: "${q}". Trong prototype này tôi có bộ trả lời hạn chế. Hãy thử một câu hỏi trong gợi ý phía trên, hoặc kết nối API AI thật để nhận trả lời đầy đủ.`;
  }

  window.openAI = function () {
    document.getElementById('aiDrawer').classList.add('open');
    window.renderAI();
  };
  window.closeAI = function () {
    document.getElementById('aiDrawer').classList.remove('open');
  };
})();
