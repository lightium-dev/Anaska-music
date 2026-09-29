import React from 'react';
import { PlayerScreen } from '../src/screens/PlayerScreen';
import { useAppNavigation } from '../src/navigation/navigationAdapter';

export default function PlayerRoute() {
  const navigation = useAppNavigation();
  return <PlayerScreen navigation={navigation} />;
}
