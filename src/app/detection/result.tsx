import { type Href, Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { BackHeader } from '@/components/common/BackHeader';
import { Screen } from '@/components/common/Screen';
import { DetectionPreview } from '@/components/potholes/DetectionPreview';
import { PriorityIndicator } from '@/components/potholes/PriorityIndicator';
import { SeverityBadge } from '@/components/potholes/SeverityBadge';
import { useCaptureDraftStore } from '@/features/capture/capture-draft.store';
import type { DetectedRoadEnvironment } from '@/features/detection/detection.types';
import { useDetection } from '@/features/detection/useDetection';
import { stubReportEnrichment } from '@/features/prediction/report-enrichment.stub';
import { scorePothole } from '@/features/prioritization/prioritization.service';
import {
  adjustedVehicleDamageRisk,
  damageMessageKey,
  recommendedSpeedKmh,
} from '@/features/vehicle/vehicle-adjustment';
import { appConfig } from '@/config/app.config';
import { createReport } from '@/features/reports/reports.service';
import type { PotholeReport, RoadType, TrafficDensity } from '@/types/pothole';
import { translateForUser, useTranslation } from '@/i18n/useTranslation';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { useUiStore } from '@/store/ui.store';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';

function pickParam(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function roadTypeFromEnvironment(env: DetectedRoadEnvironment): RoadType {
  if (env === 'highway') return 'highway';
  if (env === 'urban') return 'secondary';
  return 'local';
}

function trafficFromEnvironment(env: DetectedRoadEnvironment): TrafficDensity {
  if (env === 'highway') return 'high';
  if (env === 'urban') return 'medium';
  return 'low';
}

export default function DetectionResultScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createDetectionResultStyles(colors), [colors]);

  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id ?? 'anonymous');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const needsSignInForSubmit = Boolean(appConfig.apiBaseUrl) && !isAuthenticated;
  const vehicleType = useUiStore((s) => s.vehicleType);
  const clearDraft = useCaptureDraftStore((s) => s.clearDraft);
  const authorityUriRef = useRef(new Set<string>());

  const params = useLocalSearchParams<{
    imageUri?: string | string[];
    latitude?: string | string[];
    longitude?: string | string[];
    notes?: string | string[];
  }>();

  const [resolved, setResolved] = useState<{
    imageUri?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
  }>({});

  useEffect(() => {
    const draft = useCaptureDraftStore.getState().draft;
    if (draft?.imageUri) {
      setResolved({
        imageUri: draft.imageUri,
        latitude: draft.latitude,
        longitude: draft.longitude,
        notes: draft.notes,
      });
      return;
    }

    const uri = pickParam(params.imageUri);
    const latStr = pickParam(params.latitude);
    const lngStr = pickParam(params.longitude);
    setResolved({
      imageUri: uri,
      latitude: latStr !== undefined ? Number(latStr) : undefined,
      longitude: lngStr !== undefined ? Number(lngStr) : undefined,
      notes: pickParam(params.notes),
    });
  }, [params.imageUri, params.latitude, params.longitude, params.notes]);

  const { data, isLoading, error, refetch } = useDetection({
    imageUri: resolved.imageUri,
    latitude: resolved.latitude,
    longitude: resolved.longitude,
    notes: resolved.notes,
  });

  const geoEnrich = useMemo(() => {
    const lat = resolved.latitude ?? 0;
    const lng = resolved.longitude ?? 0;
    if (lat === 0 && lng === 0) {
      return { nearSchool: false, nearHospital: false, reportCountNearby: 3, roadAgeYears: 10 };
    }
    return stubReportEnrichment(lat, lng);
  }, [resolved.latitude, resolved.longitude]);

  const draftReport = useMemo((): PotholeReport | null => {
    if (!data) return null;
    const base: PotholeReport = {
      id: `local-${Date.now()}`,
      imageUrl: resolved.imageUri ?? '',
      latitude: resolved.latitude ?? 0,
      longitude: resolved.longitude ?? 0,
      detectedAt: new Date().toISOString(),
      severity: data.severity,
      confidence: data.confidence,
      depthEstimate: data.depthEstimateCm,
      widthEstimate: data.widthEstimateM,
      vehicleDamageRisk: adjustedVehicleDamageRisk(data.vehicleDamageRisk ?? 0, vehicleType),
      damageKind: data.damageKind,
      priorityScore: 0,
      status: 'reported',
      reportedBy: userId,
      notes: resolved.notes,
      roadType: roadTypeFromEnvironment(data.roadEnvironment ?? 'urban'),
      trafficDensity: trafficFromEnvironment(data.roadEnvironment ?? 'urban'),
      validationUpvotes: 0,
      validationDownvotes: 0,
      ...geoEnrich,
    };

    return {
      ...base,
      priorityScore: scorePothole(base),
    };
  }, [data, geoEnrich, resolved.imageUri, resolved.latitude, resolved.longitude, resolved.notes, userId, vehicleType]);

  useEffect(() => {
    if (!data || !resolved.imageUri || !draftReport) return;
    if (draftReport.priorityScore < 0.82) return;
    if (authorityUriRef.current.has(resolved.imageUri)) return;
    authorityUriRef.current.add(resolved.imageUri);
    useNotificationsStore.getState().pushNotification({
      title: translateForUser('notify.authority.title'),
      body: translateForUser('notify.authority.body', { score: draftReport.priorityScore.toFixed(2) }),
      kind: 'authority',
      href: '/admin',
    });
  }, [data, draftReport, resolved.imageUri]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  async function onConfirm() {
    if (!draftReport) return;
    if (needsSignInForSubmit) {
      setSubmitMessage(t('detection.loginRequired'));
      return;
    }
    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      const saved = await createReport(draftReport);
      setSubmitMessage(t('detection.saved', { id: saved.id }));
      useNotificationsStore.getState().pushNotification({
        title: translateForUser('notify.report.title'),
        body: translateForUser('notify.report.body', { id: saved.id }),
        kind: 'report',
        href: `/reports/${saved.id}`,
      });
      clearDraft();
      router.push(`/reports/${saved.id}`);
    } catch (e) {
      setSubmitMessage(e instanceof Error ? e.message : t('detection.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <BackHeader label={t('common.back')} fallbackHref="/(tabs)/capture" />
      <Text style={styles.title}>{t('detection.title')}</Text>
      <Text style={styles.subtitle}>{t('detection.subtitle')}</Text>

      {resolved.imageUri ? (
        <Image
          source={{ uri: resolved.imageUri }}
          style={styles.previewImg}
          resizeMode="cover"
          accessibilityLabel={t('detection.previewA11y')}
        />
      ) : null}

      <DetectionPreview
        title={t('detection.overlayTitle')}
        description={resolved.imageUri ? t('detection.overlayWithImage') : t('detection.overlayNoImage')}
      />

      {data?.imageQuality?.suggestRetake && !data.imageQuality.passed ? (
        <View style={[styles.warnBanner, { borderColor: colors.warning, backgroundColor: colors.warningSoft }]}>
          <Text style={[styles.warnBannerTitle, { color: colors.text }]}>{t('detection.imageQuality.title')}</Text>
          <Text style={[styles.warnBannerBody, { color: colors.mutedText }]}>
            {t('detection.imageQuality.body', {
              blur: Math.round((data.imageQuality.blurScore ?? 0) * 100),
              light: Math.round((data.imageQuality.lightingScore ?? 0) * 100),
            })}
          </Text>
        </View>
      ) : null}

      {data?.duplicateNearby ? (
        <View style={[styles.dupBanner, { borderColor: colors.primary, backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.dupTitle, { color: colors.text }]}>{t('detection.duplicate.title')}</Text>
          <Text style={[styles.dupBody, { color: colors.mutedText }]}>
            {t('detection.duplicate.body', {
              id: data.duplicateNearby.reportId,
              meters: data.duplicateNearby.distanceM,
            })}
          </Text>
          <Link href={`/reports/${data.duplicateNearby.reportId}` as Href} asChild>
            <Pressable hitSlop={8}>
              <Text style={[styles.dupLink, { color: colors.primary }]}>{t('detection.duplicate.link')}</Text>
            </Pressable>
          </Link>
        </View>
      ) : null}

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>{t('detection.severity')}</Text>
          {data ? <SeverityBadge severity={data.severity} /> : <Text style={styles.muted}>—</Text>}
        </View>
        {data?.damageKind ? (
          <Text style={styles.meta}>
            {t('detection.damageKind')}: {t(`damageKind.${data.damageKind}`)}
          </Text>
        ) : null}
        {data?.surfaceMoisture ? (
          <Text style={styles.meta}>
            {t('detection.surfaceLabel')}: {t(`detection.surface.${data.surfaceMoisture}`)}
          </Text>
        ) : null}
        {data?.lightingCondition ? (
          <Text style={styles.meta}>
            {t('detection.lightingLabel')}: {t(`detection.lighting.${data.lightingCondition}`)}
          </Text>
        ) : null}
        {data?.roadEnvironment ? (
          <Text style={styles.meta}>
            {t('detection.roadEnvLabel')}: {t(`detection.roadEnv.${data.roadEnvironment}`)} —{' '}
            {t('detection.roadEnvPriorityHint')}
          </Text>
        ) : null}
        {data?.preprocessingPipeline ? (
          <View style={styles.preprocessBlock}>
            <Text style={styles.preprocessTitle}>{t('detection.preprocessTitle')}</Text>
            <Text style={styles.preprocessBody}>
              {t(`detection.preprocess.${data.preprocessingPipeline}`)}
              {data.lowLightEnhancementApplied ? ` ${t('detection.preprocessLowLightFlag')}` : ''}
            </Text>
          </View>
        ) : null}
        <Text style={styles.meta}>
          {t('detection.confidence')}{' '}
          {data ? data.confidence.toFixed(3) : isLoading ? t('detection.loading') : '—'}
        </Text>
        {data ? (
          <View style={styles.metricsBlock}>
            <Text style={styles.metricsTitle}>{t('detection.engineeringMetrics')}</Text>
            <Text style={styles.meta}>
              {t('detection.depthCm', { value: data.depthEstimateCm?.toFixed(1) ?? '—' })}
            </Text>
            <Text style={styles.meta}>
              {t('detection.widthM', { value: data.widthEstimateM?.toFixed(2) ?? '—' })}
            </Text>
            <Text style={styles.meta}>
              {t('detection.vehicleRisk', {
                pct: Math.round((data.vehicleDamageRisk ?? 0) * 100),
              })}
            </Text>
            {data.perspectiveDepthCm != null ? (
              <Text style={styles.meta}>
                {t('detection.dim3d.depth', { value: data.perspectiveDepthCm.toFixed(1) })}
              </Text>
            ) : null}
            {data.volumeEstimateLitres != null ? (
              <Text style={styles.meta}>
                {t('detection.dim3d.volume', { value: data.volumeEstimateLitres.toFixed(2) })}
              </Text>
            ) : null}
            <View style={styles.vehicleBlock}>
              <Text style={styles.metricsTitle}>{t('detection.vehicleContext')}</Text>
              <Text style={styles.meta}>{t(`settings.vehicle.${vehicleType}`)}</Text>
              <Text style={styles.meta}>
                {t('detection.vehicle.adjustedRisk', {
                  pct: Math.round(adjustedVehicleDamageRisk(data.vehicleDamageRisk ?? 0, vehicleType) * 100),
                })}
              </Text>
              <Text style={[styles.meta, styles.vehicleEmphasis]}>{t(damageMessageKey(data.severity, vehicleType))}</Text>
              <Text style={styles.meta}>
                {t('detection.vehicle.speedHint', {
                  speed: recommendedSpeedKmh(data.severity, vehicleType),
                })}
              </Text>
            </View>
          </View>
        ) : null}
        {data?.explanationFactors?.length ? (
          <View style={styles.explainBlock}>
            <Text style={styles.explainTitle}>{t('detection.explainTitle')}</Text>
            {data.explanationFactors.map((f) => (
              <Text key={f} style={styles.explainLine}>
                • {t(`detection.explain.${f}`)}
              </Text>
            ))}
          </View>
        ) : null}
        {error ? <Text style={styles.error}>{error.message}</Text> : null}
        {draftReport ? (
          <View style={styles.priorityRow}>
            <Text style={styles.label}>{t('detection.priority')}</Text>
            <PriorityIndicator score={draftReport.priorityScore} />
          </View>
        ) : null}
      </View>

      <Text style={styles.tip}>{t('detection.multiAngleTip')}</Text>

      {needsSignInForSubmit ? (
        <View style={[styles.warnBanner, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={[styles.warnBannerTitle, { color: colors.text }]}>{t('detection.loginRequired')}</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.signInPress}>
              <Text style={[styles.signInLink, { color: colors.primary }]}>{t('detection.signIn')}</Text>
            </Pressable>
          </Link>
        </View>
      ) : null}

      <View style={styles.actions}>
        <AppButton title={t('detection.rerun')} variant="secondary" onPress={() => refetch()} />
        <AppButton
          title={t('detection.submit')}
          onPress={onConfirm}
          disabled={!draftReport || needsSignInForSubmit}
          loading={isSubmitting}
        />
        {submitMessage ? <Text style={styles.muted}>{submitMessage}</Text> : null}
      </View>
    </Screen>
  );
}

function createDetectionResultStyles(colors: ThemeColors) {
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
    previewImg: {
      marginTop: spacing.md,
      width: '100%',
      height: 200,
      borderRadius: 14,
      backgroundColor: colors.border,
    },
    card: {
      marginTop: spacing.lg,
      padding: spacing.lg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.xs,
    },
    metricsBlock: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 4,
    },
    metricsTitle: {
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
    },
    explainBlock: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 4,
    },
    explainTitle: {
      fontWeight: '800',
      color: colors.text,
      marginBottom: 2,
    },
    explainLine: {
      color: colors.mutedText,
      fontSize: 13,
      lineHeight: 19,
    },
    preprocessBlock: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 4,
    },
    preprocessTitle: {
      fontWeight: '800',
      color: colors.text,
      fontSize: 13,
    },
    preprocessBody: {
      color: colors.mutedText,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '600',
    },
    tip: {
      marginTop: spacing.md,
      fontSize: 13,
      lineHeight: 19,
      color: colors.mutedText,
      fontWeight: '600',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    priorityRow: {
      marginTop: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    label: {
      fontWeight: '800',
      color: colors.text,
    },
    meta: {
      color: colors.mutedText,
    },
    muted: {
      color: colors.mutedText,
    },
    error: {
      color: colors.danger,
      fontWeight: '600',
    },
    actions: {
      marginTop: spacing.lg,
      gap: spacing.sm,
    },
    warnBanner: {
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: 14,
      borderWidth: 1,
    },
    warnBannerTitle: {
      fontWeight: '800',
      fontSize: 14,
    },
    warnBannerBody: {
      marginTop: spacing.xs,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '600',
    },
    dupBanner: {
      marginTop: spacing.sm,
      padding: spacing.md,
      borderRadius: 14,
      borderWidth: 1,
      gap: spacing.xs,
    },
    dupTitle: {
      fontWeight: '800',
      fontSize: 14,
    },
    dupBody: {
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '600',
    },
    dupLink: {
      fontSize: 14,
      fontWeight: '800',
      marginTop: spacing.xs,
    },
    signInPress: {
      marginTop: spacing.sm,
      alignSelf: 'flex-start',
    },
    signInLink: {
      fontSize: 15,
      fontWeight: '800',
    },
    vehicleBlock: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 4,
    },
    vehicleEmphasis: {
      fontWeight: '800',
      color: colors.text,
    },
  });
}
