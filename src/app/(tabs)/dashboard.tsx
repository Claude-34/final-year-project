import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Screen } from '@/components/common/Screen';
import { SeverityBadge } from '@/components/potholes/SeverityBadge';
import { demoPredictiveContext } from '@/features/prediction/demo-context';
import { estimateWeeksUntilLikelyDamage } from '@/features/prediction/road-risk';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuthStore } from '@/store/auth.store';
import { useTheme } from '@/theme/ThemeProvider';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import type { Severity } from '@/types/pothole';

function greetingKey(): 'dashboard.greeting.morning' | 'dashboard.greeting.afternoon' | 'dashboard.greeting.evening' {
  const h = new Date().getHours();
  if (h < 12) return 'dashboard.greeting.morning';
  if (h < 17) return 'dashboard.greeting.afternoon';
  return 'dashboard.greeting.evening';
}

function cardShadow(isDark: boolean): ViewStyle {
  return {
    shadowColor: isDark ? '#000000' : '#0B1220',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.35 : 0.07,
    shadowRadius: 12,
    elevation: 4,
  };
}

export default function DashboardScreen() {
  const userName = useAuthStore((s) => s.user?.name?.split(' ')[0] ?? null);
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const shadow = useMemo(() => cardShadow(isDark), [isDark]);
  const displayName = userName ?? t('dashboard.userThere');
  const predWeeks = useMemo(() => estimateWeeksUntilLikelyDamage(demoPredictiveContext), []);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.kicker}>{t(greetingKey())}</Text>
        <Text style={styles.title}>{displayName}</Text>
        <Text style={styles.subtitle}>{t('dashboard.subtitle')}</Text>
      </View>

      <View style={[styles.hero, shadow]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>{t('dashboard.hero.totalDetections')}</Text>
            <Text style={styles.heroValue}>12</Text>
            <Text style={styles.heroHint}>{t('dashboard.hero.stubData')}</Text>
          </View>
          <View style={styles.heroIconWrap}>
            <Ionicons name="analytics" size={28} color="#BFDBFE" />
          </View>
        </View>
        <View style={styles.heroBar}>
          <View style={[styles.heroBarFill, { width: '68%' }]} />
        </View>
        <Text style={styles.heroFoot}>{t('dashboard.hero.triage')}</Text>
      </View>

      <View style={[styles.predCard, shadow]}>
        <View style={styles.predTop}>
          <Ionicons name="rainy-outline" size={22} color={colors.primary} />
          <Text style={styles.predKicker}>{t('dashboard.prediction.kicker')}</Text>
        </View>
        <Text style={styles.predBody}>{t('dashboard.prediction.body', { weeks: predWeeks })}</Text>
        <Text style={styles.predFoot}>{t('dashboard.prediction.footnote')}</Text>
      </View>

      <Text style={styles.sectionLabel}>{t('dashboard.section.overview')}</Text>
      <View style={styles.metricsRow}>
        <StatTile
          styles={styles}
          shadow={shadow}
          href="/(tabs)/priority"
          accessibilityLabel={t('dashboard.stat.a11yHigh')}
          icon="warning"
          iconColor={colors.danger}
          iconBg={colors.dangerSoft}
          value="3"
          label={t('dashboard.stat.highPriority')}
        />
        <StatTile
          styles={styles}
          shadow={shadow}
          href="/reports"
          accessibilityLabel={t('dashboard.stat.a11yRecent')}
          icon="document-text"
          iconColor={colors.primary}
          iconBg={colors.primarySoft}
          value="5"
          label={t('dashboard.stat.recentReports')}
        />
        <StatTile
          styles={styles}
          shadow={shadow}
          href={{ pathname: '/reports', params: { status: 'repaired' } }}
          accessibilityLabel={t('dashboard.stat.a11yRepaired')}
          icon="checkmark-circle"
          iconColor={colors.success}
          iconBg={colors.successSoft}
          value="7"
          label={t('dashboard.stat.repaired')}
        />
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionLabel}>{t('dashboard.section.quickActions')}</Text>
      </View>
      <View style={styles.actionsGrid}>
        <ActionTile
          styles={styles}
          chevronColor={colors.border}
          href="/(tabs)/capture"
          icon="camera"
          title={t('dashboard.action.capture')}
          subtitle={t('dashboard.action.captureSub')}
          iconColor={colors.primary}
          iconBg={colors.primarySoft}
        />
        <ActionTile
          styles={styles}
          chevronColor={colors.border}
          href="/(tabs)/map"
          icon="map"
          title={t('dashboard.action.map')}
          subtitle={t('dashboard.action.mapSub')}
          iconColor="#7C3AED"
          iconBg={isDark ? '#2E1065' : '#F5F3FF'}
        />
        <ActionTile
          styles={styles}
          chevronColor={colors.border}
          href="/(tabs)/priority"
          icon="trending-up"
          title={t('dashboard.action.priority')}
          subtitle={t('dashboard.action.prioritySub')}
          iconColor="#0D9488"
          iconBg={isDark ? '#042F2E' : '#CCFBF1'}
        />
        <ActionTile
          styles={styles}
          chevronColor={colors.border}
          href="/reports"
          icon="list"
          title={t('dashboard.action.reports')}
          subtitle={t('dashboard.action.reportsSub')}
          iconColor={colors.warning}
          iconBg={colors.warningSoft}
        />
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionLabel}>{t('dashboard.section.recentActivity')}</Text>
        <Link href="/reports" asChild>
          <Pressable hitSlop={8}>
            <Text style={styles.seeAll}>{t('dashboard.seeAll')}</Text>
          </Pressable>
        </Link>
      </View>

      <ActivityRow
        styles={styles}
        shadow={shadow}
        colors={colors}
        title={t('dashboard.activity1.title')}
        time={t('dashboard.activity1.time')}
        severity="high"
        meta={t('dashboard.activity1.meta')}
      />
      <ActivityRow
        styles={styles}
        shadow={shadow}
        colors={colors}
        title={t('dashboard.activity2.title')}
        time={t('dashboard.activity2.time')}
        severity="medium"
        meta={t('dashboard.activity2.meta')}
      />

      <View style={styles.footerLinks}>
        <Link href="/analytics" asChild>
          <Pressable style={styles.footerChip}>
            <Ionicons name="pie-chart-outline" size={18} color={colors.primary} />
            <Text style={styles.footerChipText}>{t('dashboard.footer.analytics')}</Text>
          </Pressable>
        </Link>
        <Link href={'/admin' as Href} asChild>
          <Pressable style={styles.footerChip}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#7C3AED" />
            <Text style={[styles.footerChipText, { color: '#7C3AED' }]}>{t('dashboard.footer.admin')}</Text>
          </Pressable>
        </Link>
        <Link href="/settings" asChild>
          <Pressable style={styles.footerChip}>
            <Ionicons name="settings-outline" size={18} color={colors.mutedText} />
            <Text style={[styles.footerChipText, styles.footerChipTextMuted]}>{t('dashboard.footer.settings')}</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}

function StatTile({
  styles,
  shadow,
  href,
  accessibilityLabel,
  icon,
  iconColor,
  iconBg,
  value,
  label,
}: {
  styles: ReturnType<typeof createStyles>;
  shadow: ViewStyle;
  href: Href;
  accessibilityLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  value: string;
  label: string;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.statTile, shadow, pressed && styles.statTilePressed]}
      >
        <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel} numberOfLines={2}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

function ActionTile({
  styles,
  chevronColor,
  href,
  icon,
  title,
  subtitle,
  iconColor,
  iconBg,
}: {
  styles: ReturnType<typeof createStyles>;
  chevronColor: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <Link href={href as Href} asChild>
      <Pressable style={({ pressed }) => [styles.actionTile, pressed && styles.actionTilePressed]}>
        <View style={[styles.actionIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
        <Ionicons name="chevron-forward" size={16} color={chevronColor} style={styles.actionChevron} />
      </Pressable>
    </Link>
  );
}

function ActivityRow({
  styles,
  shadow,
  colors,
  title,
  time,
  severity,
  meta,
}: {
  styles: ReturnType<typeof createStyles>;
  shadow: ViewStyle;
  colors: ThemeColors;
  title: string;
  time: string;
  severity: Severity;
  meta: string;
}) {
  return (
    <View style={[styles.activityRow, shadow]}>
      <View style={styles.activityIcon}>
        <Ionicons name="location" size={20} color={colors.primary} />
      </View>
      <View style={styles.activityBody}>
        <View style={styles.activityTop}>
          <Text style={styles.activityTitle} numberOfLines={1}>
            {title}
          </Text>
          <SeverityBadge severity={severity} />
        </View>
        <Text style={styles.activityMeta}>{meta}</Text>
      </View>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: {
      marginBottom: spacing.xs,
    },
    kicker: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.mutedText,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    title: {
      marginTop: spacing.xs,
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      marginTop: spacing.sm,
      fontSize: 15,
      lineHeight: 22,
      color: colors.mutedText,
      maxWidth: 340,
    },
    hero: {
      marginTop: spacing.md,
      borderRadius: 20,
      padding: spacing.lg,
      backgroundColor: colors.primaryDark,
      overflow: 'hidden',
    },
    heroTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    heroLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: '#93C5FD',
      letterSpacing: 0.2,
    },
    heroValue: {
      marginTop: spacing.xs,
      fontSize: 40,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -1,
    },
    heroHint: {
      marginTop: 4,
      fontSize: 12,
      color: 'rgba(255,255,255,0.65)',
    },
    heroIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroBar: {
      marginTop: spacing.lg,
      height: 6,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.15)',
      overflow: 'hidden',
    },
    heroBarFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: '#93C5FD',
    },
    heroFoot: {
      marginTop: spacing.sm,
      fontSize: 12,
      color: 'rgba(255,255,255,0.75)',
      fontWeight: '500',
    },
    predCard: {
      marginTop: spacing.md,
      borderRadius: 16,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    predTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    predKicker: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    predBody: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '700',
      color: colors.text,
    },
    predFoot: {
      fontSize: 12,
      lineHeight: 17,
      color: colors.mutedText,
      fontWeight: '500',
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.mutedText,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    sectionHead: {
      marginTop: spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    seeAll: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    metricsRow: {
      marginTop: spacing.md,
      flexDirection: 'row',
      gap: spacing.sm,
    },
    statTile: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 112,
    },
    statTilePressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    statIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statValue: {
      marginTop: spacing.sm,
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    statLabel: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: '600',
      color: colors.mutedText,
      lineHeight: 14,
    },
    actionsGrid: {
      marginTop: spacing.md,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    actionTile: {
      flexBasis: '48%',
      flexGrow: 1,
      maxWidth: '48%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
    },
    actionTilePressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    actionIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    actionSubtitle: {
      marginTop: 2,
      fontSize: 12,
      color: colors.mutedText,
      fontWeight: '500',
    },
    actionChevron: {
      position: 'absolute',
      right: spacing.md,
      top: spacing.md,
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.sm,
      gap: spacing.md,
    },
    activityIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activityBody: {
      flex: 1,
      minWidth: 0,
    },
    activityTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    activityTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    activityMeta: {
      marginTop: 4,
      fontSize: 12,
      color: colors.mutedText,
      fontWeight: '500',
    },
    activityTime: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.mutedText,
    },
    footerLinks: {
      marginTop: spacing.xl,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    footerChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    footerChipText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    footerChipTextMuted: {
      color: colors.mutedText,
    },
  });
}
