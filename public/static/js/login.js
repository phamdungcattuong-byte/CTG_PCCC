(function () {
  var form = document.getElementById('loginForm');
  var errBox = document.getElementById('loginError');
  var submitBtn = document.getElementById('loginSubmit');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    errBox.style.display = 'none';
    submitBtn.disabled = true;
    var prevText = submitBtn.textContent;
    submitBtn.textContent = 'Đang đăng nhập…';
    try {
      var username = document.getElementById('loginUsername').value.trim();
      var password = document.getElementById('loginPassword').value;
      await window.API.post('/auth/login', { username: username, password: password });
      window.location.href = '/';
    } catch (err) {
      errBox.textContent = err.message || 'Sai tài khoản hoặc mật khẩu';
      errBox.style.display = '';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = prevText;
    }
  });
})();
