import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { BackHeader } from '@/components/common/BackHeader';
import { Screen } from '@/components/common/Screen';
import { requestPasswordReset } from '@/features/auth/auth.service';
import { useTranslation } from '@/i18n/useTranslation';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createForgotStyles(colors), [colors]);

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await requestPasswordReset(email);
      setMessage(t('auth.forgot.stubMessage'));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('auth.forgot.error'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <BackHeader label={t('common.back')} fallbackHref="/(auth)/login" />
      <Text style={styles.title}>{t('auth.forgot.title')}</Text>
      <Text style={styles.subtitle}>{t('auth.forgot.subtitle')}</Text>

      <View style={styles.form}>
        <AppInput label={t('auth.forgot.email')} value={email} onChangeText={setEmail} autoCapitalize="none" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}
        <AppButton title={t('auth.forgot.sendLink')} onPress={onSubmit} loading={isSubmitting} />
      </View>

      <View style={styles.footer}>
        <Link href="/(auth)/login" asChild>
          <AppButton title={t('auth.forgot.backToSignIn')} variant="secondary" />
        </Link>
      </View>
    </Screen>
  );
}

function createForgotStyles(colors: ThemeColors) {
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
    form: {
      marginTop: spacing.xl,
      gap: spacing.md,
    },
    footer: {
      marginTop: spacing.xl,
    },
    error: {
      color: colors.danger,
    },
    success: {
      color: colors.success,
    },
  });
}
