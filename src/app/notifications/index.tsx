import { type Href, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { BackHeader } from '@/components/common/BackHeader';
import { Screen } from '@/components/common/Screen';
import type { AppNotification } from '@/store/notifications.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { useTranslation } from '@/i18n/useTranslation';
import { formatRelativeTime } from '@/utils/date';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const kindLabel = (k: AppNotification['kind']) => t(`notifications.kind.${k}`);

  const items = useNotificationsStore((s) => s.items);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const clearAll = useNotificationsStore((s) => s.clearAll);

  function openItem(n: AppNotification) {
    markRead(n.id);
    if (n.href) {
      router.push(n.href as Href);
    }
  }

  return (
    <Screen scroll={false} fill>
      <BackHeader label={t('common.close')} />
      <Text style={styles.title}>{t('notifications.title')}</Text>
      <Text style={styles.subtitle}>{t('notifications.subtitle')}</Text>

      {items.length > 0 ? (
        <View style={styles.actions}>
          <AppButton title={t('notifications.markAll')} variant="secondary" onPress={markAllRead} />
          <AppButton title={t('notifications.clearAll')} variant="ghost" onPress={clearAll} />
        </View>
      ) : null}

      <FlatList
        style={styles.list}
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>{t('notifications.empty')}</Text>}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openItem(item)}
            style={[styles.row, !item.read && styles.rowUnread]}
            accessibilityRole="button"
          >
            <View style={styles.rowTop}>
              <View style={[styles.kindPill, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.kindText, { color: colors.primary }]}>{kindLabel(item.kind)}</Text>
              </View>
              <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
            </View>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowBody}>{item.body}</Text>
            {item.href ? <Text style={styles.tapHint}>{t('notifications.tapOpen')}</Text> : null}
          </Pressable>
        )}
      />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      marginTop: spacing.sm,
      fontSize: 14,
      lineHeight: 20,
      color: colors.mutedText,
    },
    actions: {
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    list: {
      marginTop: spacing.lg,
      flex: 1,
    },
    empty: {
      marginTop: spacing.xl,
      fontSize: 15,
      color: colors.mutedText,
      textAlign: 'center',
      lineHeight: 22,
    },
    sep: {
      height: spacing.sm,
    },
    row: {
      padding: spacing.md,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    rowUnread: {
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    kindPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
    },
    kindText: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    time: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.mutedText,
    },
    rowTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    rowBody: {
      marginTop: spacing.xs,
      fontSize: 14,
      lineHeight: 20,
      color: colors.mutedText,
    },
    tapHint: {
      marginTop: spacing.sm,
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
  });
}
