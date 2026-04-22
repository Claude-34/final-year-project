import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { clamp } from '@/utils/helpers';

export function PriorityIndicator({ score }: { score: number }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const pct = clamp(score, 0, 1) * 100;

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.caption}>priority</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
      gap: spacing.xs,
    },
    track: {
      height: 10,
      borderRadius: 999,
      backgroundColor: colors.primarySoft,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    fill: {
      height: '100%',
      backgroundColor: colors.primary,
    },
    caption: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.mutedText,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
  });
}
