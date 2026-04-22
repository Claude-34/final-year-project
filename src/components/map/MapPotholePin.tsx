import { StyleSheet, View } from 'react-native';

import type { Severity } from '@/types/pothole';

const fill: Record<Severity, string> = {
  low: '#16A34A',
  medium: '#F59E0B',
  high: '#DC2626',
};

/**
 * Compact marker view for use as a child of `react-native-maps` `<Marker>`.
 * Set `anchor={{ x: 0.5, y: 1 }}` on the Marker so the dot sits on the coordinate.
 */
export function MapPotholePin({ severity }: { severity: Severity }) {
  return (
    <View style={styles.outer} accessibilityLabel={`Pothole marker, ${severity} severity`}>
      <View style={[styles.inner, { backgroundColor: fill[severity] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 3,
    elevation: 5,
  },
  inner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
