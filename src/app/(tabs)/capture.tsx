import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { Screen } from '@/components/common/Screen';
import { useCaptureDraftStore } from '@/features/capture/capture-draft.store';
import { capturePotholePhoto, pickPotholePhotoFromLibrary } from '@/features/capture/camera.service';
import { translateForUser, useTranslation } from '@/i18n/useTranslation';
import { useNotificationsStore } from '@/store/notifications.store';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';

export default function CaptureScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createCaptureStyles(colors), [colors]);

  const router = useRouter();
  const setDraft = useCaptureDraftStore((s) => s.setDraft);

  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState<'camera' | 'library' | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  function goToDetection(
    capture: {
      localUri: string;
      latitude?: number;
      longitude?: number;
      notes?: string;
    },
    source: 'camera' | 'library',
  ) {
    setDraft({
      imageUri: capture.localUri,
      latitude: capture.latitude,
      longitude: capture.longitude,
      notes: capture.notes,
    });
    useNotificationsStore.getState().pushNotification({
      title:
        source === 'camera'
          ? translateForUser('notify.capture.cameraTitle')
          : translateForUser('notify.capture.galleryTitle'),
      body: translateForUser('notify.capture.cameraBody'),
      kind: 'capture',
      href: '/detection/result',
    });
    router.push('/detection/result');
  }

  async function onTakePhoto() {
    setBusy('camera');
    setStatus(null);
    try {
      const capture = await capturePotholePhoto({ notes: notes.trim() || undefined });
      goToDetection(capture, 'camera');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : t('capture.errorCamera'));
    } finally {
      setBusy(null);
    }
  }

  async function onPickFromGallery() {
    setBusy('library');
    setStatus(null);
    try {
      const capture = await pickPotholePhotoFromLibrary({ notes: notes.trim() || undefined });
      goToDetection(capture, 'library');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : t('capture.errorGallery'));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>{t('capture.title')}</Text>
      <Text style={styles.subtitle}>{t('capture.subtitle')}</Text>
      <Text style={styles.tip}>{t('capture.multiAngleTip')}</Text>

      <View style={styles.form}>
        <AppInput
          label={t('capture.notesLabel')}
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder={t('capture.notesPlaceholder')}
        />

        {status ? <Text style={[styles.status, styles.statusError]}>{status}</Text> : null}

        <AppButton
          title={t('capture.takePhoto')}
          onPress={onTakePhoto}
          loading={busy === 'camera'}
          disabled={busy !== null}
        />
        <AppButton
          title={t('capture.fromGallery')}
          onPress={onPickFromGallery}
          variant="secondary"
          loading={busy === 'library'}
          disabled={busy !== null}
        />
      </View>
    </Screen>
  );
}

function createCaptureStyles(colors: ThemeColors) {
  return StyleSheet.create({
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.3,
    },
    subtitle: {
      marginTop: spacing.sm,
      fontSize: 15,
      lineHeight: 22,
      color: colors.mutedText,
    },
    tip: {
      marginTop: spacing.md,
      fontSize: 13,
      lineHeight: 19,
      color: colors.primary,
      fontWeight: '700',
    },
    form: {
      marginTop: spacing.lg,
      gap: spacing.md,
    },
    status: {
      fontSize: 14,
      fontWeight: '600',
    },
    statusError: {
      color: colors.danger,
    },
  });
}
