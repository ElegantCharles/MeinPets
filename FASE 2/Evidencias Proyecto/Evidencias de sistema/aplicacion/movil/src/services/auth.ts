import { API_CONFIG } from '../config/api';
import { request } from './http';
import { saveSession } from './session';
import type { AuthSession, AuthUser } from './session';

export { clearSession, getSession, saveSession } from './session';
export type { AuthSession, AuthUser } from './session';

const { LOGIN, REGISTER, ME } = API_CONFIG.ENDPOINTS.AUTH;

export async function loginRequest(email: string, password: string): Promise<AuthSession> {
  const { token, user } = await request<AuthSession>(LOGIN, {
    method: 'POST',
    body: { email, password },
    auth: false,
    fallbackError: 'No fue posible iniciar sesión',
  });

  const session = { token, user };
  await saveSession(session);
  return session;
}

export async function registerRequest(
  nombreCompleto: string,
  email: string,
  password: string
): Promise<AuthUser> {
  const { user } = await request<{ user: AuthUser }>(REGISTER, {
    method: 'POST',
    body: { nombre_completo: nombreCompleto, email, password },
    auth: false,
    fallbackError: 'No fue posible completar el registro',
  });
  return user;
}

export async function fetchProfileRequest(token: string): Promise<AuthUser> {
  const { user } = await request<{ user: AuthUser }>(ME, {
    token,
    fallbackError: 'Sesión expirada',
  });
  return user;
}
