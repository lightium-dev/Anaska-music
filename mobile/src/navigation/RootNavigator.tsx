import React, { useEffect, useState } from 'react';
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
        const { options } = descriptors[route.key];
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

        if (isDJMuse) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.85}
              style={styles.djMuseTabItem}
            >
              {/* Outer Glowing Cyan Halo */}
              <View style={styles.djMuseHaloWrapper}>
                <LinearGradient
                  colors={['#00F2FE', '#38BDF8', '#E0F2FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.djMuseHaloGradient}
                >
                  <View style={styles.djMuseInnerCircle}>
                    <Ionicons
                      name="sparkles"
                      size={22}
                      color={colors.primary}
                      style={{
                        textShadowColor: 'rgba(0, 242, 254, 0.7)',
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 8,
                      }}
                    />
                  </View>
                </LinearGradient>
              </View>
              <Text style={styles.djMuseLabel}>DJ Muse</Text>
            </TouchableOpacity>
          );
        }

        let iconName: any = 'home';
        let label = 'Home';

        if (route.name === 'HomeTab') {
          iconName = isFocused ? 'pulse' : 'pulse-outline';
          label = 'Home';
        } else if (route.name === 'SearchTab') {
          iconName = isFocused ? 'search' : 'search-outline';
          label = 'Search';
        } else if (route.name === 'ProfileTab') {
          iconName = isFocused ? 'person' : 'person-outline';
          label = 'Profile';
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.standardTabItem}
          >
            <Ionicons
              name={iconName}
              size={22}
              color={isFocused ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.standardTabLabel,
                isFocused ? styles.standardTabLabelActive : styles.standardTabLabelInactive,
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

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="SearchTab" component={SearchScreen} />
      <Tab.Screen name="ChatTab" component={ChatScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainWithPlayer({ navigation }: any) {
  const { currentTrack } = usePlayerStore();
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 12);
  const bottomTabBarHeight = 56 + safeBottom;

  return (
    <View style={styles.flexContainer}>
      <MainTabs />
      {currentTrack && (
        <MiniPlayer
          onPress={() => navigation.navigate('PlayerModal')}
          bottomOffset={bottomTabBarHeight + 22}
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
    backgroundColor: 'rgba(7, 11, 20, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 242, 254, 0.15)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  standardTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  standardTabLabel: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: '600',
  },
  standardTabLabelActive: {
    color: colors.primary,
  },
  standardTabLabelInactive: {
    color: colors.textSecondary,
  },
  djMuseTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -12,
  },
  djMuseHaloWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 10,
  },
  djMuseHaloGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  djMuseInnerCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#070B14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  djMuseLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
