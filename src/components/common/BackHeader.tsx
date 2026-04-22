import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';

type Props = {
  /** Shown next to the chevron (e.g. "Back", "Reports"). */
  label?: string;
  /** Used when there is no history to pop (e.g. cold open). */
  fallbackHref?: Href;
};

export function BackHeader({ label = 'Back', fallbackHref = '/(tabs)/dashboard' }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  function onPress() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackHref);
    }
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Ionicons name="chevron-back" size={24} color={colors.primary} />
        <Text style={styles.text}>{label}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      marginBottom: spacing.sm,
      marginHorizontal: -4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: spacing.xs,
      paddingRight: spacing.md,
      gap: 2,
    },
    pressed: {
      opacity: 0.7,
    },
    text: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.primary,
    },
  });
}
