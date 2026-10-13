import { Platform } from 'react-native';

export interface AuthUser {
  id: number;
  email: string;
  nombre_completo: string;
  created_at?: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = 'meinpets_auth_token';
const USER_KEY = 'meinpets_auth_user';

let memorySession: AuthSession | null = null;

function webStorage(): Storage | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export async function saveSession(session: AuthSession): Promise<void> {
  memorySession = session;
  try {
    const storage = webStorage();
    storage?.setItem(TOKEN_KEY, session.token);
    storage?.setItem(USER_KEY, JSON.stringify(session.user));
  } catch {
    return;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  if (memorySession) {
    return memorySession;
  }

  try {
    const storage = webStorage();
    const token = storage?.getItem(TOKEN_KEY);
    const rawUser = storage?.getItem(USER_KEY);
    if (token && rawUser) {
      memorySession = { token, user: JSON.parse(rawUser) as AuthUser };
    }
  } catch {
    return null;
  }

  return memorySession;
}

export async function clearSession(): Promise<void> {
  memorySession = null;
  try {
    const storage = webStorage();
    storage?.removeItem(TOKEN_KEY);
    storage?.removeItem(USER_KEY);
  } catch {
    return;
  }
}
