import axios from "axios";

const authApi = axios.create({
  baseURL: "/authApi",
});

export interface LoginParams {
  account: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  password: string;
  phone: string;
  verifyCode: string;
}

interface AuthResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

interface LoginData {
  userId: string;
  token: string;
  expireTime: string;
  username: string;
}

export async function authLogin(params: LoginParams) {
  const res = await authApi.post<AuthResponse<LoginData>>("/user/login", {
    ...params,
    loginIp: "127.0.0.1",
  });
  return res.data;
}

export async function authRegister(params: RegisterParams) {
  const res = await authApi.post<AuthResponse>("/user/register", params);
  return res.data;
}

export async function authLogout(token: string) {
  const res = await authApi.post<AuthResponse>(
    "/user/logout",
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}
