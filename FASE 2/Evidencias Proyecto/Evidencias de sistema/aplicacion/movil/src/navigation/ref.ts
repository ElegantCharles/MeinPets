import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function goToSessionExpired(): void {
  if (navigationRef.isReady()) {
    navigationRef.resetRoot({ index: 0, routes: [{ name: 'SessionExpired' }] });
  }
}
