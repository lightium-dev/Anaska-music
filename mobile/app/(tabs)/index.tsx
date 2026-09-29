import React from 'react';
import { HomeScreen } from '../../src/screens/HomeScreen';
import { useAppNavigation } from '../../src/navigation/navigationAdapter';

export default function HomeRoute() {
  const navigation = useAppNavigation();
  return <HomeScreen navigation={navigation} />;
}
