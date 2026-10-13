import { Platform } from 'react-native';

const API_HOST = Platform.OS === 'web' ? 'localhost' : '172.20.10.5';

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL ?? `http://${API_HOST}:3000/api`,
  TIMEOUT_MS: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      ME: '/auth/me',
    },
    SPECIES: {
      LIST: '/species',
      BREEDS: (especieId: string | number) => `/species/${especieId}/breeds`,
    },
    PETS: {
      LIST: '/pets',
      DETAIL: (id: string | number) => `/pets/${id}`,
      TUTORS: (id: string | number) => `/pets/${id}/tutors`,
      TREATMENTS: (petId: string | number) => `/pets/${petId}/treatments`,
      TREATMENT_DETAIL: (petId: string | number, recordId: string | number) =>
        `/pets/${petId}/treatments/${recordId}`,
    },
    TREATMENTS: {
      CATALOG: '/treatments',
    },
    CALENDAR: {
      LIST: '/calendar',
    },
    MAP: {
      LOCATIONS: '/map/locations',
    },
  },
};
