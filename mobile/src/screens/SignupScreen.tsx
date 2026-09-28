import React from 'react';
import { LoginScreen } from './LoginScreen';

export const SignupScreen: React.FC<{ navigation: any }> = (props) => {
  return <LoginScreen {...props} />;
};
