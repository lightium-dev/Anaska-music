import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { useUserStore } from '../store/userStore';
import { apiRequest } from '../services/api';

interface UsernameScreenProps {
  navigation: any;
}

export const UsernameScreen: React.FC<UsernameScreenProps> = ({ navigation }) => {
  const { user, setUser } = useUserStore();
  const [username, setUsername] = useState(user?.username || 'astral_tempo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest<{ success: boolean; data: any }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ username: username.trim() }),
      });

      if (user) {
        setUser({ ...user, username: res.data.username });
      }
      navigation.navigate('OnboardingGenres');
    } catch (err: any) {
      setError(err.message || 'Failed to update username');
      if (user) {
        setUser({ ...user, username: username.trim() });
      }
      navigation.navigate('OnboardingGenres');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topAura} />

      <View style={styles.content}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={['#00F2FE', '#38BDF8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBar, { width: '50%' }]}
            />
          </View>
          <View style={styles.progressLabelRow}>
            <Text style={styles.stepBadge}>STEP 01 / 02</Text>
            <Text style={styles.stepTitle}>SONIC IDENTITY</Text>
          </View>
        </View>

        {/* Card Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose your handle</Text>
          <Text style={styles.subtitle}>
            Your personal wavelength address across audio rooms and DJ Muse sets.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Input Card */}
        <View style={styles.glassCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.label}>SONIC HANDLE</Text>
            <View style={styles.availableBadge}>
              <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
              <Text style={styles.availableText}>AVAILABLE</Text>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.atSymbol}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="astral_tempo"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
              autoFocus
            />
            <View style={styles.checkBubble}>
              <Ionicons name="checkmark" size={14} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.hint}>Used by DJ Muse for personalized intros and set credits.</Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.buttonOuter}
          onPress={handleContinue}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#00F2FE', '#38BDF8', '#0284C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#002022" />
            ) : (
              <>
                <Text style={styles.buttonText}>Proceed to Frequencies</Text>
                <Ionicons name="arrow-forward" size={18} color="#002022" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  topAura: {
    position: 'absolute',
    top: -100,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
  },
  content: {
    width: '100%',
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
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  glassCard: {
    backgroundColor: 'rgba(10, 17, 34, 0.85)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availableText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.35)',
    borderRadius: borderRadius.pill,
    paddingHorizontal: 16,
    marginBottom: spacing.sm,
  },
  atSymbol: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 4,
  },
  input: {
    flex: 1,
    color: colors.textFrost,
    fontSize: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontWeight: '500',
  },
  checkBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
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
