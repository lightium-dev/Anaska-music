import React from 'react';
import { ProfileScreen } from '../../src/screens/ProfileScreen';
import { useAppNavigation } from '../../src/navigation/navigationAdapter';

export default function ProfileRoute() {
  const navigation = useAppNavigation();
  return <ProfileScreen navigation={navigation} />;
}
