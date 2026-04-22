import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { BackHeader } from '@/components/common/BackHeader';
import { Screen } from '@/components/common/Screen';
import { registerAccount } from '@/features/auth/auth.service';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuthStore } from '@/store/auth.store';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createRegisterStyles(colors), [colors]);

  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onRegister() {
    setIsSubmitting(true);
    setError(null);
    try {
      const session = await registerAccount({ name, email, password });
      setSession(session);
      router.replace('/(tabs)/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('auth.register.error'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <BackHeader label={t('common.back')} fallbackHref="/(auth)/login" />
      <Text style={styles.title}>{t('auth.register.title')}</Text>
      <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>

      <View style={styles.form}>
        <AppInput label={t('auth.register.fullName')} value={name} onChangeText={setName} />
        <AppInput label={t('auth.register.email')} value={email} onChangeText={setEmail} autoCapitalize="none" />
        <AppInput label={t('auth.register.password')} value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title={t('auth.register.submit')} onPress={onRegister} loading={isSubmitting} />
      </View>

      <View style={styles.footer}>
        <Link href="/(auth)/login" asChild>
          <AppButton title={t('auth.register.signInInstead')} variant="secondary" />
        </Link>
      </View>
    </Screen>
  );
}

function createRegisterStyles(colors: ThemeColors) {
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
  });
}
