import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';
import { useUserStore } from '../store/userStore';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useUserStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of Anaska?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.primary} />
          </View>
          <Text style={styles.username}>{user?.username || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'user@anaska.com'}</Text>
        </View>

        {/* Music Preferences Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Preferred Genres</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('GenreSelect', { isEditing: true })}
            >
              <Text style={styles.editAction}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.genresWrapper}>
            {user?.genrePreferences && user.genrePreferences.length > 0 ? (
              user.genrePreferences.map((g) => (
                <View key={g} style={styles.genreBadge}>
                  <Text style={styles.genreBadgeText}>{g}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noPreferencesText}>No preferred genres set yet.</Text>
            )}
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Anaska</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0 (Build 2026)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>AI Assistant</Text>
            <Text style={styles.infoValue}>DJ Muse (SSE + RAG)</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
    paddingTop: 60,
    paddingBottom: 110,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  username: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  editAction: {
    color: colors.primaryAccent,
    fontSize: 14,
    fontWeight: '600',
  },
  genresWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genreBadgeText: {
    color: colors.primaryAccent,
    fontSize: 13,
    fontWeight: '500',
  },
  noPreferencesText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(207, 102, 121, 0.1)',
    borderWidth: 1,
    borderColor: colors.error,
    gap: 8,
    marginTop: spacing.md,
  },
  logoutText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
