import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SeverityBadge } from '@/components/potholes/SeverityBadge';
import type { Severity } from '@/types/pothole';
import { useTheme } from '@/theme/ThemeProvider';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';

export function PotholeCard({
  title,
  subtitle,
  severity,
  priorityScore,
}: {
  title: string;
  subtitle: string;
  severity: Severity;
  priorityScore: number;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.title}>{title}</Text>
        <SeverityBadge severity={severity} />
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Text style={styles.meta}>Priority score (stub): {priorityScore.toFixed(3)}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      marginTop: spacing.md,
      padding: spacing.lg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.sm,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    title: {
      flex: 1,
      fontSize: 16,
      fontWeight: '900',
      color: colors.text,
    },
    subtitle: {
      color: colors.mutedText,
    },
    meta: {
      color: colors.text,
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
    },
  });
}
