import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '@/i18n/useTranslation';
import { useTheme } from '@/theme/ThemeProvider';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';

export function HeatmapLegend() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t('map.heatmapLegendTitle')}</Text>
      <View style={styles.row}>
        <View style={[styles.swatch, { backgroundColor: '#4ADE80' }]} />
        <View style={[styles.swatch, { backgroundColor: '#FBBF24' }]} />
        <View style={[styles.swatch, { backgroundColor: '#F97316' }]} />
        <View style={[styles.swatch, { backgroundColor: '#EF4444' }]} />
      </View>
      <Text style={styles.caption}>{t('map.heatmapLegendCaption')}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      gap: spacing.sm,
    },
    title: {
      fontWeight: '800',
      fontSize: 11,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.mutedText,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    swatch: {
      flex: 1,
      height: 10,
      borderRadius: 999,
    },
    caption: {
      color: colors.mutedText,
      fontSize: 12,
      lineHeight: 17,
    },
  });
}
