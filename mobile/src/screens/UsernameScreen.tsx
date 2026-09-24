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
import { colors, spacing } from '../constants/theme';
import { useUserStore } from '../store/userStore';
import { apiRequest } from '../services/api';

interface UsernameScreenProps {
  navigation: any;
}

export const UsernameScreen: React.FC<UsernameScreenProps> = ({ navigation }) => {
  const { user, setUser } = useUserStore();
  const [username, setUsername] = useState(user?.username || '');
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.step}>STEP 1 OF 2</Text>
        <Text style={styles.title}>What should we call you?</Text>
        <Text style={styles.subtitle}>
          Choose your unique sound handle for DJ Muse and fellow listeners.
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Your username"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
          autoFocus
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.buttonText}>Next</Text>
          )}
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
  content: {
    width: '100%',
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    padding: spacing.md,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
