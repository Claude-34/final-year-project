import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BackHeader } from '@/components/common/BackHeader';
import { Screen } from '@/components/common/Screen';
import { SeverityBadge } from '@/components/potholes/SeverityBadge';
import { DEMO_SCORED_REPORTS_SEED } from '@/features/prioritization/demo-reports.seed';
import { rankPotholes } from '@/features/prioritization/prioritization.service';
import { useTranslation } from '@/i18n/useTranslation';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';
type AdminFilter = 'all' | 'high' | 'verify' | 'active';

const ROAD_LABELS = ['admin.road.n1', 'admin.road.campus', 'admin.road.market'] as const;

export default function AdminConsoleScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [filter, setFilter] = useState<AdminFilter>('all');
  const [crewById, setCrewById] = useState<Record<string, string>>({ r2: 'Crew B' });
  const [toast, setToast] = useState<string | null>(null);

  const ranked = useMemo(() => rankPotholes(DEMO_SCORED_REPORTS_SEED), []);

  const rows = useMemo(
    () =>
      ranked.map((r, i) => ({
        ...r,
        roadKey: ROAD_LABELS[i] ?? 'admin.road.unknown',
        crew: crewById[r.id] ?? null,
      })),
    [crewById, ranked],
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === 'all') return true;
      if (filter === 'high') return r.severity === 'high' || r.priorityScore >= 0.72;
      if (filter === 'verify') return r.status === 'reported';
      if (filter === 'active') return r.status === 'assigned' || r.status === 'in_progress';
      return true;
    });
  }, [filter, rows]);

  const kpis = useMemo(() => {
    const open = rows.filter((r) => r.status !== 'repaired').length;
    const high = rows.filter((r) => r.severity === 'high' || r.priorityScore >= 0.72).length;
    const crews = rows.filter((r) => r.crew).length;
    return { open, high, crews };
  }, [rows]);

  function assignStub(id: string) {
    const crews = ['Crew A', 'Crew B', 'Crew C'] as const;
    const cur = crewById[id];
    const idx = cur ? crews.indexOf(cur as (typeof crews)[number]) : -1;
    const next = crews[(idx + 1) % crews.length];
    setCrewById((prev) => ({ ...prev, [id]: next }));
    setToast(t('admin.assignToast', { id, crew: next }));
    setTimeout(() => setToast(null), 2400);
  }

  return (
    <Screen scroll={false} fill>
      <BackHeader label={t('common.back')} />
      <Text style={styles.title}>{t('admin.title')}</Text>
      <Text style={styles.subtitle}>{t('admin.subtitle')}</Text>

      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={styles.kpiValue}>{kpis.open}</Text>
          <Text style={styles.kpiLabel}>{t('admin.kpi.open')}</Text>
        </View>
        <View style={[styles.kpi, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={styles.kpiValue}>{kpis.high}</Text>
          <Text style={styles.kpiLabel}>{t('admin.kpi.high')}</Text>
        </View>
        <View style={[styles.kpi, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={styles.kpiValue}>{kpis.crews}</Text>
          <Text style={styles.kpiLabel}>{t('admin.kpi.crews')}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>{t('admin.filters')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {(
          [
            ['all', 'admin.filter.all'],
            ['high', 'admin.filter.high'],
            ['verify', 'admin.filter.verify'],
            ['active', 'admin.filter.active'],
          ] as const
        ).map(([key, labelKey]) => {
          const selected = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={[
                styles.chip,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primarySoft : colors.surface,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: selected ? colors.primary : colors.text }]}>
                {t(labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {toast ? (
        <View style={[styles.toast, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}>
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          <Text style={[styles.toastText, { color: colors.text }]}>{toast}</Text>
        </View>
      ) : null}

      <FlatList
        style={styles.listFlex}
        contentContainerStyle={styles.listContent}
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>{t('admin.empty')}</Text>}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <View style={styles.cardTop}>
              <View style={styles.cardTitleCol}>
                <Text style={styles.cardId}>{item.id.toUpperCase()}</Text>
                <Text style={styles.cardRoad}>{t(item.roadKey)}</Text>
              </View>
              <SeverityBadge severity={item.severity} />
            </View>
            <Text style={styles.cardMeta}>
              {t('admin.metaLine', {
                score: item.priorityScore.toFixed(2),
                status: t(`workflow.status.${item.status}` as const),
              })}
            </Text>
            {item.crew ? (
              <Text style={styles.crewLine}>{t('admin.crewLine', { crew: item.crew })}</Text>
            ) : null}
            <View style={styles.cardActions}>
              <Link href={`/reports/${item.id}` as Href} asChild>
                <Pressable style={[styles.linkBtn, { borderColor: colors.border }]}>
                  <Text style={[styles.linkBtnText, { color: colors.primary }]}>{t('admin.openReport')}</Text>
                </Pressable>
              </Link>
              <Pressable
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                onPress={() => assignStub(item.id)}
              >
                <Text style={styles.primaryBtnText}>{t('admin.assignCrew')}</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
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
    kpiRow: {
      marginTop: spacing.lg,
      flexDirection: 'row',
      gap: spacing.sm,
    },
    kpi: {
      flex: 1,
      padding: spacing.md,
      borderRadius: 14,
      borderWidth: 1,
    },
    kpiValue: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    kpiLabel: {
      marginTop: 4,
      fontSize: 11,
      fontWeight: '700',
      color: colors.mutedText,
    },
    sectionLabel: {
      marginTop: spacing.lg,
      fontSize: 11,
      fontWeight: '800',
      color: colors.mutedText,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    chips: {
      marginTop: spacing.sm,
      gap: spacing.sm,
      paddingRight: spacing.lg,
    },
    chip: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 999,
      borderWidth: 1,
      marginRight: spacing.sm,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '800',
    },
    toast: {
      marginTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
    },
    toastText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
    },
    listFlex: {
      flex: 1,
      marginTop: spacing.md,
    },
    listContent: {
      flexGrow: 1,
      paddingBottom: spacing.xxl,
      gap: 0,
    },
    sep: {
      height: spacing.sm,
    },
    empty: {
      marginTop: spacing.lg,
      textAlign: 'center',
      color: colors.mutedText,
      fontWeight: '600',
    },
    card: {
      padding: spacing.md,
      borderRadius: 16,
      borderWidth: 1,
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    cardTitleCol: {
      flex: 1,
      minWidth: 0,
    },
    cardId: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.mutedText,
      letterSpacing: 1,
    },
    cardRoad: {
      marginTop: 4,
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    cardMeta: {
      marginTop: spacing.sm,
      fontSize: 13,
      color: colors.mutedText,
      fontWeight: '600',
    },
    crewLine: {
      marginTop: spacing.xs,
      fontSize: 12,
      fontWeight: '700',
      color: colors.success,
    },
    cardActions: {
      marginTop: spacing.md,
      flexDirection: 'row',
      gap: spacing.sm,
    },
    linkBtn: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
    },
    linkBtnText: {
      fontSize: 13,
      fontWeight: '800',
    },
    primaryBtn: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: 12,
      alignItems: 'center',
    },
    primaryBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#FFFFFF',
    },
  });
}
