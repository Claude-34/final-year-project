import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from '@/i18n/useTranslation';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * `react-native-maps` does not support web. Use this screen on web; use `map.tsx` on iOS/Android.
 */
export default function MapScreenWeb() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createMapWebStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.inner}>
        <Text style={styles.title}>{t('mapWeb.title')}</Text>
        <Text style={styles.body}>{t('mapWeb.body')}</Text>
      </View>
    </SafeAreaView>
  );
}

function createMapWebStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    inner: {
      flex: 1,
      padding: spacing.lg,
      justifyContent: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
    },
    body: {
      marginTop: spacing.md,
      fontSize: 15,
      lineHeight: 22,
      color: colors.mutedText,
    },
  });
}
