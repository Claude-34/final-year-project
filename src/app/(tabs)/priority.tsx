import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/common/Screen';
import { PriorityIndicator } from '@/components/potholes/PriorityIndicator';
import { SeverityBadge } from '@/components/potholes/SeverityBadge';
import type { PrioritizationBreakdown } from '@/features/prioritization/prioritization.types';
import { DEMO_SCORED_REPORTS_SEED } from '@/features/prioritization/demo-reports.seed';
import { rankPotholes } from '@/features/prioritization/prioritization.service';
import { useTranslation } from '@/i18n/useTranslation';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';

const FACTOR_KEYS: (keyof PrioritizationBreakdown)[] = [
  'severity',
  'traffic',
  'roadType',
  'accidentRisk',
  'proximitySensitive',
  'reportCluster',
  'weather',
];

export default function PriorityScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createPriorityStyles(colors), [colors]);
  const ranked = useMemo(() => rankPotholes(DEMO_SCORED_REPORTS_SEED), []);

  return (
    <Screen>
      <Text style={styles.title}>{t('priority.title')}</Text>
      <Text style={styles.subtitle}>{t('priority.subtitle')}</Text>

      <FlatList
        style={styles.list}
        data={ranked}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowTop}>
              <Text style={styles.rowTitle}>{t('priority.reportLabel', { id: item.id })}</Text>
              <SeverityBadge severity={item.severity} />
            </View>
            <Text style={styles.rowMeta}>
              {t('priority.rowMeta', {
                conf: item.confidence.toFixed(2),
                road: item.roadType ?? '—',
                traffic: item.trafficDensity ?? '—',
              })}
            </Text>
            {(item.nearSchool || item.nearHospital) && (
              <Text style={styles.sensitive}>
                {item.nearSchool ? `${t('priority.nearSchool')} ` : ''}
                {item.nearHospital ? t('priority.nearHospital') : ''}
              </Text>
            )}
            <View style={styles.rowBottom}>
              <PriorityIndicator score={item.priorityScore} />
              <Text style={styles.scoreText}>{item.priorityScore.toFixed(3)}</Text>
            </View>
            <View style={styles.breakdown}>
              <Text style={styles.breakdownTitle}>{t('priority.signalsTitle')}</Text>
              {FACTOR_KEYS.map((k) => (
                <Text key={k} style={styles.breakLine}>
                  {t(`priority.factor.${k}`)}{' '}
                  <Text style={styles.breakNum}>{Math.round(item.context.breakdown[k] * 100)}%</Text>
                </Text>
              ))}
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

function createPriorityStyles(colors: ThemeColors) {
  return StyleSheet.create({
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      marginTop: spacing.sm,
      color: colors.mutedText,
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
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    rowMeta: {
      marginTop: spacing.xs,
      color: colors.mutedText,
    },
    sensitive: {
      marginTop: spacing.xs,
      fontSize: 12,
      fontWeight: '700',
      color: colors.warning,
    },
    rowBottom: {
      marginTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    scoreText: {
      fontVariant: ['tabular-nums'],
      fontWeight: '800',
      color: colors.text,
    },
    breakdown: {
      marginTop: spacing.md,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 2,
    },
    breakdownTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.mutedText,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    breakLine: {
      fontSize: 12,
      color: colors.mutedText,
    },
    breakNum: {
      fontWeight: '800',
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
  });
}
