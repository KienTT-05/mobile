import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { AuthProvider } from '@/context/AuthContext';

function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    // Xử lý khi app đang chạy và nhận deep link
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url, router);
    });

    // Xử lý khi app được mở từ deep link lúc đang tắt
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url, router);
    });

    return () => subscription.remove();
  }, []);

  return null;
}

function handleDeepLink(url, router) {
  // studyhub://checkout/result?courseId=xxx&status=success
  if (!url?.includes('checkout/result')) return;

  const params = new URL(url).searchParams;
  const status   = params.get('status') ?? 'cancel';
  const courseId = params.get('courseId') ?? '';

  router.replace(`/checkout/result?status=${status}&courseId=${courseId}`);
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <DeepLinkHandler />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#0F172A' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="search" />
        <Stack.Screen name="course/[id]" />
        <Stack.Screen name="player/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="checkout/[id]" />
        <Stack.Screen name="checkout/result" />
        <Stack.Screen name="lecturer/statistics" />
        <Stack.Screen name="lecturer/courses" />
        <Stack.Screen name="lecturer/editor/[id]" />
      </Stack>
    </AuthProvider>
  );
}