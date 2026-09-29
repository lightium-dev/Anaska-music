import React from 'react';
import { LoginScreen } from '../src/screens/LoginScreen';
import { useAppNavigation } from '../src/navigation/navigationAdapter';

export default function LoginRoute() {
  const navigation = useAppNavigation();
  return <LoginScreen navigation={navigation} />;
}
