import { translate } from '@/i18n/translate';
import type { AppLocale } from '@/i18n/types';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

const SYSTEM_PROMPT =
  'You are a helpful assistant for a pothole reporting mobile app. Users capture photos, run detection, submit reports, view a map with routes, and check priority rankings. Give short, practical answers (under 120 words unless they ask for detail). If unsure, suggest using Capture, Map, or Reports in the app.';

function keywordReply(userText: string, locale: AppLocale): string | null {
  const t = userText.toLowerCase();
  const test = (re: RegExp) => re.test(t);

  if (
    test(
      /capture|photo|camera|gallery|foto|galer|imagen|cámara|captur|bild|fotograf|appareil|caméra|kamera|fotografia/,
    )
  ) {
    return translate(locale, 'assistant.reply.capture');
  }
  if (test(/map|route|driving|gps|carte|itinéra|mapa|ruta|naveg|karte|fahren|standort/)) {
    return translate(locale, 'assistant.reply.map');
  }
  if (test(/report|submit|signalement|informe|relatório|meldung|absenden|envoyer|enviar/)) {
    return translate(locale, 'assistant.reply.report');
  }
  if (test(/priority|rank|score|priorit|clasif|prioridade|priorität|bewertung/)) {
    return translate(locale, 'assistant.reply.priority');
  }
  if (test(/notif|benachricht|notification|alert/)) {
    return translate(locale, 'assistant.reply.notif');
  }
  if (test(/dark|theme|sombre|oscuro|escuro|dunkel/)) {
    return translate(locale, 'assistant.reply.dark');
  }
  if (test(/^(hi|hey|hello|hola|bonjour|salut|ola|hallo|ciao)\b|^\s*hi\s*$/)) {
    return translate(locale, 'assistant.reply.hello');
  }
  return null;
}

function demoFallback(userText: string, locale: AppLocale): string {
  const specific = keywordReply(userText, locale);
  if (specific) return specific;
  return translate(locale, 'assistant.reply.demo');
}

async function openAiReply(messages: ChatMessage[], apiKey: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 450,
      temperature: 0.5,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `OpenAI error ${res.status}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty assistant response');
  return text;
}

/**
 * Returns the assistant’s next message. Uses OpenAI when `EXPO_PUBLIC_OPENAI_API_KEY` is set; otherwise keyword + demo replies (localized).
 */
export async function sendAssistantMessage(
  messages: ChatMessage[],
  locale: AppLocale = 'en',
): Promise<string> {
  const last = messages.filter((m) => m.role === 'user').pop()?.content ?? '';
  await new Promise((r) => setTimeout(r, 380));

  const apiKey =
    typeof process.env.EXPO_PUBLIC_OPENAI_API_KEY === 'string'
      ? process.env.EXPO_PUBLIC_OPENAI_API_KEY.trim()
      : '';
  if (apiKey.length > 0) {
    try {
      return await openAiReply(messages, apiKey);
    } catch {
      return `${demoFallback(last, locale)}\n\n${translate(locale, 'assistant.reply.cloudFallback')}`;
    }
  }

  return demoFallback(last, locale);
}
