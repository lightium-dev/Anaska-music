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
  ScrollView,
} from 'react-native';
import { colors, spacing } from '../constants/theme';
import { loginSchema } from '../utils/validators';
import { apiRequest } from '../services/api';
import { useUserStore } from '../store/userStore';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setUser, setTokens } = useUserStore();

  const handleLogin = async () => {
    try {
      setError(null);
      loginSchema.parse({ login: loginInput, password });

      setLoading(true);
      const res = await apiRequest<{
        success: boolean;
        data: { user: any; tokens: { accessToken: string; refreshToken: string } };
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login: loginInput, password }),
      });

      const { user, tokens } = res.data;
      await setTokens(tokens.accessToken, tokens.refreshToken);
      setUser({
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        genrePreferences: user.genre_preferences || user.genrePreferences || [],
        createdAt: user.created_at || user.createdAt,
      });
    } catch (err: any) {
      if (err.errors && err.errors[0]) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.brand}>ANASKA</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Stream music & chat with DJ Muse AI</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Username or Email</Text>
          <TextInput
            style={styles.input}
            placeholder="demo@anaska.com or username"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            value={loginInput}
            onChangeText={setLoginInput}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.switchText}>
              Don't have an account? <Text style={styles.switchHighlight}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brand: {
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 3,
    fontSize: 14,
    marginBottom: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: 'rgba(207, 102, 121, 0.15)',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    fontSize: 15,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  switchButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  switchText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  switchHighlight: {
    color: colors.primaryAccent,
    fontWeight: 'bold',
  },
});
