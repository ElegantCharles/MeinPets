import { CommonActions } from '@react-navigation/native';

type Dispatcher = { dispatch: (action: ReturnType<typeof CommonActions.reset>) => void };

export function resetTo(navigation: Dispatcher, name: string): void {
  navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name }] }));
}
