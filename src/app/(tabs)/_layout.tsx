import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useMemo } from 'react';

import { TabHeaderActions } from '@/components/navigation/TabHeaderActions';
import { useTranslation } from '@/i18n/useTranslation';
import { useTheme } from '@/theme/ThemeProvider';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t, locale } = useTranslation();

  const screenOptions = useMemo(
    () => ({
      headerShown: true,
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
      headerTitleStyle: { color: colors.text, fontWeight: '700' as const },
      headerShadowVisible: false,
      headerRight: () => <TabHeaderActions />,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.mutedText,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
      },
    }),
    [colors],
  );

  return (
    <Tabs key={locale} screenOptions={screenOptions}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: t('tabs.capture'),
          tabBarIcon: ({ color, size }) => <Ionicons name="camera" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t('tabs.map'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="map" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="priority"
        options={{
          title: t('tabs.priority'),
          tabBarIcon: ({ color, size }) => <Ionicons name="trending-up" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
