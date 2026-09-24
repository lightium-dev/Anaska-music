import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../constants/theme';
import { useUserStore } from '../store/userStore';
import { usePlayerStore } from '../store/playerStore';

import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { UsernameScreen } from '../screens/UsernameScreen';
import { GenreSelectScreen } from '../screens/GenreSelectScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { MiniPlayer } from '../components/MiniPlayer';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatScreen}
        options={{
          tabBarLabel: 'DJ Muse',
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function MainWithPlayer({ navigation }: any) {
  const { currentTrack } = usePlayerStore();

  return (
    <View style={styles.flexContainer}>
      <MainTabs />
      {currentTrack && <MiniPlayer onPress={() => navigation.navigate('PlayerModal')} />}
    </View>
  );
}

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isOnboarded, loadStoredAuth } = useUserStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function init() {
      await loadStoredAuth();
      setInitializing(false);
    }
    init();
  }, []);

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth flow
          <RootStack.Group>
            <RootStack.Screen name="Login" component={LoginScreen} />
            <RootStack.Screen name="Signup" component={SignupScreen} />
          </RootStack.Group>
        ) : !isOnboarded ? (
          // Onboarding flow
          <RootStack.Group>
            <RootStack.Screen name="UsernameInput" component={UsernameScreen} />
            <RootStack.Screen name="OnboardingGenres" component={GenreSelectScreen} />
          </RootStack.Group>
        ) : (
          // Main App flow
          <RootStack.Group>
            <RootStack.Screen name="Main" component={MainWithPlayer} />
            <RootStack.Screen name="GenreSelect" component={GenreSelectScreen} />
            <RootStack.Screen
              name="PlayerModal"
              component={PlayerScreen}
              options={{ presentation: 'modal' }}
            />
          </RootStack.Group>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
