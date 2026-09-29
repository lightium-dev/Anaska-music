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
  Platform,
} from 'react-native';
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

const ALL_GENRES = [
  'Synthwave',
  'Cyberpunk',
  'Electronic',
  'Ambient',
  'Lo-Fi',
  'Techno',
  'Rock',
  'Metal',
  'Jazz',
  'Hip-Hop',
  'House',
];

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
  const { user, logout, updateAvatar, updateGenres } = useUserStore();

  const [spatialAudio, setSpatialAudio] = useState(true);
  const [smartTransitions, setSmartTransitions] = useState(true);
  const [adaptiveMood, setAdaptiveMood] = useState(true);

  // Active genres selection
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    user?.genrePreferences && user.genrePreferences.length > 0
      ? user.genrePreferences
      : ['Synthwave', 'Cyberpunk', 'Electronic', 'Ambient', 'Lo-Fi']
  );

  // Avatar Modal State
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);

  const toggleGenre = (genre: string) => {
    let next: string[];
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length === 1) {
        Alert.alert('Genre Selection', 'Keep at least 1 genre active for DJ Muse recommendations.');
        return;
      }
      next = selectedGenres.filter((g) => g !== genre);
    } else {
      next = [...selectedGenres, genre];
    }
    setSelectedGenres(next);
    updateGenres(next);
    apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ genrePreferences: next }),
    }).catch(() => {});
  };

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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.metaLabel}>USER CENTER</Text>
            <Text style={styles.pageTitle}>Sonic Profile & Settings</Text>
          </View>

          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => setIsAvatarModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar Ring */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatarTouch}
              onPress={() => setIsAvatarModalVisible(true)}
              activeOpacity={0.85}
            >
              <Image
                source={
                  user?.avatar && isCustomAvatar(user.avatar)
                    ? { uri: user.avatar }
                    : require('../../assets/avatar.png')
                }
                style={styles.avatarImg}
              />
            </TouchableOpacity>
            <View style={styles.presenceBeacon} />
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{user?.username || 'Alex Chen'}</Text>
            <Ionicons name="checkmark-circle" size={17} color={colors.primary} />
          </View>

          <Text style={styles.handleText}>
            @{user?.username?.toLowerCase().replace(/\s+/g, '_') || 'astral_tempo'}
          </Text>

          {/* Audio Tier Chip */}
          <View style={styles.tierChip}>
            <MaterialCommunityIcons name="waveform" size={13} color={colors.primary} />
            <Text style={styles.tierText}>Anaska Hi-Fi Master • AI Co-Pilot Active</Text>
          </View>

          {/* 3 Stats Columns */}
          <View style={styles.statsGrid}>
            <View style={styles.statCol}>
              <Ionicons name="library-outline" size={16} color={colors.primary} />
              <Text style={styles.statValue}>1,420</Text>
              <Text style={styles.statLabel}>Tracks</Text>
            </View>
            <View style={styles.statCol}>
              <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
              <Text style={styles.statValue}>84h</Text>
              <Text style={styles.statLabel}>DJ Muse</Text>
            </View>
            <View style={styles.statCol}>
              <Ionicons name="speedometer-outline" size={16} color={colors.primary} />
              <Text style={styles.statValue}>Synthwave</Text>
              <Text style={styles.statLabel}>Top Genre</Text>
            </View>
          </View>
        </View>

        {/* Sonic Frequencies Section */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="options-outline" size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>YOUR SONIC FREQUENCIES</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Tap to adjust the genres DJ Muse prioritizes in your daily stream.
            </Text>
          </View>

          <View style={styles.genresWrap}>
            {ALL_GENRES.map((g) => {
              const active = selectedGenres.includes(g);
              return (
                <TouchableOpacity
                  key={g}
                  style={[styles.genreChip, active && styles.genreChipActive]}
                  onPress={() => toggleGenre(g)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.genreChipText, active && styles.genreChipTextActive]}>
                    {g}
                  </Text>
                  {active && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* AI Co-Pilot & Audio Engine Section */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="hardware-chip-outline" size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>AI CO-PILOT & AUDIO ENGINE</Text>
          </View>

          <View style={styles.cardContainer}>
            {/* Setting 1: Smart DJ Muse Transitions */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconSquare}>
                  <Ionicons name="shuffle-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingHeading}>Smart DJ Muse Transitions</Text>
                  <Text style={styles.settingDesc}>Harmonic crossfade & live BPM sync</Text>
                </View>
              </View>
              <Switch
                value={smartTransitions}
                onValueChange={setSmartTransitions}
                trackColor={{ false: '#262626', true: colors.primary }}
                thumbColor={smartTransitions ? '#000000' : '#888888'}
              />
            </View>

            {/* Setting 2: Lossless Spatial Audio */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconSquare}>
                  <Ionicons name="volume-high-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingHeading}>Lossless Spatial Audio</Text>
                  <Text style={styles.settingDesc}>Master fidelity (96kHz / 24-bit)</Text>
                </View>
              </View>
              <Switch
                value={spatialAudio}
                onValueChange={setSpatialAudio}
                trackColor={{ false: '#262626', true: colors.primary }}
                thumbColor={spatialAudio ? '#000000' : '#888888'}
              />
            </View>

            {/* Setting 3: Adaptive Mood Detection */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconSquare}>
                  <Ionicons name="happy-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingHeading}>Adaptive Mood Detection</Text>
                  <Text style={styles.settingDesc}>Real-time biometrics & listening tempo</Text>
                </View>
              </View>
              <Switch
                value={adaptiveMood}
                onValueChange={setAdaptiveMood}
                trackColor={{ false: '#262626', true: colors.primary }}
                thumbColor={adaptiveMood ? '#000000' : '#888888'}
              />
            </View>
          </View>
        </View>

        {/* Account & Hardware Section */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="headset-outline" size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>ACCOUNT & HARDWARE</Text>
          </View>

          <View style={styles.cardContainer}>
            {/* Row 1: Connected Devices */}
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={styles.iconSquare}>
                  <Ionicons name="headset-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.settingTextCol}>
                  <View style={styles.rowInline}>
                    <Text style={styles.settingHeading}>Connected Devices</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>ACTIVE</Text>
                    </View>
                  </View>
                  <Text style={styles.settingDesc}>Anaska Spatial Buds Pro</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#888888" />
            </TouchableOpacity>

            {/* Row 2: Download Storage */}
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={styles.iconSquare}>
                  <Ionicons name="server-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingHeading}>Download Storage & Cache</Text>
                  <Text style={styles.settingDesc}>14.2 GB of Offline Master Audio</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#888888" />
            </TouchableOpacity>

            {/* Row 3: Subscription Tier */}
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={styles.iconSquare}>
                  <Ionicons name="ribbon-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.settingTextCol}>
                  <View style={styles.rowInline}>
                    <Text style={styles.settingHeading}>Subscription Tier</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>VIP</Text>
                    </View>
                  </View>
                  <Text style={styles.settingDesc}>Anaska Neural VIP • $12.99/mo</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#888888" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out Action */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#888888" />
          <Text style={styles.logoutText}>Log Out of Anaska</Text>
        </TouchableOpacity>

        {/* Footer Build Info */}
        <View style={styles.footerBlock}>
          <Text style={styles.footerVersion}>ANASKA MOBILE v2.4.0 • NEURAL ENGINE v4.2</Text>
          <Text style={styles.footerSub}>Spatial Synthetics Lab • Audio Pipeline Calibrated</Text>
        </View>
      </ScrollView>

      {/* Avatar Picker Modal */}
      <Modal
        visible={isAvatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAvatarModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Avatar</Text>
              <TouchableOpacity
                onPress={() => setIsAvatarModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Pick from Phone Storage Button */}
            <TouchableOpacity
              style={styles.storagePickBtn}
              onPress={pickImageFromDevice}
              activeOpacity={0.8}
            >
              <Ionicons name="image-outline" size={18} color="#FFFFFF" />
              <Text style={styles.storagePickBtnText}>Choose from Phone Storage</Text>
            </TouchableOpacity>

            <Text style={styles.modalSubHeader}>Or select a preset persona:</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsList}>
              {AVATAR_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={styles.presetItem}
                  onPress={() => handleSaveAvatar(preset.uri)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={
                      preset.uri
                        ? { uri: preset.uri }
                        : require('../../assets/avatar.png')
                    }
                    style={styles.presetImg}
                  />
                  <Text style={styles.presetTitle} numberOfLines={1}>{preset.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.urlInputRow}>
              <TextInput
                style={styles.urlInput}
                placeholder="Or paste image URL..."
                placeholderTextColor={colors.textMuted}
                value={customAvatarUrl}
                onChangeText={setCustomAvatarUrl}
              />
              <TouchableOpacity
                style={styles.urlSaveBtn}
                onPress={() => customAvatarUrl.trim() && handleSaveAvatar(customAvatarUrl.trim())}
                disabled={!customAvatarUrl.trim() || savingAvatar}
                activeOpacity={0.8}
              >
                {savingAvatar ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.urlSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 52 : 24,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  editProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: '#111111',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#262626',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarTouch: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
    backgroundColor: '#181818',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  presenceBeacon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#111111',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  handleText: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  tierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.xs,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
    marginTop: 12,
  },
  tierText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginTop: 18,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: '#262626',
    paddingVertical: 12,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    color: '#888888',
    fontSize: 10,
    marginTop: 2,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    color: '#888888',
    fontSize: 11,
  },
  genresWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.xs,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
  },
  genreChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genreChipText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
  },
  genreChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cardContainer: {
    backgroundColor: '#111111',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#262626',
    padding: 8,
    gap: 8,
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181818',
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: '#262626',
    padding: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  iconSquare: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.xs,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextCol: {
    flex: 1,
  },
  settingHeading: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  settingDesc: {
    color: '#888888',
    fontSize: 11,
    marginTop: 2,
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderWidth: 1,
    borderColor: '#262626',
  },
  statusBadgeText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#181818',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#262626',
    paddingVertical: 14,
    marginBottom: 20,
  },
  logoutText: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '600',
  },
  footerBlock: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerVersion: {
    color: '#888888',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  footerSub: {
    color: '#555555',
    fontSize: 10,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#111111',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#262626',
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  storagePickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xs,
    paddingVertical: 12,
    marginBottom: 16,
  },
  storagePickBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalSubHeader: {
    color: '#888888',
    fontSize: 11,
    marginBottom: 10,
  },
  presetsList: {
    marginBottom: 16,
  },
  presetItem: {
    alignItems: 'center',
    marginRight: 12,
    width: 60,
  },
  presetImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 4,
  },
  presetTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    textAlign: 'center',
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#181818',
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: '#262626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
  },
  urlSaveBtn: {
    backgroundColor: '#262626',
    borderRadius: borderRadius.xs,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urlSaveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
