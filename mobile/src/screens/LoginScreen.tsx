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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { loginSchema, signupSchema } from '../utils/validators';
import { apiRequest } from '../services/api';
import { useUserStore } from '../store/userStore';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tunedIn, setTunedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setUser, setTokens } = useUserStore();

  const handleAuth = async () => {
    try {
      setError(null);
      setLoading(true);

      if (isLoginTab) {
        loginSchema.parse({ login: email || username, password });
        const res = await apiRequest<{
          success: boolean;
          data: { user: any; tokens: { accessToken: string; refreshToken: string } };
        }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ login: email || username, password }),
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
      } else {
        signupSchema.parse({ username, email, password });
        const res = await apiRequest<{
          success: boolean;
          data: { user: any; tokens: { accessToken: string; refreshToken: string } };
        }>('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ username, email, password, genrePreferences: [] }),
        });

        const { user, tokens } = res.data;
        await setTokens(tokens.accessToken, tokens.refreshToken);
        setUser({
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          genrePreferences: [],
          createdAt: user.created_at || user.createdAt,
        });
      }
    } catch (err: any) {
      if (err.errors && err.errors[0]) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Subtle Arctic Aura Background Blobs */}
        <View style={styles.topAura} />

        {/* Brand Logo & Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoRingWrapper}>
            <View style={styles.logoGlow} />
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.brandTitle}>Anaska</Text>
          <Text style={styles.brandSubtitle}>Sonic streaming augmented by intelligence</Text>

          <View style={styles.neuralLinkBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.neuralLinkText}>NEURAL LINK ACTIVE</Text>
          </View>
        </View>

        {/* Auth Glass Card */}
        <View style={styles.authCard}>
          {/* Segmented Pill Toggle */}
          <View style={styles.pillToggleContainer}>
            <TouchableOpacity
              style={[styles.pillButton, isLoginTab && styles.pillButtonActive]}
              onPress={() => {
                setIsLoginTab(true);
                setError(null);
              }}
              activeOpacity={0.8}
            >
              {isLoginTab ? (
                <LinearGradient
                  colors={['#00F2FE', '#38BDF8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.pillGradient}
                >
                  <Ionicons name="lock-open-outline" size={16} color="#002022" />
                  <Text style={styles.pillTextActive}>Log In</Text>
                </LinearGradient>
              ) : (
                <View style={styles.pillInactiveContent}>
                  <Ionicons name="lock-open-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.pillTextInactive}>Log In</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pillButton, !isLoginTab && styles.pillButtonActive]}
              onPress={() => {
                setIsLoginTab(false);
                setError(null);
              }}
              activeOpacity={0.8}
            >
              {!isLoginTab ? (
                <LinearGradient
                  colors={['#00F2FE', '#38BDF8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.pillGradient}
                >
                  <Ionicons name="person-add-outline" size={16} color="#002022" />
                  <Text style={styles.pillTextActive}>Sign Up</Text>
                </LinearGradient>
              ) : (
                <View style={styles.pillInactiveContent}>
                  <Ionicons name="person-add-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.pillTextInactive}>Sign Up</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form Fields */}
          {!isLoginTab && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sonic Handle / Username</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="at-outline" size={18} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="astral_tempo"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Audio Frequency Identity (Email)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="neo@anaska.fm"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.inputLabel}>Cipher Key (Password)</Text>
              {isLoginTab && (
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.forgotPasswordText}>Forgot Key?</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={18} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { paddingRight: 40 }]}
                placeholder="••••••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tuned-In Option Row */}
          <View style={styles.tunedInRow}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setTunedIn(!tunedIn)}
              activeOpacity={0.8}
            >
              <View style={[styles.customCheckbox, tunedIn && styles.customCheckboxActive]}>
                {tunedIn && <Ionicons name="checkmark" size={13} color="#002022" />}
              </View>
              <Text style={styles.tunedInLabel}>Keep me tuned in</Text>
            </TouchableOpacity>

            <View style={styles.autoSyncBadge}>
              <Ionicons name="pulse" size={13} color={colors.primary} />
              <Text style={styles.autoSyncText}>AUTO-SYNC</Text>
            </View>
          </View>

          {/* Action Button: "Enter the Stream" */}
          <TouchableOpacity
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.85}
            style={styles.submitButtonOuter}
          >
            <LinearGradient
              colors={['#00F2FE', '#38BDF8', '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator color="#002022" size="small" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>
                    {isLoginTab ? 'Enter the Stream' : 'Initialize Frequency'}
                  </Text>
                  <MaterialCommunityIcons name="waveform" size={20} color="#002022" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Social Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONNECT WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Logins: Apple / Google / Spotify */}
          <View style={styles.socialGrid}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Ionicons name="logo-apple" size={20} color={colors.textFrost} />
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Ionicons name="logo-google" size={18} color={colors.textFrost} />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="spotify" size={20} color={colors.primary} />
              <Text style={styles.socialText}>Spotify</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    justifyContent: 'center',
  },
  topAura: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0, 242, 254, 0.12)',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoRingWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 242, 254, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(10, 17, 34, 0.85)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 8,
  },
  logoGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 242, 254, 0.25)',
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 242, 254, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  brandSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  neuralLinkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.25)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  neuralLinkText: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  authCard: {
    backgroundColor: 'rgba(10, 17, 34, 0.85)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 10,
  },
  pillToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(5, 9, 20, 0.95)',
    borderRadius: borderRadius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.15)',
    marginBottom: spacing.lg,
  },
  pillButton: {
    flex: 1,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
  },
  pillButtonActive: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 4,
  },
  pillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: borderRadius.pill,
  },
  pillInactiveContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  pillTextActive: {
    color: '#002022',
    fontSize: 14,
    fontWeight: '700',
  },
  pillTextInactive: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
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
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    color: 'rgba(224, 242, 254, 0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotPasswordText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: colors.textFrost,
    fontSize: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  eyeIcon: {
    padding: 6,
  },
  tunedInRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'rgba(14, 23, 42, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCheckboxActive: {
    backgroundColor: colors.primary,
  },
  tunedInLabel: {
    color: colors.textFrost,
    fontSize: 13,
    fontWeight: '500',
  },
  autoSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  autoSyncText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  submitButtonOuter: {
    marginTop: spacing.md,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 8,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: borderRadius.pill,
  },
  submitButtonText: {
    color: '#002022',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
  },
  dividerText: {
    marginHorizontal: 12,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    backgroundColor: 'rgba(14, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.18)',
    borderRadius: borderRadius.md,
  },
  socialText: {
    color: colors.textFrost,
    fontSize: 12,
    fontWeight: '600',
  },
});
