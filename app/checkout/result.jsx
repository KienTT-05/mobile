import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';

export default function CheckoutResultScreen() {
  const router = useRouter();
  const { status, courseId } = useLocalSearchParams();

  const success = status === 'success';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons
          name={success ? 'checkmark-circle' : 'close-circle'}
          size={80}
          color={success ? COLORS.success : COLORS.danger}
        />
        <Text style={styles.title}>
          {success ? 'Thanh toán thành công!' : 'Thanh toán bị huỷ'}
        </Text>
        <Text style={styles.subtitle}>
          {success
            ? 'Khoá học đã được mở khoá. Chúc bạn học tốt!'
            : 'Bạn đã huỷ thanh toán. Có thể thử lại bất cứ lúc nào.'}
        </Text>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: success ? COLORS.success : COLORS.primary }]}
          onPress={() => success
            ? router.replace(`/course/${courseId}`)
            : router.back()
          }
        >
          <Text style={styles.btnText}>
            {success ? 'Vào học ngay' : 'Quay lại'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.homeLink}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.xl, margin: SPACING.lg, alignItems: 'center', gap: SPACING.md,
  },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  btn: { borderRadius: RADIUS.md, paddingVertical: 14, paddingHorizontal: SPACING.xl, marginTop: SPACING.sm },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  homeLink: { color: COLORS.textMuted, fontSize: 13, marginTop: SPACING.sm },
});