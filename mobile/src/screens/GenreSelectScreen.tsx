import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { musicService } from '../services/musicService';
import { apiRequest } from '../services/api';
import { useUserStore } from '../store/userStore';
import { Genre } from '../types';

interface GenreSelectScreenProps {
  navigation: any;
  route?: any;
}

const DEFAULT_GENRES: Genre[] = [
  { id: 'synthwave', name: 'Synthwave & Retrowave' },
  { id: 'electronic', name: 'Electronic & Cyberpunk' },
  { id: 'lofi', name: 'Lo-Fi Chill & Beats' },
  { id: 'ambient', name: 'Ambient & Deep Focus' },
  { id: 'rock', name: 'Alternative & Indie Rock' },
  { id: 'hiphop', name: 'Hip-Hop & Urban R&B' },
  { id: 'techno', name: 'Sub-Zero Techno' },
  { id: 'chillwave', name: 'Arctic Chillwave' },
  { id: 'frost', name: 'Glacial Bass & Trance' },
];

export const GenreSelectScreen: React.FC<GenreSelectScreenProps> = ({ navigation, route }) => {
  const isEditingFromProfile = route?.params?.isEditing;
  const { user, updateGenres } = useUserStore();

  const [genres, setGenres] = useState<Genre[]>(DEFAULT_GENRES);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    user?.genrePreferences && user.genrePreferences.length > 0
      ? user.genrePreferences
      : ['synthwave', 'electronic', 'lofi']
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGenres() {
      try {
        const data = await musicService.getGenres();
        if (data && data.length > 0) {
          // Merge with sub-zero flavor
          setGenres((prev) => {
            const combined = [...data];
            DEFAULT_GENRES.forEach((dg) => {
              if (!combined.some((c) => c.id === dg.id)) combined.push(dg);
            });
            return combined;
          });
        }
      } catch (err) {
        // Keep defaults
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
      setError('Please select at least 1 frequency to prime DJ Muse');
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
    } catch (err: any) {
      updateGenres(selectedIds);
      if (isEditingFromProfile) {
        navigation.goBack();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topAura} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar (Only during onboarding) */}
        {!isEditingFromProfile && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={['#00F2FE', '#38BDF8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBar, { width: '100%' }]}
              />
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={styles.stepBadge}>STEP 02 / 02</Text>
              <Text style={styles.stepTitle}>SONIC FREQUENCIES</Text>
            </View>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select your frequencies</Text>
          <Text style={styles.subtitle}>
            Pick 3 or more genres to prime the DJ Muse generative recommendation engine.
          </Text>

          <View style={styles.counterRow}>
            <View style={styles.counterBadge}>
              <Ionicons name="radio" size={13} color={colors.primary} />
              <Text style={styles.counterText}>{selectedIds.length} FREQUENCIES SELECTED</Text>
            </View>
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Glowing Frequency Chips Grid */}
        <View style={styles.chipGrid}>
          {genres.map((genre) => {
            const isSelected = selectedIds.includes(genre.id);
            return (
              <TouchableOpacity
                key={genre.id}
                onPress={() => toggleGenre(genre.id)}
                activeOpacity={0.8}
                style={[styles.chipOuter, isSelected && styles.chipOuterSelected]}
              >
                {isSelected ? (
                  <LinearGradient
                    colors={['#00F2FE', '#38BDF8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.chipSelectedGradient}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#002022" />
                    <Text style={styles.chipTextSelected}>{genre.name}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.chipUnselected}>
                    <Text style={styles.chipTextUnselected}>{genre.name}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.buttonOuter}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#00F2FE', '#38BDF8', '#0284C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            {saving ? (
              <ActivityIndicator color="#002022" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {isEditingFromProfile ? 'Save Frequencies' : 'Enter the Stream'}
                </Text>
                <MaterialCommunityIcons name="waveform" size={20} color="#002022" />
              </>
            )}
          </LinearGradient>
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
  topAura: {
    position: 'absolute',
    top: -120,
    alignSelf: 'center',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 20,
    paddingBottom: 110,
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepBadge: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  stepTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  counterRow: {
    flexDirection: 'row',
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.35)',
  },
  counterText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 85, 85, 0.15)',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    flex: 1,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipOuter: {
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.2)',
    backgroundColor: 'rgba(11, 21, 40, 0.8)',
  },
  chipOuterSelected: {
    borderColor: 'rgba(56, 189, 248, 0.6)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 6,
  },
  chipSelectedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.pill,
  },
  chipUnselected: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipTextSelected: {
    color: '#002022',
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextUnselected: {
    color: colors.textFrost,
    fontSize: 13,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: 'rgba(7, 11, 20, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 242, 254, 0.15)',
  },
  buttonOuter: {
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  buttonText: {
    color: '#002022',
    fontSize: 16,
    fontWeight: '800',
  },
});
