import { API_CONFIG } from '../config/api';
import { getSession } from './session';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  token?: string;
  fallbackError: string;
}

export async function request<T>(
  path: string,
  { method = 'GET', body, auth = true, token, fallbackError }: RequestOptions
): Promise<T> {
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth || token) {
    const bearer = token ?? (await getSession())?.token;
    if (!bearer) {
      throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
    }
    headers.Authorization = `Bearer ${bearer}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || fallbackError);
    }
    return data as T;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('El servidor tardó demasiado en responder. Intenta de nuevo.');
    }
    if (err instanceof TypeError) {
      throw new Error('No fue posible conectar con el servidor. Revisa tu conexión.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
