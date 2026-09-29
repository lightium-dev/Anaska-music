import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { GenreSelectScreen } from '../src/screens/GenreSelectScreen';
import { useAppNavigation } from '../src/navigation/navigationAdapter';

export default function GenreSelectRoute() {
  const navigation = useAppNavigation();
  const params = useLocalSearchParams();

  return (
    <GenreSelectScreen
      navigation={navigation}
      route={{ params }}
    />
  );
}
