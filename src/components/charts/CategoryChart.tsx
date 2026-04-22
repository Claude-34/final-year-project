import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '@/i18n/useTranslation';
import { useTheme } from '@/theme/ThemeProvider';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';

export function CategoryChart() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('analytics.categoryChartTitle')}</Text>
      <View style={styles.list}>
        <Row styles={styles} name={t('analytics.road.campus')} count={12} />
        <Row styles={styles} name={t('analytics.road.main')} count={9} />
        <Row styles={styles} name={t('analytics.road.ring')} count={6} />
      </View>
    </View>
  );
}

function Row({ styles, name, count }: { styles: ReturnType<typeof createStyles>; name: string; count: number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.count}>{count}</Text>
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
    list: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    name: {
      color: colors.text,
      fontWeight: '700',
    },
    count: {
      fontVariant: ['tabular-nums'],
      fontWeight: '900',
      color: colors.mutedText,
    },
  });
}
