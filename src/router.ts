import { isLoggedIn, getRole, logout } from './auth';
import { renderLoginPage } from './views/login';
import { renderUserHome } from './views/userHome';
import { renderAdminDashboard } from './views/admin';

// 路由配置
type RouteHandler = () => void;

const routes: Record<string, RouteHandler> = {
  '#/login': () => {
    if (isLoggedIn()) {
      const role = getRole();
      window.location.hash = role === 'admin' ? '#/admin' : '#/';
      return;
    }
    renderLoginPage();
  },
  '#/': () => {
    if (!isLoggedIn()) {
      window.location.hash = '#/login';
      return;
    }
    if (getRole() !== 'user') {
      window.location.hash = '#/admin';
      return;
    }
    renderUserHome();
  },
  '#/admin': () => {
    if (!isLoggedIn()) {
      window.location.hash = '#/login';
      return;
    }
    if (getRole() !== 'admin') {
      window.location.hash = '#/';
      return;
    }
    renderAdminDashboard();
  },
};

// 处理当前路由
function handleRoute() {
  const hash = window.location.hash || '#/';
  const handler = routes[hash];

  if (handler) {
    handler();
    return;
  }

  // 未定义路由处理：如果以 #/admin 开头，已登录管理员重定向到 #/admin
  if (hash.startsWith('#/admin')) {
    if (!isLoggedIn()) {
      window.location.hash = '#/login';
    } else if (getRole() === 'admin') {
      window.location.hash = '#/admin';
    } else {
      window.location.hash = '#/';
    }
    return;
  }

  // 其他未知路由：已登录则跳转到其主页，未登录去登录页
  if (!isLoggedIn()) {
    window.location.hash = '#/login';
  } else {
    const role = getRole();
    window.location.hash = role === 'admin' ? '#/admin' : '#/';
  }
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}