import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { BackHeader } from '@/components/common/BackHeader';
import { Screen } from '@/components/common/Screen';
import { SeverityBadge } from '@/components/potholes/SeverityBadge';
import { appConfig } from '@/config/app.config';
import { listReports } from '@/features/reports/reports.service';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuthStore } from '@/store/auth.store';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';
import type { ReportStatus, Severity } from '@/types/pothole';

type Row = { id: string; severity: Severity; status: ReportStatus };

const seed: Row[] = [
  { id: 'demo-1', severity: 'high', status: 'reported' },
  { id: 'demo-2', severity: 'medium', status: 'verified' },
  { id: 'demo-3', severity: 'low', status: 'repaired' },
];

function firstParam(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default function ReportsIndexScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createReportsIndexStyles(colors), [colors]);
  const params = useLocalSearchParams<{ status?: string | string[] }>();
  const statusFilter = firstParam(params.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [rows, setRows] = useState<Row[]>(seed);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (!appConfig.apiBaseUrl || !isAuthenticated) {
      setRows(seed);
      return;
    }
    setLoading(true);
    void listReports()
      .then((reports) => {
        const mapped = reports.map((r) => ({ id: r.id, severity: r.severity, status: r.status }));
        setRows(mapped.length > 0 ? mapped : []);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const data = useMemo(() => {
    if (!statusFilter) return rows;
    return rows.filter((r) => r.status === statusFilter);
  }, [statusFilter, rows]);

  const subtitle =
    statusFilter === 'repaired' ? t('reports.subtitleRepaired') : t('reports.subtitle');

  return (
    <Screen>
      <BackHeader label={t('common.back')} />
      <Text style={styles.title}>{t('reports.title')}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : null}

      <FlatList
        style={styles.list}
        data={data}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          statusFilter ? (
            <Text style={styles.empty}>{t('reports.emptyFilter')}</Text>
          ) : appConfig.apiBaseUrl && isAuthenticated ? (
            <Text style={styles.empty}>{t('reports.emptyRemote')}</Text>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <Link href={`/reports/${item.id}`} asChild>
            <Pressable style={styles.row}>
              <View style={styles.rowTop}>
                <Text style={styles.rowTitle}>{item.id}</Text>
                <SeverityBadge severity={item.severity} />
              </View>
              <Text style={styles.rowMeta}>{t('reports.statusLine', { status: item.status })}</Text>
            </Pressable>
          </Link>
        )}
      />
    </Screen>
  );
}

function createReportsIndexStyles(colors: ThemeColors) {
  return StyleSheet.create({
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      marginTop: spacing.sm,
      color: colors.mutedText,
    },
    loader: {
      marginTop: spacing.md,
    },
    list: {
      marginTop: spacing.lg,
    },
    sep: {
      height: spacing.sm,
    },
    row: {
      padding: spacing.md,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    rowTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      flex: 1,
    },
    rowMeta: {
      marginTop: spacing.xs,
      color: colors.mutedText,
    },
    empty: {
      marginTop: spacing.md,
      fontSize: 14,
      color: colors.mutedText,
      fontWeight: '600',
    },
  });
}
