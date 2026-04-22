import { type Href, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { Screen } from '@/components/common/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuthStore } from '@/store/auth.store';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createProfileStyles(colors), [colors]);

  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  function onSignOut() {
    void (async () => {
      await clearSession();
      router.replace('/(auth)/login');
    })();
  }

  return (
    <Screen>
      <Text style={styles.title}>{t('profile.title')}</Text>
      <Text style={styles.subtitle}>{t('profile.subtitle')}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t('profile.name')}</Text>
        <Text style={styles.value}>{user?.name ?? '—'}</Text>

        <Text style={[styles.label, styles.labelSpacer]}>{t('profile.email')}</Text>
        <Text style={styles.value}>{user?.email ?? '—'}</Text>

        <Text style={[styles.label, styles.labelSpacer]}>{t('profile.role')}</Text>
        <Text style={styles.value}>{user?.role ?? '—'}</Text>
      </View>

      <View style={styles.actions}>
        <Text style={styles.hint}>{t('profile.communitySub')}</Text>
        <AppButton
          title={t('profile.community')}
          onPress={() => router.push('/community/leaderboard' as Href)}
        />
        <AppButton title={t('profile.signOut')} onPress={onSignOut} variant="secondary" />
      </View>
    </Screen>
  );
}

function createProfileStyles(colors: ThemeColors) {
  return StyleSheet.create({
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      marginTop: spacing.sm,
      color: colors.mutedText,
    },
    card: {
      marginTop: spacing.lg,
      padding: spacing.lg,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      color: colors.mutedText,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    labelSpacer: {
      marginTop: spacing.md,
    },
    value: {
      marginTop: spacing.xs,
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    actions: {
      marginTop: spacing.xl,
      gap: spacing.sm,
    },
    hint: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.mutedText,
      fontWeight: '600',
    },
  });
}
