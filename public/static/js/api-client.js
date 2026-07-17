// Minimal fetch wrapper for the CTG Command Center API.
// Envelope: { ok:true, data } | { ok:false, error:{code,message} }
(function () {
  async function call(method, path, body, opts) {
    const init = {
      method,
      credentials: 'same-origin',
      headers: {},
    };
    if (body !== undefined && !(body instanceof FormData)) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
      init.body = body;
    }
    if (opts && opts.idempotencyKey) {
      init.headers['Idempotency-Key'] = opts.idempotencyKey;
    }
    const res = await fetch('/api/v1' + path, init);
    let json;
    try { json = await res.json(); } catch (e) { json = { ok: false, error: { code: 'PARSE_ERROR', message: 'Phản hồi không hợp lệ' } }; }
    if (!json.ok) {
      const err = new Error((json.error && json.error.message) || 'Lỗi không xác định');
      err.code = json.error && json.error.code;
      err.status = res.status;
      throw err;
    }
    return json.data;
  }

  window.API = {
    get: (path) => call('GET', path),
    post: (path, body, opts) => call('POST', path, body, opts),
    patch: (path, body) => call('PATCH', path, body),
    del: (path) => call('DELETE', path),
  };
})();
