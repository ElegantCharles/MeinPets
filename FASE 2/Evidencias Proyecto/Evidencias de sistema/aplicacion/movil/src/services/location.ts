import * as Location from 'expo-location';
import { MAP_CONFIG } from '../config/map';

export type UserLocationResult =
  | { status: 'ok'; latitude: number; longitude: number }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'unavailable' };

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

export async function getUserLocation(): Promise<UserLocationResult> {
  try {
    let permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted && permission.canAskAgain) {
      permission = await Location.requestForegroundPermissionsAsync();
    }
    if (!permission.granted) {
      return { status: 'denied', canAskAgain: permission.canAskAgain };
    }
    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      MAP_CONFIG.LOCATION_TIMEOUT_MS
    );
    return {
      status: 'ok',
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return { status: 'unavailable' };
  }
}
