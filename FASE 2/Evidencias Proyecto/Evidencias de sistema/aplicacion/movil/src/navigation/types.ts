import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type TabParamList = {
  Pets: undefined;
  Calendar: undefined;
  Map: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  PetForm: { petId?: number } | undefined;
  PetDetail: { petId: number };
  TreatmentForm: {
    petId: number;
    petName: string;
    especieId: number;
    recordId?: number;
  };
};

type TabScreenProps<K extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, K>,
  NativeStackScreenProps<RootStackParamList>
>;

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
export type PetFormScreenProps = NativeStackScreenProps<RootStackParamList, 'PetForm'>;
export type PetDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'PetDetail'>;
export type TreatmentFormScreenProps = NativeStackScreenProps<RootStackParamList, 'TreatmentForm'>;
export type PetsScreenProps = TabScreenProps<'Pets'>;
export type CalendarScreenProps = TabScreenProps<'Calendar'>;
export type MapScreenProps = TabScreenProps<'Map'>;
export type AccountScreenProps = TabScreenProps<'Account'>;
