import React from 'react';
import { UsernameScreen } from '../src/screens/UsernameScreen';
import { useAppNavigation } from '../src/navigation/navigationAdapter';

export default function UsernameInputRoute() {
  const navigation = useAppNavigation();
  return <UsernameScreen navigation={navigation} />;
}
