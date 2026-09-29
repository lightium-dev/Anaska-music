import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/constants/theme';
import { usePlayerStore } from '../../src/store/playerStore';
import { MiniPlayer } from '../../src/components/MiniPlayer';

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

        const isDJMuse = route.name === 'chat';

        let iconName: any = 'home';
        let label = 'Home';

        if (route.name === 'index') {
          iconName = isFocused ? 'pulse' : 'pulse-outline';
          label = 'Home';
        } else if (route.name === 'search') {
          iconName = isFocused ? 'search' : 'search-outline';
          label = 'Search';
        } else if (route.name === 'chat') {
          iconName = isFocused ? 'sparkles' : 'sparkles-outline';
          label = 'DJ Muse';
        } else if (route.name === 'profile') {
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

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 12);
  const bottomTabBarHeight = 56 + safeBottom;

  const isChatRoute = pathname.includes('/chat');

  return (
    <View style={styles.flexContainer}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Handled by CustomTabBar
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="search" options={{ title: 'Search' }} />
        <Tabs.Screen name="chat" options={{ title: 'DJ Muse' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>

      {/* Docked MiniPlayer floating directly above the bottom tab bar */}
      {currentTrack && !isChatRoute && (
        <MiniPlayer
          onPress={() => router.push('/player')}
          bottomOffset={bottomTabBarHeight + 8}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
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
