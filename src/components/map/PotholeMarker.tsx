import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Severity } from '@/types/pothole';
import { useTheme } from '@/theme/ThemeProvider';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';

const ring: Record<Severity, string> = {
  low: '#16A34A',
  medium: '#F59E0B',
  high: '#DC2626',
};

export function PotholeMarker({ label, severity }: { label: string; severity: Severity }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.dot, { borderColor: ring[severity] }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    dot: {
      width: 34,
      height: 34,
      borderRadius: 999,
      borderWidth: 3,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontSize: 12,
      fontWeight: '900',
      color: colors.text,
    },
  });
}
