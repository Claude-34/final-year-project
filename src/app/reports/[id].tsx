import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { BackHeader } from '@/components/common/BackHeader';
import { Screen } from '@/components/common/Screen';
import { DetectionPreview } from '@/components/potholes/DetectionPreview';
import { SeverityBadge } from '@/components/potholes/SeverityBadge';
import { getReportById } from '@/features/reports/reports.service';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuthStore } from '@/store/auth.store';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';
import type { PotholeReport, ReportStatus, Severity } from '@/types/pothole';
import { nowIso } from '@/utils/date';

const WORKFLOW: ReportStatus[] = ['reported', 'verified', 'assigned', 'in_progress', 'repaired'];

function pickId(v: string | string[] | undefined): string {
  if (v == null) return '';
  return Array.isArray(v) ? v[0] : v;
}

type VerificationKind = 'exists' | 'repaired' | 'fake';

type Comment = { id: string; author: string; text: string; createdAt: string };

const DEMO: Record<
  string,
  { status: ReportStatus; severity: Severity; votes: Record<VerificationKind, number>; comments: Comment[] }
> = {
  'demo-1': {
    status: 'reported',
    severity: 'high',
    votes: { exists: 5, repaired: 0, fake: 1 },
    comments: [
      {
        id: 'c1',
        author: 'Sam',
        text: 'Still not fixed after 2 weeks',
        createdAt: nowIso(),
      },
    ],
  },
  'demo-2': {
    status: 'verified',
    severity: 'medium',
    votes: { exists: 3, repaired: 2, fake: 0 },
    comments: [{ id: 'c2', author: 'Lee', text: 'Confirmed — deep edge near curb', createdAt: nowIso() }],
  },
  'demo-3': {
    status: 'repaired',
    severity: 'low',
    votes: { exists: 0, repaired: 8, fake: 0 },
    comments: [],
  },
  r1: { status: 'verified', severity: 'high', votes: { exists: 4, repaired: 0, fake: 0 }, comments: [] },
  r2: { status: 'assigned', severity: 'medium', votes: { exists: 2, repaired: 1, fake: 0 }, comments: [] },
  r3: { status: 'reported', severity: 'low', votes: { exists: 1, repaired: 0, fake: 0 }, comments: [] },
};

function defaultVotes(id: string | undefined): Record<VerificationKind, number> {
  const d = id ? DEMO[id] : undefined;
  return d ? { ...d.votes } : { exists: 2, repaired: 0, fake: 0 };
}

function defaultComments(id: string | undefined): Comment[] {
  const d = id ? DEMO[id] : undefined;
  return d ? [...d.comments] : [];
}

export default function ReportDetailsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createReportDetailStyles(colors), [colors]);

  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = pickId(params.id);
  const user = useAuthStore((s) => s.user);

  const [stored, setStored] = useState<PotholeReport | null>(null);

  const refreshStored = useCallback(() => {
    void getReportById(id).then((r) => setStored(r));
  }, [id]);

  useEffect(() => {
    refreshStored();
  }, [refreshStored]);

  const demo = DEMO[id];
  const status = stored?.status ?? demo?.status ?? 'reported';
  const severity = stored?.severity ?? demo?.severity ?? 'medium';

  const [votes, setVotes] = useState<Record<VerificationKind, number>>(() => defaultVotes(id));
  const [myVote, setMyVote] = useState<VerificationKind | null>(null);
  const [comments, setComments] = useState<Comment[]>(() => defaultComments(id));
  const [draftComment, setDraftComment] = useState('');

  useEffect(() => {
    setVotes(defaultVotes(id));
    setComments(defaultComments(id));
    setMyVote(null);
    setDraftComment('');
  }, [id]);

  const stepIndex = WORKFLOW.indexOf(status);

  function castVote(type: VerificationKind) {
    if (myVote === type) return;
    setVotes((c) => {
      const n = { ...c };
      if (myVote) n[myVote] -= 1;
      n[type] += 1;
      return n;
    });
    setMyVote(type);
  }

  function postComment() {
    const text = draftComment.trim();
    if (!text) return;
    const author = user?.name ?? user?.email ?? 'You';
    setComments((prev) => [
      {
        id: `local-${Date.now()}`,
        author,
        text,
        createdAt: nowIso(),
      },
      ...prev,
    ]);
    setDraftComment('');
  }

  return (
    <Screen>
      <BackHeader label={t('common.back')} fallbackHref="/reports" />
      <Text style={styles.title}>{t('reportDetail.title')}</Text>
      <Text style={styles.subtitle}>
        {t('reportDetail.subtitlePrefix')} {id}
      </Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>{t('reportDetail.severity')}</Text>
          <SeverityBadge severity={severity} />
        </View>
        <Text style={styles.meta}>{t('reportDetail.statusLine', { status: t(`workflow.status.${status}`) })}</Text>
      </View>

      <View style={styles.workflowCard}>
        <Text style={styles.workflowTitle}>{t('reportDetail.workflowTitle')}</Text>
        {WORKFLOW.map((s, i) => (
          <View key={s} style={styles.workflowRow}>
            <Text style={[styles.workflowDot, i <= stepIndex ? styles.workflowDotOn : styles.workflowDotOff]}>
              {i <= stepIndex ? '✓' : '○'}
            </Text>
            <Text style={[styles.workflowLabel, i === stepIndex && styles.workflowLabelActive]}>
              {t(`workflow.status.${s}`)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t('reportDetail.verificationTitle')}</Text>
        <Text style={styles.meta}>{t('reportDetail.verificationHint')}</Text>
        <View style={styles.verifyRow}>
          {(['exists', 'repaired', 'fake'] as const).map((kind) => {
            const selected = myVote === kind;
            return (
              <Pressable
                key={kind}
                onPress={() => castVote(kind)}
                style={[
                  styles.verifyBtn,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.primarySoft : colors.background,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.verifyText, { color: selected ? colors.primary : colors.text }]}>
                  {t(`reportDetail.vote.${kind}`)} ({votes[kind]})
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t('reportDetail.commentsTitle')}</Text>
        <Text style={styles.meta}>{t('reportDetail.commentsHint')}</Text>
        <TextInput
          value={draftComment}
          onChangeText={setDraftComment}
          placeholder={t('reportDetail.commentPlaceholder')}
          placeholderTextColor={colors.mutedText}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          multiline
        />
        <AppButton title={t('reportDetail.addComment')} onPress={postComment} variant="secondary" />
        <View style={styles.commentList}>
          {comments.map((c) => (
            <View key={c.id} style={[styles.commentRow, { borderColor: colors.border }]}>
              <Text style={styles.commentAuthor}>{c.author}</Text>
              <Text style={styles.commentBody}>{c.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <DetectionPreview
        title={t('reportDetail.previewTitle')}
        description={t('reportDetail.previewDesc')}
      />
    </Screen>
  );
}

function createReportDetailStyles(colors: ThemeColors) {
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
    card: {
      marginTop: spacing.lg,
      padding: spacing.lg,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    workflowCard: {
      marginTop: spacing.md,
      padding: spacing.lg,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs,
    },
    workflowTitle: {
      fontWeight: '800',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    workflowRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    workflowDot: {
      width: 22,
      textAlign: 'center',
      fontWeight: '800',
    },
    workflowDotOn: {
      color: colors.success,
    },
    workflowDotOff: {
      color: colors.mutedText,
    },
    workflowLabel: {
      color: colors.mutedText,
      fontWeight: '600',
    },
    workflowLabelActive: {
      color: colors.text,
      fontWeight: '800',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    label: {
      color: colors.text,
      fontWeight: '800',
    },
    meta: {
      color: colors.mutedText,
      fontSize: 13,
      lineHeight: 19,
    },
    verifyRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    verifyBtn: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 12,
      borderWidth: 1.5,
    },
    verifyText: {
      fontWeight: '800',
      fontSize: 13,
    },
    input: {
      marginTop: spacing.sm,
      minHeight: 72,
      borderWidth: 1,
      borderRadius: 12,
      padding: spacing.md,
      textAlignVertical: 'top',
      fontSize: 15,
    },
    commentList: {
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    commentRow: {
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      gap: 4,
    },
    commentAuthor: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
    },
    commentBody: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
  });
}
