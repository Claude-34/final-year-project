import { StyleSheet, Text, View } from 'react-native';

import type { Severity } from '@/types/pothole';
import { spacing } from '@/theme/spacing';

const tone: Record<Severity, { bg: string; fg: string }> = {
  low: { bg: '#DCFCE7', fg: '#166534' },
  medium: { bg: '#FEF9C3', fg: '#854D0E' },
  high: { bg: '#FEE2E2', fg: '#991B1B' },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const t = tone[severity];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{severity.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
  },
  text: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
});
