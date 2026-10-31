// 用户角色类型
export type Role = 'user' | 'admin';

// 认证状态接口
interface AuthState {
  token: string;
  username: string;
  role: Role;
}

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';
const ROLE_KEY = 'role';

// 获取当前登录状态（从 localStorage 读取）
export function getAuthState(): AuthState | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const username = localStorage.getItem(USERNAME_KEY);
  const role = localStorage.getItem(ROLE_KEY) as Role | null;
  if (token && username && role) {
    return { token, username, role };
  }
  return null;
}

// 登录
export function login(username: string, isAdmin: boolean): void {
  const role: Role = isAdmin || username === 'admin' ? 'admin' : 'user';
  const token = 'mock-token-' + Date.now();
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
  localStorage.setItem(ROLE_KEY, role);
}

// 登出
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ROLE_KEY);
}

// 判断是否已登录
export function isLoggedIn(): boolean {
  return getAuthState() !== null;
}

// 获取当前用户角色
export function getRole(): Role | null {
  const state = getAuthState();
  return state ? state.role : null;
}

// 获取当前用户名
export function getUsername(): string | null {
  const state = getAuthState();
  return state ? state.username : null;
}
