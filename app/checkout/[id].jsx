import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { studentApi } from '@/api/courseApi';
import { Button } from '@/components/ui';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import { effectivePrice, formatPrice } from '@/utils/formatPrice';

const PAYMENT_METHODS = [
  { key: 'payos', label: 'PayOS', icon: 'card', desc: 'Ngân hàng / Ví điện tử', color: '#1A56DB' },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { id, courseJson } = useLocalSearchParams();
  const course = courseJson ? JSON.parse(courseJson) : null;

  const [method, setMethod] = useState('payos');
  const [loading, setLoading] = useState(false);

  if (!course) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.textSecondary }}>Không tìm thấy thông tin khoá học</Text>
      </View>
    );
  }

  const ep = effectivePrice(course.price, course.discountPrice);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await studentApi.checkout(id, method);
      const payUrl = res.data?.payUrl;
      if (payUrl) {
        const ok = await Linking.canOpenURL(payUrl);
        if (ok) {
          await Linking.openURL(payUrl);
        } else {
          Alert.alert('Lỗi', 'Không thể mở trang thanh toán');
        }
      } else {
        Alert.alert('Lỗi', 'Không nhận được link thanh toán');
      }
    } catch (e) {
      const msg = e?.response?.data?.message ?? 'Thanh toán thất bại';
      Alert.alert('Lỗi thanh toán', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Course summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryThumb}>
            {course.thumbnail ? (
              <Image source={{ uri: course.thumbnail }} style={styles.thumbImg} />
            ) : (
              <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.thumbImg}>
                <Ionicons name="book" size={24} color="#fff" />
              </LinearGradient>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle} numberOfLines={2}>{course.title}</Text>
            <Text style={styles.summaryAuthor}>{course.author_name ?? 'Giảng viên'}</Text>
          </View>
        </View>

        {/* Price breakdown */}
        <View style={styles.priceCard}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giá gốc</Text>
            <Text style={styles.priceValue}>{formatPrice(course.price)}</Text>
          </View>
          {course.discountPrice != null && course.discountPrice < course.price && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giảm giá</Text>
              <Text style={styles.discountValue}>-{formatPrice(course.price - course.discountPrice)}</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{formatPrice(ep)}</Text>
          </View>
        </View>

        {/* Payment methods */}
        <View style={styles.paySection}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {PAYMENT_METHODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[styles.payOption, method === m.key && styles.payOptionActive]}
              onPress={() => setMethod(m.key)}
              activeOpacity={0.8}
            >
              <View style={[styles.payIcon, { backgroundColor: m.color + '22' }]}>
                <Ionicons name={m.icon} size={22} color={m.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.payLabel}>{m.label}</Text>
                <Text style={styles.payDesc}>{m.desc}</Text>
              </View>
              <View style={[styles.radio, method === m.key && styles.radioActive]}>
                {method === m.key && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaBar}>
        <View>
          <Text style={styles.ctaLabel}>Tổng</Text>
          <Text style={styles.ctaPrice}>{formatPrice(ep)}</Text>
        </View>
        <Button
          title="Thanh toán ngay"
          onPress={handleCheckout}
          loading={loading}
          icon="card-outline"
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: 56, paddingBottom: SPACING.md,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  summaryCard: {
    flexDirection: 'row', gap: SPACING.md,
    margin: SPACING.md, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: SPACING.md,
  },
  summaryThumb: { width: 80, height: 60, borderRadius: RADIUS.sm, overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  summaryTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  summaryAuthor: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  priceCard: { margin: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: SPACING.md },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  priceLabel: { color: COLORS.textSecondary, fontSize: 14 },
  priceValue: { color: COLORS.textPrimary, fontSize: 14 },
  discountValue: { color: COLORS.success, fontSize: 14, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm, marginTop: SPACING.sm },
  totalLabel: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  totalValue: { color: COLORS.primary, fontSize: 20, fontWeight: '800' },
  paySection: { margin: SPACING.md },
  payOption: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 2, borderColor: 'transparent',
  },
  payOptionActive: { borderColor: COLORS.primary },
  payIcon: { width: 44, height: 44, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  payLabel: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  payDesc: { color: COLORS.textSecondary, fontSize: 12 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  secureNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: SPACING.md },
  secureText: { color: COLORS.textMuted, fontSize: 12 },
  ctaBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  ctaLabel: { color: COLORS.textSecondary, fontSize: 11 },
  ctaPrice: { color: COLORS.primary, fontSize: 20, fontWeight: '800' },
});
