import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '@/i18n/useTranslation';
import { useTheme } from '@/theme/ThemeProvider';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';

export function SeverityChart() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('analytics.severityChartTitle')}</Text>
      <View style={styles.bars}>
        <Bar styles={styles} label={t('map.legend.low')} value={0.35} color="#16A34A" />
        <Bar styles={styles} label={t('map.legend.medium')} value={0.45} color="#F59E0B" />
        <Bar styles={styles} label={t('map.legend.high')} value={0.2} color="#DC2626" />
      </View>
    </View>
  );
}

function Bar({
  styles,
  label,
  value,
  color,
}: {
  styles: ReturnType<typeof createStyles>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.round(value * 100)}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.barValue}>{Math.round(value * 100)}%</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      padding: spacing.lg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.md,
    },
    title: {
      fontWeight: '900',
      color: colors.text,
    },
    bars: {
      gap: spacing.sm,
    },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    barLabel: {
      width: 52,
      color: colors.mutedText,
      fontWeight: '800',
    },
    barTrack: {
      flex: 1,
      height: 10,
      borderRadius: 999,
      backgroundColor: colors.background,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    barFill: {
      height: '100%',
    },
    barValue: {
      width: 44,
      textAlign: 'right',
      fontVariant: ['tabular-nums'],
      fontWeight: '800',
      color: colors.text,
    },
  });
}
