export type AuthUser = {
  id: string;
  email: string;
  username: string;
};

type AuthResponse = { user: AuthUser } | { error: string };

async function request(path: string, body?: Record<string, string>) {
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    credentials: "same-origin",
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await response.json()) as AuthResponse;
  if (!response.ok || "error" in data) {
    throw new Error("error" in data ? data.error : "请求失败，请稍后重试");
  }
  return data.user;
}

export function signUp(email: string, password: string, username: string) {
  return request("/api/auth/register", { email, password, username });
}

export function signInWithEmail(email: string, password: string) {
  return request("/api/auth/login", { email, password });
}

export async function signOut() {
  await request("/api/auth/logout", {});
}

export function getCurrentUser() {
  return request("/api/auth/me");
}

export async function signInWithPhone() {
  throw new Error("手机号登录尚未启用");
}

export async function verifyOtp() {
  throw new Error("手机号登录尚未启用");
}

export async function resetPassword(_email: string) {
  void _email;
  throw new Error("密码重置邮件尚未配置");
}
