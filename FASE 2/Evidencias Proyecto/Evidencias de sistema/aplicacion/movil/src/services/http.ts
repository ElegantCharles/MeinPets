import { API_CONFIG } from '../config/api';
import { expireSession, getSession } from './session';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  token?: string;
  fallbackError: string;
}

export type ApiErrorKind = 'network' | 'timeout' | 'http';

export class ApiError extends Error {
  kind: ApiErrorKind;
  status: number | null;

  constructor(message: string, kind: ApiErrorKind, status: number | null = null) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

export function isConnectionError(error: unknown): boolean {
  return error instanceof ApiError && (error.kind === 'network' || error.kind === 'timeout');
}

export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
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
      throw new ApiError('Tu sesión ha expirado. Inicia sesión nuevamente.', 'http', 401);
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
      if (response.status === 401 && auth && !token) {
        await expireSession();
      }
      throw new ApiError(data.error || fallbackError, 'http', response.status);
    }
    return data as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('El servidor tardó demasiado en responder. Intenta de nuevo.', 'timeout');
    }
    if (err instanceof TypeError) {
      throw new ApiError('No fue posible conectar con el servidor. Revisa tu conexión.', 'network');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
