import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import MapView, { Circle, Marker, Polyline, type Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapPotholePin } from '@/components/map/MapPotholePin';
import { computeRouteAlternatives, haversineMeters, type LatLng } from '@/features/map/routeAlternatives';
import { useMapUserLocation } from '@/hooks/useMapUserLocation';
import type { TranslateFn } from '@/i18n/useTranslation';
import { translateForUser, useTranslation } from '@/i18n/useTranslation';
import { useDrivingProximityStore } from '@/store/driving-proximity.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { useTheme } from '@/theme/ThemeProvider';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import type { Severity } from '@/types/pothole';

const DEFAULT_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const DRIVING_ZOOM_DELTA = 0.012;

type MapPin = {
  id: string;
  latitude: number;
  longitude: number;
  severity: Severity;
  title: string;
  description: string;
};

/** Demo potholes around the user — replace with API data. */
function seedPins(lat: number, lng: number, t: TranslateFn): MapPin[] {
  const d = 0.012;
  return [
    {
      id: 'p1',
      latitude: lat + d * 0.6,
      longitude: lng + d * 0.4,
      severity: 'high',
      title: t('map.pin.highTitle'),
      description: t('map.pin.highDesc1'),
    },
    {
      id: 'p2',
      latitude: lat - d * 0.5,
      longitude: lng + d * 0.2,
      severity: 'medium',
      title: t('map.pin.mediumTitle'),
      description: t('map.pin.mediumDesc1'),
    },
    {
      id: 'p3',
      latitude: lat + d * 0.15,
      longitude: lng - d * 0.55,
      severity: 'low',
      title: t('map.pin.lowTitle'),
      description: t('map.pin.lowDesc'),
    },
    {
      id: 'p4',
      latitude: lat + d * 0.28,
      longitude: lng + d * 0.08,
      severity: 'high',
      title: t('map.pin.highTitle'),
      description: t('map.pin.highDesc2'),
    },
    {
      id: 'p5',
      latitude: lat + d * 0.42,
      longitude: lng + d * 0.18,
      severity: 'medium',
      title: t('map.pin.mediumTitle'),
      description: t('map.pin.mediumDesc2'),
    },
    {
      id: 'p6',
      latitude: lat + d * 0.35,
      longitude: lng + d * 0.28,
      severity: 'high',
      title: t('map.pin.highTitle'),
      description: t('map.pin.highDesc2'),
    },
  ];
}

function routeCopy(id: string, t: TranslateFn) {
  switch (id) {
    case 'main':
      return { title: t('map.routeMain'), hint: t('map.routeMainHint') };
    case 'detour_a':
      return { title: t('map.routeA'), hint: t('map.routeAHint') };
    case 'detour_b':
      return { title: t('map.routeB'), hint: t('map.routeBHint') };
    default:
      return { title: id, hint: '' };
  }
}

const ROUTE_LINE: Record<string, string> = {
  main: '#F97316',
  detour_a: '#2563EB',
  detour_b: '#0D9488',
};

function lineStroke(hex: string, selected: boolean) {
  if (selected) return hex;
  if (hex.length === 7 && hex.startsWith('#')) return `${hex}66`;
  return hex;
}

function countSevereAlongRoute(
  path: LatLng[],
  potholes: { id: string; latitude: number; longitude: number; severity: Severity }[],
): number {
  if (path.length === 0) return 0;
  const seen = new Set<string>();
  const stride = Math.max(1, Math.floor(path.length / 35));
  for (let i = 0; i < path.length; i += stride) {
    const pt = path[i];
    for (const h of potholes) {
      if (h.severity !== 'high') continue;
      if (haversineMeters(pt, { latitude: h.latitude, longitude: h.longitude }) < 95) {
        seen.add(h.id);
      }
    }
  }
  return seen.size;
}

export default function MapScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createMapStyles(colors, isDark), [colors, isDark]);

  const [followWhileDriving, setFollowWhileDriving] = useState(false);
  const [showDamageHeatmap, setShowDamageHeatmap] = useState(true);
  const [avoidSeverePotholes, setAvoidSeverePotholes] = useState(false);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const mapRef = useRef<MapView>(null);
  const lastCamAt = useRef(0);
  const lastFitDestKey = useRef<string | null>(null);
  const lastRouteAlertKey = useRef<string | null>(null);
  const reminderFired = useRef(new Set<string>());
  const prevAvoidSevereRef = useRef(avoidSeverePotholes);

  const recordNearPass = useDrivingProximityStore((s) => s.recordNearPass);

  const { coords, error: locationError, heading, speedMps, accuracyM, refresh } =
    useMapUserLocation(followWhileDriving);

  const [mapReady, setMapReady] = useState(false);
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const region = useMemo<Region>(() => {
    if (coords) {
      const delta = followWhileDriving ? DRIVING_ZOOM_DELTA : DEFAULT_REGION.latitudeDelta;
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      };
    }
    return DEFAULT_REGION;
  }, [coords, followWhileDriving]);

  const pins = useMemo(() => {
    const lat = coords?.latitude ?? DEFAULT_REGION.latitude;
    const lng = coords?.longitude ?? DEFAULT_REGION.longitude;
    return seedPins(lat, lng, t);
  }, [coords, t]);

  const potholesForRouting = useMemo(
    () =>
      pins.map((p) => ({
        id: p.id,
        latitude: p.latitude,
        longitude: p.longitude,
        severity: p.severity,
      })),
    [pins],
  );

  const routeOptions = useMemo(() => {
    if (!coords || !destination) return [];
    return computeRouteAlternatives(coords, destination, potholesForRouting, {
      avoidSeverePotholes,
    });
  }, [avoidSeverePotholes, coords, destination, potholesForRouting]);

  const nearSevereAlert = useMemo(() => {
    if (!followWhileDriving || !coords) return null;
    let best: { meters: number } | null = null;
    for (const p of pins) {
      if (p.severity !== 'high') continue;
      const m = haversineMeters(coords, { latitude: p.latitude, longitude: p.longitude });
      if (m < 95 && (!best || m < best.meters)) best = { meters: m };
    }
    return best;
  }, [coords, followWhileDriving, pins]);

  useEffect(() => {
    if (!destination || !selectedRouteId || routeOptions.length === 0) return;
    const route = routeOptions.find((r) => r.id === selectedRouteId);
    if (!route) return;
    const n = countSevereAlongRoute(route.coordinates, potholesForRouting);
    if (n === 0) return;
    const key = `${destination.latitude.toFixed(4)}_${destination.longitude.toFixed(4)}_${selectedRouteId}_${n}`;
    if (lastRouteAlertKey.current === key) return;
    lastRouteAlertKey.current = key;
    useNotificationsStore.getState().pushNotification({
      title: translateForUser('notify.route.title'),
      body: translateForUser('notify.route.body', { count: n }),
      kind: 'route',
      href: '/(tabs)/map',
    });
  }, [destination, potholesForRouting, routeOptions, selectedRouteId]);

  useEffect(() => {
    if (!coords) return;
    const handle = setInterval(() => {
      for (const p of pins) {
        const d = haversineMeters(coords, { latitude: p.latitude, longitude: p.longitude });
        if (d > 42) continue;
        const { hitFive } = recordNearPass(p.id);
        if (hitFive && !reminderFired.current.has(p.id)) {
          reminderFired.current.add(p.id);
          useNotificationsStore.getState().pushNotification({
            title: translateForUser('notify.reminder.title'),
            body: translateForUser('notify.reminder.body', { count: 5, id: p.id }),
            kind: 'reminder',
            href: `/reports/${p.id}`,
          });
        }
      }
    }, 6000);
    return () => clearInterval(handle);
  }, [coords, pins, recordNearPass]);

  useEffect(() => {
    if (routeOptions.length === 0) {
      setSelectedRouteId(null);
      return;
    }
    const avoidModeChanged = prevAvoidSevereRef.current !== avoidSeverePotholes;
    prevAvoidSevereRef.current = avoidSeverePotholes;

    setSelectedRouteId((prev) => {
      // Re-ranking changes which route is "recommended"; keep manual picks unless avoid toggle just changed.
      if (!avoidModeChanged && prev && routeOptions.some((r) => r.id === prev)) return prev;
      const rec = routeOptions.find((r) => r.recommended);
      return rec?.id ?? routeOptions[0].id;
    });
  }, [routeOptions, avoidSeverePotholes]);

  useEffect(() => {
    if (!destination) lastFitDestKey.current = null;
  }, [destination]);

  const destKey = destination
    ? `${destination.latitude.toFixed(5)}_${destination.longitude.toFixed(5)}`
    : null;

  useEffect(() => {
    if (!mapReady || !coords || !destination || routeOptions.length === 0 || !destKey) return;
    if (lastFitDestKey.current === destKey) return;
    lastFitDestKey.current = destKey;

    const allCoords: LatLng[] = [coords, destination, ...routeOptions.flatMap((r) => r.coordinates)];
    const handle = setTimeout(() => {
      mapRef.current?.fitToCoordinates(allCoords, {
        edgePadding: { top: 96, right: 32, bottom: followWhileDriving ? 280 : 240, left: 32 },
        animated: true,
      });
    }, 400);
    return () => clearTimeout(handle);
  }, [destKey, mapReady, coords, destination, routeOptions, followWhileDriving]);

  useEffect(() => {
    if (!followWhileDriving || !coords || !mapReady) return;
    const now = Date.now();
    if (now - lastCamAt.current < 1000) return;
    lastCamAt.current = now;
    const useHeading = heading != null && heading >= 0;
    if (useHeading) {
      mapRef.current?.animateCamera(
        {
          center: coords,
          pitch: 0,
          heading,
          zoom: 17,
        },
        { duration: 450 },
      );
    } else {
      mapRef.current?.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: DRIVING_ZOOM_DELTA,
          longitudeDelta: DRIVING_ZOOM_DELTA,
        },
        450,
      );
    }
  }, [coords, followWhileDriving, heading, mapReady]);

  useEffect(() => {
    if (coords && mapReady && !followWhileDriving) {
      mapRef.current?.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: DEFAULT_REGION.latitudeDelta,
          longitudeDelta: DEFAULT_REGION.longitudeDelta,
        },
        500,
      );
    }
  }, [coords, mapReady, followWhileDriving]);

  const onMapLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ width, height });
  }, []);

  const recenter = useCallback(() => {
    mapRef.current?.animateToRegion(region, 450);
  }, [region]);

  const onLongPressMap = useCallback(
    (e: { nativeEvent: { coordinate: LatLng } }) => {
      const c = e.nativeEvent.coordinate;
      setDestination({ latitude: c.latitude, longitude: c.longitude });
    },
    [],
  );

  const clearDestination = useCallback(() => {
    setDestination(null);
    lastFitDestKey.current = null;
  }, []);

  const showLoader = layout.height > 0 && !mapReady;
  const speedKmh = speedMps != null ? Math.round(speedMps * 3.6) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('map.title')}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {t('map.subtitle')}
        </Text>
        {coords ? (
          <Text style={styles.coordLine} selectable numberOfLines={1}>
            {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
            {accuracyM != null ? ` · ±${Math.round(accuracyM)} m` : ''}
            {followWhileDriving && speedKmh != null && speedKmh > 1 ? ` · ~${speedKmh} km/h` : ''}
          </Text>
        ) : null}
        {locationError ? (
          <Text style={styles.warn} numberOfLines={2}>
            {locationError} {t('map.showingDefault')}
          </Text>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.switchScroll}
          contentContainerStyle={styles.switchScrollContent}
        >
          <View style={[styles.switchCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={[styles.switchCardLabel, { color: colors.text }]} numberOfLines={2}>
              {t('map.followDriving')}
            </Text>
            <Switch
              value={followWhileDriving}
              onValueChange={setFollowWhileDriving}
              trackColor={{ false: colors.border, true: colors.primarySoft }}
              thumbColor={followWhileDriving ? colors.primary : colors.mutedText}
            />
          </View>
          <View style={[styles.switchCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={[styles.switchCardLabel, { color: colors.text }]} numberOfLines={2}>
              {t('map.heatmapToggle')}
            </Text>
            <Switch
              value={showDamageHeatmap}
              onValueChange={setShowDamageHeatmap}
              trackColor={{ false: colors.border, true: colors.primarySoft }}
              thumbColor={showDamageHeatmap ? colors.primary : colors.mutedText}
            />
          </View>
          <View style={[styles.switchCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={[styles.switchCardLabel, { color: colors.text }]} numberOfLines={2}>
              {t('map.avoidSevereToggle')}
            </Text>
            <Switch
              value={avoidSeverePotholes}
              onValueChange={setAvoidSeverePotholes}
              trackColor={{ false: colors.border, true: colors.primarySoft }}
              thumbColor={avoidSeverePotholes ? colors.primary : colors.mutedText}
            />
          </View>
        </ScrollView>

        {nearSevereAlert ? (
          <View style={[styles.alertBanner, { backgroundColor: colors.dangerSoft, borderColor: colors.danger }]}>
            <Ionicons name="warning" size={18} color={colors.danger} />
            <Text style={[styles.alertText, { color: colors.text }]} numberOfLines={2}>
              {t('map.alertSevereNear', { meters: Math.round(nearSevereAlert.meters) })}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.mapWrap} onLayout={onMapLayout}>
        {layout.height > 0 ? (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={region}
            onMapReady={() => setMapReady(true)}
            onLongPress={onLongPressMap}
            showsUserLocation
            showsMyLocationButton={false}
            showsCompass
            rotateEnabled
            pitchEnabled
            toolbarEnabled={false}
            mapType={isDark ? 'mutedStandard' : 'standard'}
            userInterfaceStyle={isDark ? 'dark' : 'light'}
          >
            {coords && accuracyM != null && accuracyM > 5 && accuracyM < 400 ? (
              <Circle
                center={coords}
                radius={accuracyM}
                strokeColor={`${colors.primary}55`}
                fillColor={`${colors.primary}18`}
                strokeWidth={1}
              />
            ) : null}

            {showDamageHeatmap
              ? pins.map((p) => (
                  <Circle
                    key={`h-${p.id}`}
                    center={{ latitude: p.latitude, longitude: p.longitude }}
                    radius={p.severity === 'high' ? 200 : p.severity === 'medium' ? 150 : 110}
                    strokeColor={heatmapStroke(p.severity, isDark)}
                    fillColor={heatmapFill(p.severity, isDark)}
                    strokeWidth={1}
                  />
                ))
              : null}

            {pins.map((p) => (
              <Marker
                key={p.id}
                coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                title={p.title}
                description={p.description}
                anchor={{ x: 0.5, y: 1 }}
              >
                <MapPotholePin severity={p.severity} />
              </Marker>
            ))}

            {destination ? (
              <Marker
                coordinate={destination}
                title={t('map.destTitle')}
                description={t('map.destDesc')}
              >
                <View style={styles.destMarker}>
                  <Ionicons name="flag" size={20} color="#FFFFFF" />
                </View>
              </Marker>
            ) : null}

            {routeOptions.map((r) => {
              const selected = r.id === selectedRouteId;
              const stroke = ROUTE_LINE[r.id] ?? colors.primary;
              return (
                <Polyline
                  key={r.id}
                  coordinates={r.coordinates}
                  strokeColor={lineStroke(stroke, selected)}
                  strokeWidth={selected ? 6 : 3}
                  lineCap="round"
                  lineJoin="round"
                  tappable
                  onPress={() => setSelectedRouteId(r.id)}
                />
              );
            })}
          </MapView>
        ) : null}

        {showLoader ? (
          <View style={styles.loader} pointerEvents="none">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loaderText}>{t('map.loading')}</Text>
          </View>
        ) : null}

        <View
          style={[
            styles.mapOverlayLegend,
            {
              backgroundColor: isDark ? 'rgba(22, 28, 36, 0.88)' : 'rgba(255, 255, 255, 0.92)',
              borderColor: colors.border,
            },
          ]}
          pointerEvents="box-none"
        >
          <Text style={[styles.overlayLegendTitle, { color: colors.mutedText }]}>{t('map.legend.severity')}</Text>
          <View style={styles.overlayLegendRow}>
            <LegendDot legendStyles={styles} color="#DC2626" label={t('map.legend.high')} />
            <LegendDot legendStyles={styles} color="#F59E0B" label={t('map.legend.medium')} />
            <LegendDot legendStyles={styles} color="#16A34A" label={t('map.legend.low')} />
          </View>
          {showDamageHeatmap ? (
            <View style={styles.overlayHeatmap}>
              <View style={styles.overlayHeatStrip}>
                <View style={[styles.overlayHeatSwatch, { backgroundColor: '#4ADE80' }]} />
                <View style={[styles.overlayHeatSwatch, { backgroundColor: '#FBBF24' }]} />
                <View style={[styles.overlayHeatSwatch, { backgroundColor: '#F97316' }]} />
                <View style={[styles.overlayHeatSwatch, { backgroundColor: '#EF4444' }]} />
              </View>
              <Text style={[styles.overlayHeatCaption, { color: colors.mutedText }]} numberOfLines={1}>
                {t('map.heatmapLegendCaption')}
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          style={styles.fab}
          onPress={() => {
            void refresh();
            recenter();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('map.fabA11y')}
        >
          <Ionicons name="locate" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {destination ? (
        <View style={styles.routePanel}>
          <View style={styles.routePanelHead}>
            <Text style={styles.routePanelTitle}>{t('map.routeOptions')}</Text>
            <Pressable onPress={clearDestination} hitSlop={10} accessibilityRole="button">
              <Text style={styles.clearDest}>{t('map.clearDest')}</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routeScroll}>
            {routeOptions.map((r) => {
              const selected = r.id === selectedRouteId;
              const line = ROUTE_LINE[r.id] ?? colors.primary;
              const copy = routeCopy(r.id, t);
              return (
                <Pressable
                  key={r.id}
                  onPress={() => setSelectedRouteId(r.id)}
                  style={[styles.routeCard, { borderColor: selected ? line : colors.border }]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  {r.recommended ? (
                    <View style={styles.recBadge}>
                      <Text style={styles.recBadgeText}>{t('map.routeBadge')}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.routeCardTitle}>{copy.title}</Text>
                  <Text style={styles.routeCardMeta}>{t('map.routeNear', { count: r.nearPotholeCount })}</Text>
                  <Text style={styles.routeCardHint} numberOfLines={3}>
                    {copy.hint}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.hintBar}>
          <Ionicons name="hand-left-outline" size={18} color={colors.mutedText} />
          <Text style={styles.hintBarText} numberOfLines={2}>
            {t('map.hintLongPress')}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function heatmapFill(severity: Severity, isDark: boolean) {
  if (severity === 'high') return isDark ? 'rgba(220,38,38,0.32)' : 'rgba(220,38,38,0.26)';
  if (severity === 'medium') return isDark ? 'rgba(245,158,11,0.28)' : 'rgba(245,158,11,0.24)';
  return isDark ? 'rgba(22,163,74,0.24)' : 'rgba(22,163,74,0.2)';
}

function heatmapStroke(severity: Severity, isDark: boolean) {
  if (severity === 'high') return isDark ? 'rgba(248,113,113,0.55)' : 'rgba(185,28,28,0.45)';
  if (severity === 'medium') return isDark ? 'rgba(252,211,77,0.5)' : 'rgba(180,83,9,0.4)';
  return isDark ? 'rgba(74,222,128,0.45)' : 'rgba(21,128,61,0.4)';
}

function LegendDot({
  legendStyles,
  color,
  label,
}: {
  legendStyles: ReturnType<typeof createMapStyles>;
  color: string;
  label: string;
}) {
  return (
    <View style={legendStyles.legendItem}>
      <View style={[legendStyles.legendSwatch, { backgroundColor: color }]} />
      <Text style={legendStyles.legendLabel}>{label}</Text>
    </View>
  );
}

function createMapStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xs,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.3,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12,
      lineHeight: 16,
      color: colors.mutedText,
    },
    coordLine: {
      marginTop: spacing.xs,
      fontSize: 11,
      fontWeight: '600',
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    warn: {
      marginTop: spacing.xs,
      fontSize: 12,
      color: colors.warning,
      fontWeight: '600',
    },
    switchScroll: {
      marginTop: spacing.sm,
    },
    switchScrollContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingRight: spacing.md,
    },
    switchCard: {
      width: 158,
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 12,
      borderWidth: 1,
    },
    switchCardLabel: {
      flex: 1,
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 15,
    },
    mapWrap: {
      flex: 1,
      minHeight: 320,
      marginHorizontal: 0,
      marginBottom: spacing.xs,
      borderRadius: 0,
      overflow: 'hidden',
      backgroundColor: colors.border,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    mapOverlayLegend: {
      position: 'absolute',
      left: spacing.sm,
      right: 68,
      bottom: spacing.sm,
      maxWidth: 520,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
      borderWidth: 1,
    },
    overlayLegendTitle: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    overlayLegendRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    overlayHeatmap: {
      marginTop: spacing.xs,
      paddingTop: spacing.xs,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: 'rgba(128,128,128,0.35)',
    },
    overlayHeatStrip: {
      flexDirection: 'row',
      gap: 4,
    },
    overlayHeatSwatch: {
      flex: 1,
      height: 6,
      borderRadius: 999,
    },
    overlayHeatCaption: {
      marginTop: 4,
      fontSize: 10,
      lineHeight: 13,
      fontWeight: '600',
    },
    loader: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(15,20,25,0.88)' : 'rgba(255,255,255,0.85)',
    },
    loaderText: {
      marginTop: spacing.sm,
      fontSize: 14,
      color: colors.mutedText,
      fontWeight: '600',
    },
    fab: {
      position: 'absolute',
      right: spacing.md,
      bottom: spacing.md,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 8,
      zIndex: 2,
    },
    destMarker: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.danger,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 4,
    },
    hintBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginHorizontal: spacing.md,
      marginBottom: spacing.xs,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    hintBarText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: colors.mutedText,
    },
    routePanel: {
      marginHorizontal: spacing.md,
      marginBottom: spacing.xs,
    },
    routePanelHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    routePanelTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.mutedText,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    clearDest: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.primary,
    },
    routeScroll: {
      gap: spacing.sm,
      paddingRight: spacing.lg,
    },
    routeCard: {
      width: 200,
      padding: spacing.md,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 2,
    },
    recBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.successSoft,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
      marginBottom: spacing.sm,
    },
    recBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.success,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    routeCardTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    routeCardMeta: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    routeCardHint: {
      marginTop: spacing.sm,
      fontSize: 11,
      lineHeight: 15,
      color: colors.mutedText,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    legendSwatch: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    alertBanner: {
      marginTop: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 10,
      borderWidth: 1,
    },
    alertText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 16,
    },
  });
}
