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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { useUserStore } from '../store/userStore';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useUserStore();

  const [spatialAudio, setSpatialAudio] = useState(true);
  const [smartTransitions, setSmartTransitions] = useState(true);
  const [cryoEq, setCryoEq] = useState(true);

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
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={['#00F2FE', '#38BDF8', '#91F1FF']}
              style={styles.avatarRing}
            >
              <Image
                source={require('../../assets/avatar.png')}
                style={styles.avatarImg}
              />
            </LinearGradient>

            {/* Presence Beacon */}
            <View style={styles.presenceBeacon}>
              <View style={styles.presenceInner} />
            </View>
          </View>

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

        {/* Audio Engine & Hardware Settings */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="hardware-chip-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Audio Engine & Tuning</Text>
            </View>
          </View>

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
    paddingBottom: 140,
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
});
