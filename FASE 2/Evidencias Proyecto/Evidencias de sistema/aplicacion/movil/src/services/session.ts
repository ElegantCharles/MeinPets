import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

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
const isWeb = Platform.OS === 'web';

let memorySession: AuthSession | null = null;
let expiring = false;
const expiredListeners = new Set<() => void>();

function webStorage(): Storage | null {
  if (!isWeb || typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

async function writeItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    webStorage()?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function readItem(key: string): Promise<string | null> {
  if (isWeb) {
    return webStorage()?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    webStorage()?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export function peekSession(): AuthSession | null {
  return memorySession;
}

export async function saveSession(session: AuthSession): Promise<void> {
  memorySession = session;
  try {
    await writeItem(TOKEN_KEY, session.token);
    await writeItem(USER_KEY, JSON.stringify(session.user));
  } catch {
    return;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  if (memorySession) {
    return memorySession;
  }

  try {
    const token = await readItem(TOKEN_KEY);
    const rawUser = await readItem(USER_KEY);
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
    await removeItem(TOKEN_KEY);
    await removeItem(USER_KEY);
  } catch {
    return;
  }
}

export function onSessionExpired(listener: () => void): () => void {
  expiredListeners.add(listener);
  return () => {
    expiredListeners.delete(listener);
  };
}

export async function expireSession(): Promise<void> {
  if (expiring) {
    return;
  }
  expiring = true;
  try {
    const hadSession = Boolean(await getSession());
    await clearSession();
    if (hadSession) {
      expiredListeners.forEach((listener) => listener());
    }
  } finally {
    expiring = false;
  }
}
