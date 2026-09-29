import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, borderRadius } from '../constants/theme';
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

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 12);

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: safeBottom }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const isDJMuse = route.name === 'ChatTab';

        let iconName: any = 'home';
        let label = 'Home';

        if (route.name === 'HomeTab') {
          iconName = isFocused ? 'pulse' : 'pulse-outline';
          label = 'Home';
        } else if (route.name === 'SearchTab') {
          iconName = isFocused ? 'search' : 'search-outline';
          label = 'Search';
        } else if (route.name === 'ChatTab') {
          iconName = isFocused ? 'sparkles' : 'sparkles-outline';
          label = 'DJ Muse';
        } else if (route.name === 'ProfileTab') {
          iconName = isFocused ? 'person' : 'person-outline';
          label = 'Profile';
        }

        if (isDJMuse) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.75}
              style={styles.tabItem}
            >
              <View
                style={[
                  styles.djMuseBox,
                  isFocused && styles.djMuseBoxActive,
                ]}
              >
                <Ionicons
                  name="sparkles"
                  size={18}
                  color={isFocused ? colors.primaryLight : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tabItem}
          >
            <Ionicons
              name={iconName}
              size={20}
              color={isFocused ? colors.primaryLight : colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs({ onTabChange }: { onTabChange: (tabName: string) => void }) {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      screenListeners={{
        state: (e: any) => {
          const routeName = e.data?.state?.routes?.[e.data?.state?.index]?.name;
          if (routeName) {
            onTabChange(routeName);
          }
        },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="SearchTab" component={SearchScreen} />
      <Tab.Screen name="ChatTab" component={ChatScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainWithPlayer({ navigation }: any) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const [currentTab, setCurrentTab] = useState('HomeTab');
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 12);
  const bottomTabBarHeight = 56 + safeBottom;

  const handleTabChange = useCallback((tabName: string) => {
    setCurrentTab((prev) => (prev !== tabName ? tabName : prev));
  }, []);

  const isAISection = currentTab === 'ChatTab';

  return (
    <View style={styles.flexContainer}>
      <MainTabs onTabChange={handleTabChange} />
      {currentTrack && !isAISection && (
        <MiniPlayer
          onPress={() => navigation.navigate('PlayerModal')}
          bottomOffset={bottomTabBarHeight + 42}
        />
      )}
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
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#262626',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: colors.textMuted,
  },
  djMuseBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  djMuseBoxActive: {
    borderColor: colors.primaryLight,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
});
