import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { Screen } from '@/components/common/Screen';
import { loginWithPassword } from '@/features/auth/auth.service';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuthStore } from '@/store/auth.store';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createLoginStyles(colors), [colors]);

  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogin() {
    setIsSubmitting(true);
    setError(null);
    try {
      const session = await loginWithPassword({ email, password });
      setSession(session);
      router.replace('/(tabs)/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('auth.login.error'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>{t('auth.login.title')}</Text>
      <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>

      <View style={styles.form}>
        <AppInput label={t('auth.login.email')} value={email} onChangeText={setEmail} autoCapitalize="none" />
        <AppInput label={t('auth.login.password')} value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title={t('auth.login.signIn')} onPress={onLogin} loading={isSubmitting} />
      </View>

      <View style={styles.footer}>
        <Link href="/(auth)/register" asChild>
          <AppButton title={t('auth.login.createAccount')} variant="secondary" />
        </Link>
        <Link href="/(auth)/forgot-password" asChild>
          <AppButton title={t('auth.login.forgotPassword')} variant="ghost" />
        </Link>
      </View>
    </Screen>
  );
}

function createLoginStyles(colors: ThemeColors) {
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
      gap: spacing.sm,
    },
    error: {
      color: colors.danger,
    },
  });
}
