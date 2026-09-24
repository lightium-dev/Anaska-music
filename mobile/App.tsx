import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing } from './src/constants/theme';
import { apiRequest } from './src/services/api';

interface HealthResponse {
  status: string;
  service: string;
  database: string;
  timestamp: string;
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        setLoading(true);
        const res = await apiRequest<HealthResponse>('/health');
        setHealth(res);
      } catch (err: any) {
        setError(err.message || 'Failed to connect to backend');
      } finally {
        setLoading(false);
      }
    }

    checkHealth();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.badge}>ANASKA MUSIC</Text>
        <Text style={styles.title}>DJ Muse AI Streaming</Text>
        <Text style={styles.subtitle}>
          Mobile Music Streaming with intelligent conversational curation.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Backend Status</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : error ? (
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: colors.error }]} />
              <Text style={styles.errorText}>Offline ({error})</Text>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={styles.successText}>
                {health?.service} is {health?.status} (DB: {health?.database})
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  badge: {
    color: colors.primary,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  successText: {
    color: colors.primaryAccent,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
});
