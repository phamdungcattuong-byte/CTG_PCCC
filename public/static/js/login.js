(function () {
  var form = document.getElementById('loginForm');
  var errBox = document.getElementById('loginError');
  var submitBtn = document.getElementById('loginSubmit');
  if (!form) return;

  var form2fa = document.getElementById('login2faForm');
  var err2faBox = document.getElementById('login2faError');
  var submit2faBtn = document.getElementById('login2faSubmit');
  var back2faBtn = document.getElementById('login2faBack');
  var pendingToken = null;

  function showStep(step) {
    form.style.display = step === 'password' ? '' : 'none';
    form2fa.style.display = step === '2fa' ? '' : 'none';
    if (step === '2fa') {
      document.getElementById('login2faCode').value = '';
      document.getElementById('login2faCode').focus();
    }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    errBox.style.display = 'none';
    submitBtn.disabled = true;
    var prevText = submitBtn.textContent;
    submitBtn.textContent = 'Đang đăng nhập…';
    try {
      var username = document.getElementById('loginUsername').value.trim();
      var password = document.getElementById('loginPassword').value;
      var res = await window.API.post('/auth/login', { username: username, password: password });
      if (res && res.twoFactorRequired) {
        pendingToken = res.pendingToken;
        showStep('2fa');
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      errBox.textContent = err.message || 'Sai tài khoản hoặc mật khẩu';
      errBox.style.display = '';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = prevText;
    }
  });

  if (form2fa) {
    form2fa.addEventListener('submit', async function (e) {
      e.preventDefault();
      err2faBox.style.display = 'none';
      submit2faBtn.disabled = true;
      var prevText = submit2faBtn.textContent;
      submit2faBtn.textContent = 'Đang xác thực…';
      try {
        var code = document.getElementById('login2faCode').value.trim();
        await window.API.post('/auth/2fa/login-verify', { pendingToken: pendingToken, code: code });
        window.location.href = '/';
      } catch (err) {
        err2faBox.textContent = err.message || 'Mã xác thực không đúng';
        err2faBox.style.display = '';
      } finally {
        submit2faBtn.disabled = false;
        submit2faBtn.textContent = prevText;
      }
    });
  }

  if (back2faBtn) {
    back2faBtn.addEventListener('click', function () {
      pendingToken = null;
      showStep('password');
    });
  }
})();
