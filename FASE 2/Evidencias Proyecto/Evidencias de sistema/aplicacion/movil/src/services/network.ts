import { useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { API_CONFIG } from '../config/api';

let online = true;
let started = false;
const listeners = new Set<(value: boolean) => void>();

function start(): void {
  if (started) {
    return;
  }
  started = true;
  NetInfo.configure({
    reachabilityUrl: `${API_CONFIG.BASE_URL}/health`,
    reachabilityTest: async (response) => response.status === 200,
    reachabilityLongTimeout: 60 * 1000,
    reachabilityShortTimeout: 5 * 1000,
    reachabilityRequestTimeout: 15 * 1000,
  });
  NetInfo.addEventListener((state) => {
    const next = state.isConnected !== false;
    if (next === online) {
      return;
    }
    online = next;
    listeners.forEach((listener) => listener(next));
  });
}

export function useOnline(): boolean {
  start();
  const [value, setValue] = useState(online);
  useEffect(() => {
    listeners.add(setValue);
    setValue(online);
    return () => {
      listeners.delete(setValue);
    };
  }, []);
  return value;
}

export function useOnReconnect(callback: () => void): void {
  const ref = useRef(callback);
  ref.current = callback;
  useEffect(() => {
    start();
    const listener = (value: boolean) => {
      if (value) {
        ref.current();
      }
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
}
