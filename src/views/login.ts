import { login } from '../auth';

export function renderLoginPage() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <h2 class="login-title">登录校园超市汇总系统</h2>
        <form id="login-form">
          <div class="form-group">
            <label for="username">用户名</label>
            <input type="text" id="username" required placeholder="请输入用户名" />
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" id="password" required placeholder="请输入密码" />
          </div>
          <div class="form-group checkbox">
            <input type="checkbox" id="isAdmin" />
            <label for="isAdmin">我是管理员</label>
          </div>
          <button type="submit" class="btn-primary">登录</button>
          <p id="error-msg" class="error-msg"></p>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form') as HTMLFormElement;
  const errorMsg = document.getElementById('error-msg') as HTMLParagraphElement;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const isAdminCheckbox = document.getElementById('isAdmin') as HTMLInputElement;

    const username = usernameInput.value.trim();
    const isAdmin = isAdminCheckbox.checked;

    // 模拟管理员账号限制
    if (isAdmin && username !== 'admin') {
      errorMsg.textContent = '管理员账号必须为 admin';
      return;
    }

    login(username, isAdmin);
    // 跳转到对应页面
    if (isAdmin || username === 'admin') {
      window.location.hash = '#/admin';
    } else {
      window.location.hash = '#/';
    }
  });
}
