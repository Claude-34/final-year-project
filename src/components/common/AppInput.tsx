import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';

type Props = TextInputProps & {
  label: string;
};

export function AppInput({ label, style, ...rest }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.mutedText} style={[styles.input, style]} {...rest} />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      gap: spacing.xs,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.mutedText,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      color: colors.text,
      fontSize: 16,
    },
  });
}
