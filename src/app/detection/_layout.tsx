import { Stack } from 'expo-router';

export default function DetectionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="result" />
    </Stack>
  );
}
