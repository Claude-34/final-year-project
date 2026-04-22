import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';

export function DetectionPreview({ title, description }: { title: string; description: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{description}</Text>
      <View style={styles.preview}>
        <Text style={styles.previewText}>BBox overlay placeholder</Text>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      marginTop: spacing.lg,
      padding: spacing.lg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.sm,
    },
    title: {
      fontSize: 16,
      fontWeight: '900',
      color: colors.text,
    },
    body: {
      color: colors.mutedText,
    },
    preview: {
      marginTop: spacing.sm,
      height: 160,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewText: {
      color: colors.mutedText,
      fontWeight: '700',
    },
  });
}
