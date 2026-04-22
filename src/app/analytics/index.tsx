import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BackHeader } from '@/components/common/BackHeader';
import { Screen } from '@/components/common/Screen';
import { CategoryChart } from '@/components/charts/CategoryChart';
import { SeverityChart } from '@/components/charts/SeverityChart';
import { DEMO_SCORED_REPORTS_SEED } from '@/features/prioritization/demo-reports.seed';
import { roadQualityScoreFromReports } from '@/features/prediction/road-risk';
import { useTranslation } from '@/i18n/useTranslation';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createAnalyticsStyles(colors), [colors]);

  const roadQuality = useMemo(
    () => roadQualityScoreFromReports(DEMO_SCORED_REPORTS_SEED),
    [],
  );

  return (
    <Screen>
      <BackHeader label={t('common.back')} />
      <Text style={styles.title}>{t('analytics.title')}</Text>
      <Text style={styles.subtitle}>{t('analytics.subtitle')}</Text>

      <View style={styles.metrics}>
        <MetricTile
          styles={styles}
          label={t('analytics.metric.detections')}
          value="128"
          hint={t('analytics.metric.detectionsHint')}
        />
        <MetricTile
          styles={styles}
          label={t('analytics.metric.roadQuality')}
          value={`${roadQuality}`}
          hint={t('analytics.metric.roadQualityHint')}
        />
        <MetricTile
          styles={styles}
          label={t('analytics.metric.modelAccuracy')}
          value="91%"
          hint={t('analytics.metric.modelAccuracyHint')}
        />
        <MetricTile
          styles={styles}
          label={t('analytics.metric.repairTime')}
          value="4.2d"
          hint={t('analytics.metric.repairTimeHint')}
        />
      </View>

      <View style={styles.callout}>
        <Text style={styles.calloutTitle}>{t('analytics.budgetTitle')}</Text>
        <Text style={styles.calloutBody}>{t('analytics.budgetBody')}</Text>
      </View>

      <View style={styles.grid}>
        <SeverityChart />
        <CategoryChart />
      </View>
    </Screen>
  );
}

function MetricTile({
  styles,
  label,
  value,
  hint,
}: {
  styles: ReturnType<typeof createAnalyticsStyles>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHint}>{hint}</Text>
    </View>
  );
}

function createAnalyticsStyles(colors: ThemeColors) {
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
    metrics: {
      marginTop: spacing.lg,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    metricTile: {
      width: '48%',
      flexGrow: 1,
      padding: spacing.md,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    metricLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.mutedText,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    metricValue: {
      marginTop: spacing.xs,
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    metricHint: {
      marginTop: 4,
      fontSize: 11,
      lineHeight: 15,
      color: colors.mutedText,
    },
    callout: {
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    calloutTitle: {
      fontWeight: '800',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    calloutBody: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.mutedText,
      fontWeight: '600',
    },
    grid: {
      marginTop: spacing.lg,
      gap: spacing.md,
    },
  });
}
