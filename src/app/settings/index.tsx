import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { BackHeader } from '@/components/common/BackHeader';
import { Screen } from '@/components/common/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import type { AppLocale } from '@/i18n/types';
import type { VehicleType } from '@/features/vehicle/vehicle-adjustment';
import { useUiStore } from '@/store/ui.store';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createSettingsStyles(colors), [colors]);
  const { t, locale, setLocale, locales } = useTranslation();

  const darkMode = useUiStore((s) => s.darkMode);
  const setDarkMode = useUiStore((s) => s.setDarkMode);
  const vehicleType = useUiStore((s) => s.vehicleType);
  const setVehicleType = useUiStore((s) => s.setVehicleType);

  const vehicleOptions: VehicleType[] = ['motorcycle', 'car', 'truck'];

  return (
    <Screen>
      <BackHeader label={t('common.close')} />
      <Text style={styles.title}>{t('settings.title')}</Text>
      <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{t('settings.darkMode')}</Text>
          <Text style={styles.rowSubtitle}>{t('settings.darkModeHint')}</Text>
        </View>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      <Text style={styles.sectionLabel}>{t('settings.vehicleSection')}</Text>
      <Text style={styles.languageHint}>{t('settings.vehicleHint')}</Text>
      <View style={styles.vehicleRow}>
        {vehicleOptions.map((v) => {
          const selected = vehicleType === v;
          return (
            <Pressable
              key={v}
              onPress={() => setVehicleType(v)}
              style={[
                styles.vehicleChip,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primarySoft : colors.surface,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.vehicleChipText, { color: selected ? colors.primary : colors.text }]}>
                {t(`settings.vehicle.${v}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Link href={'/admin' as Href} asChild>
        <Pressable
          style={[styles.adminLink, { borderColor: colors.border, backgroundColor: colors.surface }]}
          accessibilityRole="button"
        >
          <Ionicons name="business-outline" size={22} color={colors.primary} />
          <View style={styles.adminLinkText}>
            <Text style={[styles.adminLinkTitle, { color: colors.text }]}>{t('settings.adminConsole')}</Text>
            <Text style={[styles.adminLinkSub, { color: colors.mutedText }]}>{t('settings.adminConsoleHint')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.mutedText} />
        </Pressable>
      </Link>

      <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
      <Text style={styles.languageHint}>{t('settings.languageHint')}</Text>

      <View style={styles.langList}>
        {locales.map((opt) => {
          const selected = locale === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => setLocale(opt.id as AppLocale)}
              style={[styles.langRow, { borderColor: colors.border, backgroundColor: colors.surface }]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${opt.nativeLabel}. ${selected ? t('settings.languageSelected') : ''}`}
            >
              <View style={styles.langTextCol}>
                <Text style={[styles.langNative, { color: colors.text }]}>{opt.nativeLabel}</Text>
                <Text style={[styles.langLabel, { color: colors.mutedText }]}>{opt.label}</Text>
              </View>
              {selected ? <Ionicons name="checkmark-circle" size={24} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

function createSettingsStyles(colors: ThemeColors) {
  return StyleSheet.create({
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      marginTop: spacing.sm,
      color: colors.mutedText,
    },
    row: {
      marginTop: spacing.xl,
      padding: spacing.lg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    adminLink: {
      marginTop: spacing.md,
      padding: spacing.lg,
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    adminLinkText: {
      flex: 1,
    },
    adminLinkTitle: {
      fontSize: 16,
      fontWeight: '800',
    },
    adminLinkSub: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500',
    },
    rowTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    rowSubtitle: {
      marginTop: spacing.xs,
      color: colors.mutedText,
    },
    vehicleRow: {
      marginTop: spacing.md,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    vehicleChip: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 12,
      borderWidth: 1.5,
    },
    vehicleChipText: {
      fontWeight: '800',
      fontSize: 14,
    },
    sectionLabel: {
      marginTop: spacing.xl,
      fontSize: 12,
      fontWeight: '800',
      color: colors.mutedText,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    languageHint: {
      marginTop: spacing.sm,
      fontSize: 14,
      lineHeight: 20,
      color: colors.mutedText,
    },
    langList: {
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    langRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      borderRadius: 14,
      borderWidth: 1,
    },
    langTextCol: {
      flex: 1,
    },
    langNative: {
      fontSize: 17,
      fontWeight: '800',
    },
    langLabel: {
      marginTop: 2,
      fontSize: 13,
      fontWeight: '600',
    },
  });
}
