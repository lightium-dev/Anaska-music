import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { colors, spacing } from '../constants/theme';
import { musicService } from '../services/musicService';
import { apiRequest } from '../services/api';
import { useUserStore } from '../store/userStore';
import { Genre } from '../types';

interface GenreSelectScreenProps {
  navigation: any;
  route?: any;
}

export const GenreSelectScreen: React.FC<GenreSelectScreenProps> = ({ navigation, route }) => {
  const isEditingFromProfile = route?.params?.isEditing;
  const { user, updateGenres } = useUserStore();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(user?.genrePreferences || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGenres() {
      try {
        setLoading(true);
        const data = await musicService.getGenres();
        setGenres(data);
      } catch (err: any) {
        // Fallback default genres if offline
        setGenres([
          { id: 'synthwave', name: 'Synthwave & Retrowave' },
          { id: 'lofi', name: 'Lo-Fi Chill & Beats' },
          { id: 'electronic', name: 'Electronic & Dance' },
          { id: 'ambient', name: 'Ambient & Deep Focus' },
          { id: 'rock', name: 'Alternative & Indie Rock' },
          { id: 'hiphop', name: 'Hip-Hop & R&B' },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadGenres();
  }, []);

  const toggleGenre = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) {
      setError('Please select at least 1 genre to personalize your music');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await apiRequest('/api/auth/preferences', {
        method: 'PUT',
        body: JSON.stringify({ genres: selectedIds }),
      });

      updateGenres(selectedIds);

      if (isEditingFromProfile) {
        navigation.goBack();
      }
      // Zustand isOnboarded state will automatically trigger MainTabs navigation in RootNavigator!
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
      // Even if offline, persist locally in Zustand store so user can proceed
      updateGenres(selectedIds);
      if (isEditingFromProfile) navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.step}>
          {isEditingFromProfile ? 'MUSIC PREFERENCES' : 'STEP 2 OF 2'}
        </Text>
        <Text style={styles.title}>What do you love listening to?</Text>
        <Text style={styles.subtitle}>
          Tap your favorite genres. DJ Muse will tailor suggestions and your home feed.
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.chipsContainer}>
          {genres.map((g) => {
            const isSelected = selectedIds.includes(g.id);
            return (
              <TouchableOpacity
                key={g.id}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleGenre(g.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {isSelected ? '✓ ' : '+ '}
                  {g.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, selectedIds.length === 0 && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.buttonText}>
              {isEditingFromProfile ? 'Save Preferences' : `Start Listening (${selectedIds.length})`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: spacing.lg,
    paddingTop: 40,
    paddingBottom: 100,
  },
  step: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(207, 102, 121, 0.15)',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryAccent,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#000000',
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
