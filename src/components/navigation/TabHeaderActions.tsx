import Ionicons from '@expo/vector-icons/Ionicons';
import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '@/i18n/useTranslation';
import { useNotificationsStore } from '@/store/notifications.store';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Notifications + AI assistant entry points shown on every main tab header.
 */
export function TabHeaderActions() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const unreadCount = useNotificationsStore((s) => s.items.filter((n) => !n.read).length);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.push('/assistant' as Href)}
        style={styles.hit}
        accessibilityRole="button"
        accessibilityLabel={t('header.assistantA11y')}
      >
        <Ionicons name="sparkles-outline" size={22} color={colors.primary} />
      </Pressable>
      <Pressable
        onPress={() => router.push('/notifications' as Href)}
        style={styles.hit}
        accessibilityRole="button"
        accessibilityLabel={
          unreadCount > 0
            ? t('header.notificationsUnreadA11y', { count: unreadCount })
            : t('header.notificationsA11y')
        }
      >
        <Ionicons name="notifications-outline" size={23} color={colors.text} />
        {unreadCount > 0 ? (
          <View style={[styles.badge, { borderColor: colors.background }]}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 4,
  },
  hit: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
