import type { PropsWithChildren } from 'react';
import { forwardRef, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = Omit<PressableProps, 'style'> &
  PropsWithChildren<{
    title?: string;
    loading?: boolean;
    variant?: Variant;
    style?: StyleProp<ViewStyle>;
  }>;

export const AppButton = forwardRef<View, Props>(function AppButton(
  { title, loading, variant = 'primary', children, disabled, style, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDisabled = Boolean(disabled || loading);

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? <ActivityIndicator color={variant === 'secondary' ? colors.text : '#fff'} /> : null}
      {!loading && title ? (
        <Text
          style={[
            styles.text,
            variant === 'primary' && styles.textOnPrimary,
            variant === 'secondary' && styles.textDefault,
            variant === 'ghost' && styles.textDefault,
          ]}
        >
          {title}
        </Text>
      ) : null}
      {!loading && !title ? children : null}
    </Pressable>
  );
});

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    base: {
      minHeight: 48,
      borderRadius: 12,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      flexDirection: 'row',
      gap: spacing.sm,
    },
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    pressed: {
      opacity: 0.92,
    },
    disabled: {
      opacity: 0.55,
    },
    text: {
      fontSize: 16,
      fontWeight: '700',
    },
    textOnPrimary: {
      color: '#FFFFFF',
    },
    textDefault: {
      color: colors.text,
    },
  });
}
