import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius } from '../constants/theme';
import { useUserStore } from '../store/userStore';
import { apiRequest } from '../services/api';

const isCustomAvatar = (uri?: string): boolean => {
  if (!uri) return false;
  return (
    uri.startsWith('http://') ||
    uri.startsWith('https://') ||
    uri.startsWith('file:') ||
    uri.startsWith('content:') ||
    uri.startsWith('data:')
  );
};

const AVATAR_PRESETS = [
  {
    id: 'default',
    title: 'DJ Muse Cyber',
    subtitle: 'Default Persona',
    uri: '',
  },
  {
    id: 'glacial_dj',
    title: 'Glacial DJ',
    subtitle: 'Frost Neon',
    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'synthwave_pilot',
    title: 'Synth Pilot',
    subtitle: 'Retro Horizon',
    uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'subzero_producer',
    title: 'Sub-Zero',
    subtitle: 'Electronic Producer',
    uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'lofi_dreamer',
    title: 'Lo-Fi Dreamer',
    subtitle: 'Pastel Sunset',
    uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'ambient_seeker',
    title: 'Astral Flow',
    subtitle: 'Deep Focus',
    uri: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  },
];

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout, updateAvatar } = useUserStore();

  const [spatialAudio, setSpatialAudio] = useState(true);
  const [smartTransitions, setSmartTransitions] = useState(true);
  const [cryoEq, setCryoEq] = useState(true);

  // Avatar Modal State
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);

  const handleSaveAvatar = async (url: string) => {
    try {
      setSavingAvatar(true);
      await updateAvatar(url);
      await apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ avatar: url }),
      }).catch((e) => console.warn('Could not sync avatar to backend:', e));
      setIsAvatarModalVisible(false);
      setCustomAvatarUrl('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save avatar');
    } finally {
      setSavingAvatar(false);
    }
  };

  const pickImageFromDevice = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo Library Access Required',
          'Please allow storage permissions to select a photo from your phone.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        await handleSaveAvatar(localUri);
      }
    } catch (e: any) {
      console.warn('Image picker error:', e);
      Alert.alert('Error', 'Unable to pick image from internal storage.');
    }
  };

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

  const genres = user?.genrePreferences && user.genrePreferences.length > 0
    ? user.genrePreferences
    : ['Synthwave', 'Electronic', 'Ambient', 'Cyberpunk'];

  return (
    <View style={styles.container}>
      <View style={styles.topAura} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.metaLabel}>USER CENTER</Text>
            <Text style={styles.pageTitle}>Sonic Profile & Settings</Text>
          </View>

          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('GenreSelect', { isEditing: true })}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Cyberpunk User Card with Glowing Avatar & Beacon */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => setIsAvatarModalVisible(true)}
            activeOpacity={0.85}
            accessibilityLabel="Change profile picture"
          >
            <LinearGradient
              colors={['#00F2FE', '#38BDF8', '#91F1FF']}
              style={styles.avatarRing}
            >
              <Image
                source={
                  user?.avatar && isCustomAvatar(user.avatar)
                    ? { uri: user.avatar }
                    : require('../../assets/avatar.png')
                }
                style={styles.avatarImg}
              />
            </LinearGradient>

            {/* Edit Avatar Camera Badge */}
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={13} color="#002022" />
            </View>

            {/* Presence Beacon */}
            <View style={styles.presenceBeacon}>
              <View style={styles.presenceInner} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsAvatarModalVisible(true)}
            style={styles.changeAvatarHintBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={13} color={colors.primary} />
            <Text style={styles.changeAvatarHintText}>Change profile picture</Text>
          </TouchableOpacity>

          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{user?.username || 'Alex Chen'}</Text>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          </View>

          <Text style={styles.handleText}>@{user?.username?.toLowerCase().replace(/\s+/g, '_') || 'astral_tempo'}</Text>

          {/* Audio Tier Badge */}
          <View style={styles.tierBadge}>
            <MaterialCommunityIcons name="waveform" size={14} color={colors.primary} />
            <Text style={styles.tierText}>Anaska Hi-Fi Master • AI Co-Pilot Active</Text>
          </View>

          {/* Listening Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>148h</Text>
              <Text style={styles.statLab}>Streamed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{genres.length}</Text>
              <Text style={styles.statLab}>Frequencies</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>98%</Text>
              <Text style={styles.statLab}>AI Synergy</Text>
            </View>
          </View>
        </View>

        {/* Sonic Frequencies Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="radio-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Preferred Frequencies</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('GenreSelect', { isEditing: true })}
              activeOpacity={0.7}
            >
              <Text style={styles.editActionText}>Tune Frequencies</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipsRow}>
            {genres.map((g) => (
              <View key={g} style={styles.genreChip}>
                <Ionicons name="sparkles" size={10} color={colors.primary} />
                <Text style={styles.genreChipText}>{g}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Audio Engine & System Settings */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="settings-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Profile & System Settings</Text>
            </View>
          </View>

          {/* Setting Row: Profile Avatar */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setIsAvatarModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIconBox}>
                <Ionicons name="image-outline" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Profile Avatar</Text>
                <Text style={styles.settingSubtitle}>Change your visual identity & photo</Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <View style={styles.miniAvatarWrapper}>
                <Image
                  source={
                    user?.avatar && isCustomAvatar(user.avatar)
                      ? { uri: user.avatar }
                      : require('../../assets/avatar.png')
                  }
                  style={styles.miniAvatarImg}
                />
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Toggle 1: Spatial Audio */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>Lossless Spatial Audio</Text>
              <Text style={styles.toggleSubtitle}>24-bit / 96kHz cryo-acoustic rendering</Text>
            </View>
            <Switch
              value={spatialAudio}
              onValueChange={setSpatialAudio}
              trackColor={{ false: '#1A283F', true: colors.secondaryContainer }}
              thumbColor={spatialAudio ? colors.primary : '#94A9C0'}
            />
          </View>

          {/* Toggle 2: Smart AI Transitions */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>Smart AI Transitions</Text>
              <Text style={styles.toggleSubtitle}>DJ Muse harmonic beat-matching</Text>
            </View>
            <Switch
              value={smartTransitions}
              onValueChange={setSmartTransitions}
              trackColor={{ false: '#1A283F', true: colors.secondaryContainer }}
              thumbColor={smartTransitions ? colors.primary : '#94A9C0'}
            />
          </View>

          {/* Toggle 3: Cryo Dynamic EQ */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>Dynamic Cryo EQ</Text>
              <Text style={styles.toggleSubtitle}>Sub-zero frequency optimization</Text>
            </View>
            <Switch
              value={cryoEq}
              onValueChange={setCryoEq}
              trackColor={{ false: '#1A283F', true: colors.secondaryContainer }}
              thumbColor={cryoEq ? colors.primary : '#94A9C0'}
            />
          </View>

          {/* Hardware Device */}
          <View style={styles.hardwareCard}>
            <View style={styles.hardwareLeft}>
              <Ionicons name="headset" size={20} color={colors.primary} />
              <View>
                <Text style={styles.hardwareName}>Anaska Spatial Buds Pro</Text>
                <Text style={styles.hardwareStatus}>Connected • Battery 94%</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </View>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.logoutText}>Disconnect Frequency (Log Out)</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Avatar Selection & Setting Modal */}
      <Modal
        visible={isAvatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalMeta}>SETTING</Text>
                <Text style={styles.modalTitle}>Select Profile Avatar</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsAvatarModalVisible(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Choose from Phone Storage */}
              <TouchableOpacity
                style={styles.devicePickButton}
                onPress={pickImageFromDevice}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#00F2FE', '#38BDF8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.devicePickGradient}
                >
                  <Ionicons name="images" size={18} color="#002022" />
                  <Text style={styles.devicePickText}>Choose from Phone Storage</Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.modalSectionLabel}>PRESET SONIC PERSONAS</Text>
              <View style={styles.presetsGrid}>
                {AVATAR_PRESETS.map((item) => {
                  const isCurrent =
                    (!item.uri && (!user?.avatar || !user.avatar.startsWith('http'))) ||
                    (item.uri && user?.avatar === item.uri);

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.presetCard, isCurrent && styles.presetCardActive]}
                      onPress={() => handleSaveAvatar(item.uri)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.presetImgRing}>
                        <Image
                          source={item.uri ? { uri: item.uri } : require('../../assets/avatar.png')}
                          style={styles.presetImg}
                        />
                        {isCurrent && (
                          <View style={styles.presetActiveCheck}>
                            <Ionicons name="checkmark-sharp" size={12} color="#002022" />
                          </View>
                        )}
                      </View>
                      <Text style={[styles.presetTitle, isCurrent && styles.presetTitleActive]}>
                        {item.title}
                      </Text>
                      <Text style={styles.presetSubtitle}>{item.subtitle}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalSectionLabel}>OR CUSTOM IMAGE URL</Text>
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Paste direct image URL..."
                  placeholderTextColor={colors.textMuted}
                  value={customAvatarUrl}
                  onChangeText={setCustomAvatarUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[
                    styles.saveCustomBtn,
                    (!customAvatarUrl.trim() || savingAvatar) && styles.saveCustomBtnDisabled,
                  ]}
                  onPress={() => handleSaveAvatar(customAvatarUrl.trim())}
                  disabled={!customAvatarUrl.trim() || savingAvatar}
                >
                  {savingAvatar ? (
                    <ActivityIndicator size="small" color="#002022" />
                  ) : (
                    <Text style={styles.saveCustomBtnText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    top: -80,
    left: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: 240, // Generous clearance so the logout button appears completely above the floating mini player bar
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  metaLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  editProfileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(14, 24, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: 'rgba(11, 18, 32, 0.9)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.25)',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 6,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    padding: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  presenceBeacon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#070B14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presenceInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  handleText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  tierText: {
    color: colors.textFrost,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 242, 254, 0.12)',
  },
  statItem: {
    alignItems: 'center',
  },
  statVal: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  statLab: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
  },
  sectionCard: {
    backgroundColor: 'rgba(11, 18, 32, 0.85)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  editActionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(14, 24, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.25)',
  },
  genreChipText: {
    color: colors.textFrost,
    fontSize: 12,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  hardwareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(14, 24, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.2)',
    marginTop: 12,
  },
  hardwareLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hardwareName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  hardwareStatus: {
    color: colors.secondary,
    fontSize: 11,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(255, 85, 85, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 85, 0.35)',
    marginTop: 4,
  },
  logoutText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '700',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#070B14',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
  changeAvatarHintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.25)',
  },
  changeAvatarHintText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  settingIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.2)',
  },
  settingTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  settingSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniAvatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 242, 254, 0.6)',
    backgroundColor: '#070B14',
  },
  miniAvatarImg: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#0B132B',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalMeta: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    marginTop: spacing.xs,
  },
  devicePickButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    marginTop: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  devicePickGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  devicePickText: {
    color: '#002022',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  modalSectionLabel: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  presetCard: {
    width: '48%',
    backgroundColor: 'rgba(14, 24, 42, 0.9)',
    borderRadius: borderRadius.md,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.15)',
  },
  presetCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 242, 254, 0.12)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  presetImgRing: {
    position: 'relative',
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: 'rgba(0, 242, 254, 0.4)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  presetImg: {
    width: '100%',
    height: '100%',
  },
  presetActiveCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  presetTitleActive: {
    color: colors.primary,
  },
  presetSubtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  customInput: {
    flex: 1,
    backgroundColor: 'rgba(14, 24, 42, 0.9)',
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.2)',
  },
  saveCustomBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveCustomBtnDisabled: {
    opacity: 0.4,
  },
  saveCustomBtnText: {
    color: '#002022',
    fontWeight: '800',
    fontSize: 12,
  },
});
