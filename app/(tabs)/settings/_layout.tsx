import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="search-engine" />
      <Stack.Screen name="homepage" />
      <Stack.Screen name="theme" />
      <Stack.Screen name="about" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="passwords" />
      <Stack.Screen name="language" />
      <Stack.Screen name="sync" />
      <Stack.Screen name="developer" />
      <Stack.Screen name="feedback" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms" />
    </Stack>
  );
}