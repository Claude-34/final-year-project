import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BackHeader } from '@/components/common/BackHeader';
import { Screen } from '@/components/common/Screen';
import { listReports } from '@/features/reports/reports.service';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuthStore } from '@/store/auth.store';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';

type Row = { userId: string; display: string; count: number };

const DEMO_ROWS: Row[] = [
  { userId: 'city-seed-1', display: 'Alex M.', count: 14 },
  { userId: 'city-seed-2', display: 'Jamie K.', count: 11 },
  { userId: 'city-seed-3', display: 'R. Naidoo', count: 9 },
];

function mergeLeaderboard(local: Row[], userId: string | undefined, t: (k: string) => string): Row[] {
  const map = new Map<string, Row>();
  for (const r of DEMO_ROWS) {
    map.set(r.userId, { ...r });
  }
  for (const r of local) {
    const prev = map.get(r.userId);
    if (prev) {
      map.set(r.userId, { ...prev, count: prev.count + r.count });
    } else {
      map.set(r.userId, r);
    }
  }
  const list = [...map.values()].map((row) => ({
    ...row,
    display: row.userId === userId ? t('community.leaderboard.you') : row.display,
  }));
  list.sort((a, b) => b.count - a.count);
  return list.slice(0, 12);
}

export default function CommunityLeaderboardScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const userId = useAuthStore((s) => s.user?.id);

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    void listReports().then((reports) => {
      const counts = new Map<string, number>();
      for (const r of reports) {
        const uid = r.reportedBy || 'anonymous';
        counts.set(uid, (counts.get(uid) ?? 0) + 1);
      }
      const local: Row[] = [...counts.entries()].map(([userId, count]) => ({
        userId,
        display: userId,
        count,
      }));
      setRows(mergeLeaderboard(local, userId, t));
      setLoading(false);
    });
  }, [userId, t]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <Screen>
      <BackHeader label={t('common.back')} fallbackHref="/(tabs)/profile" />
      <Text style={styles.title}>{t('community.leaderboard.title')}</Text>
      <Text style={styles.subtitle}>{t('community.leaderboard.subtitle')}</Text>
      <Text style={styles.note}>{t('community.leaderboard.stubNote')}</Text>

      {loading ? (
        <ActivityIndicator style={styles.spinner} color={colors.primary} />
      ) : rows.length === 0 ? (
        <Text style={styles.empty}>{t('community.leaderboard.empty')}</Text>
      ) : (
        <View style={styles.list}>
          {rows.map((row, i) => (
            <View
              key={`${row.userId}-${i}`}
              style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <Text style={styles.rank}>#{i + 1}</Text>
              <View style={styles.rowMain}>
                <Text style={styles.name}>{row.display}</Text>
                <Text style={styles.meta}>{t('community.leaderboard.reports', { count: row.count })}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      marginTop: spacing.sm,
      fontSize: 14,
      lineHeight: 20,
      color: colors.mutedText,
    },
    note: {
      marginTop: spacing.sm,
      fontSize: 12,
      lineHeight: 17,
      color: colors.mutedText,
      fontStyle: 'italic',
    },
    spinner: {
      marginTop: spacing.xl,
    },
    empty: {
      marginTop: spacing.xl,
      fontSize: 15,
      color: colors.mutedText,
    },
    list: {
      marginTop: spacing.lg,
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: 14,
      borderWidth: 1,
      gap: spacing.md,
    },
    rank: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.primary,
      width: 40,
    },
    rowMain: {
      flex: 1,
    },
    name: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    meta: {
      marginTop: 2,
      fontSize: 13,
      color: colors.mutedText,
      fontWeight: '600',
    },
  });
}
