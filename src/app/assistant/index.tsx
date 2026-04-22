import Ionicons from '@expo/vector-icons/Ionicons';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from 'react-native';

import { BackHeader } from '@/components/common/BackHeader';
import { Screen } from '@/components/common/Screen';
import { type ChatMessage, sendAssistantMessage } from '@/features/assistant/assistant.service';
import { translate } from '@/i18n/translate';
import type { AppLocale } from '@/i18n/types';
import { useTranslation } from '@/i18n/useTranslation';
import { useUiStore } from '@/store/ui.store';
import type { ThemeColors } from '@/theme/palettes';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';

type UiMessage = { id: string; role: 'user' | 'assistant'; text: string };

function welcomeForLocale(loc: AppLocale): UiMessage {
  return { id: 'welcome', role: 'assistant', text: translate(loc, 'assistant.welcome') };
}

export default function AssistantScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [messages, setMessages] = useState<UiMessage[]>(() => [
    welcomeForLocale(useUiStore.getState().locale),
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<UiMessage>>(null);
  const messagesRef = useRef<UiMessage[]>(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const w = welcomeForLocale(locale);
    setMessages([w]);
    messagesRef.current = [w];
    setInput('');
  }, [locale]);

  const suggestions = useMemo(
    () => [
      t('assistant.suggest1'),
      t('assistant.suggest2'),
      t('assistant.suggest3'),
      t('assistant.suggest4'),
    ],
    [t],
  );

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: UiMessage = {
        id: `${Date.now()}-u`,
        role: 'user',
        text: trimmed,
      };
      const nextThread = [...messagesRef.current, userMsg];
      messagesRef.current = nextThread;
      setMessages(nextThread);
      setInput('');
      setLoading(true);
      scrollToEnd();

      const history: ChatMessage[] = nextThread.map((x) => ({
        role: x.role,
        content: x.text,
      }));

      try {
        const reply = await sendAssistantMessage(history, locale);
        const withReply = [...messagesRef.current, { id: `${Date.now()}-a`, role: 'assistant' as const, text: reply }];
        messagesRef.current = withReply;
        setMessages(withReply);
      } catch {
        const errThread = [
          ...messagesRef.current,
          {
            id: `${Date.now()}-e`,
            role: 'assistant' as const,
            text: t('assistant.error'),
          },
        ];
        messagesRef.current = errThread;
        setMessages(errThread);
      } finally {
        setLoading(false);
        scrollToEnd();
      }
    },
    [loading, locale, scrollToEnd, t],
  );

  const renderItem: ListRenderItem<UiMessage> = useCallback(
    ({ item }) => (
      <View
        style={[
          styles.bubbleWrap,
          item.role === 'user' ? styles.bubbleWrapUser : styles.bubbleWrapAssistant,
        ]}
      >
        <View
          style={[
            styles.bubble,
            item.role === 'user'
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.bubbleText, item.role === 'user' ? styles.bubbleTextUser : { color: colors.text }]}>
            {item.text}
          </Text>
        </View>
      </View>
    ),
    [colors.primary, colors.surface, colors.text, styles],
  );

  return (
    <Screen scroll={false} fill>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <BackHeader label={t('common.close')} />
        <Text style={styles.title}>{t('assistant.title')}</Text>
        <Text style={styles.subtitle}>{t('assistant.subtitle')}</Text>

        <View style={styles.chipsRow}>
          {suggestions.map((s) => (
            <Pressable
              key={s}
              onPress={() => void send(s)}
              style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.surface }]}
              disabled={loading}
            >
              <Text style={[styles.chipText, { color: colors.primary }]} numberOfLines={2}>
                {s}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.notifLink, { backgroundColor: colors.primarySoft }]}
          onPress={() => router.push('/notifications' as Href)}
        >
          <Ionicons name="notifications-outline" size={18} color={colors.primary} />
          <Text style={[styles.notifLinkText, { color: colors.primary }]}>{t('assistant.openNotifications')}</Text>
        </Pressable>

        <FlatList
          ref={listRef}
          style={styles.list}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onContentSizeChange={scrollToEnd}
          ListFooterComponent={
            loading ? (
              <View style={styles.typing}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.typingText, { color: colors.mutedText }]}>{t('assistant.thinking')}</Text>
              </View>
            ) : null
          }
        />

        <View style={[styles.composer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t('assistant.placeholder')}
            placeholderTextColor={colors.mutedText}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
            multiline
            maxLength={800}
            editable={!loading}
            onSubmitEditing={() => void send(input)}
            blurOnSubmit={false}
          />
          <Pressable
            onPress={() => void send(input)}
            style={[styles.sendBtn, { backgroundColor: colors.primary }]}
            disabled={loading || !input.trim()}
            accessibilityRole="button"
            accessibilityLabel={t('assistant.sendA11y')}
          >
            <Ionicons name="arrow-up" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      marginTop: spacing.sm,
      fontSize: 14,
      lineHeight: 20,
      color: colors.mutedText,
    },
    chipsRow: {
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    chip: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '700',
    },
    notifLink: {
      marginTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: 12,
    },
    notifLinkText: {
      fontSize: 14,
      fontWeight: '700',
    },
    list: {
      flex: 1,
      marginTop: spacing.md,
    },
    bubbleWrap: {
      marginBottom: spacing.sm,
      maxWidth: '100%',
    },
    bubbleWrapUser: {
      alignItems: 'flex-end',
    },
    bubbleWrapAssistant: {
      alignItems: 'flex-start',
    },
    bubble: {
      maxWidth: '92%',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bubbleText: {
      fontSize: 15,
      lineHeight: 22,
    },
    bubbleTextUser: {
      color: '#FFFFFF',
    },
    typing: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
    },
    typingText: {
      fontSize: 14,
      fontWeight: '600',
    },
    composer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.sm,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xs,
      borderTopWidth: 1,
    },
    input: {
      flex: 1,
      minHeight: 44,
      maxHeight: 120,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: 16,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
