import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import { effectivePrice, formatPrice } from '@/utils/formatPrice';

// ─── CourseCard (horizontal scroll) ──────────────────────────────────────────
export function CourseCard({ course, onPress }) {
  const ep = effectivePrice(course.price, course.discountPrice);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardThumb}>
        {course.thumbnail ? (
          <Image source={{ uri: course.thumbnail }} style={styles.thumbImg} />
        ) : (
          <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.thumbImg}>
            <Ionicons name="book-outline" size={28} color="#fff" />
          </LinearGradient>
        )}
        {course.discountPrice != null && course.discountPrice < course.price && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>SALE</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.cardAuthor} numberOfLines={1}>{course.author_name ?? 'Giảng viên'}</Text>
        <View style={styles.cardRow}>
          <Ionicons name="star" size={12} color={COLORS.accent} />
          <Text style={styles.ratingText}>
            {course.rating_score > 0 ? course.rating_score.toFixed(1) : '--'}
          </Text>
          <Text style={styles.ratingCount}>({course.student_count})</Text>
        </View>
        <Text style={[styles.cardPrice, ep === 0 && styles.freePrice]}>
          {formatPrice(ep)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── CourseCardWide (list) ────────────────────────────────────────────────────
export function CourseCardWide({ course, onPress, progress }) {
  const ep = effectivePrice(course.price, course.discountPrice);
  return (
    <TouchableOpacity style={styles.wideCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.wideThumb}>
        {course.thumbnail ? (
          <Image source={{ uri: course.thumbnail }} style={styles.thumbImg} />
        ) : (
          <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.thumbImg}>
            <Ionicons name="book-outline" size={20} color="#fff" />
          </LinearGradient>
        )}
      </View>
      <View style={styles.wideBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.cardAuthor}>{course.author_name ?? 'Giảng viên'}</Text>
        {progress !== undefined ? (
          <>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${Math.min(100, progress)}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}% hoàn thành</Text>
          </>
        ) : (
          <Text style={[styles.cardPrice, ep === 0 && styles.freePrice]}>
            {formatPrice(ep)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ title, onSeeAll }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
}) {
  const bg =
    variant === 'danger'
      ? COLORS.danger
      : variant === 'success'
        ? COLORS.success
        : COLORS.primary;
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        isOutline ? [styles.btnOutline, { borderColor: bg }] : { backgroundColor: bg },
        (disabled || loading) && styles.btnDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? bg : '#fff'} size="small" />
      ) : (
        <View style={styles.btnInner}>
          {icon && <Ionicons name={icon} size={18} color={isOutline ? bg : '#fff'} />}
          <Text style={[styles.btnText, isOutline && { color: bg }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, icon, style, ...props }) {
  return (
    <View style={[styles.inputWrapper, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[styles.inputBox, !!error && styles.inputBoxError]}>
        {icon && (
          <Ionicons name={icon} size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
        )}
        <TextInput
          style={styles.inputText}
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          {...props}
        />
      </View>
      {error && <Text style={styles.inputError}>{error}</Text>}
    </View>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = 'book-outline', title, subtitle }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = COLORS.primary }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // CourseCard
  card: {
    width: 192,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardThumb: { height: 116, backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  thumbImg: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  saleBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: COLORS.danger, borderRadius: RADIUS.sm,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  saleBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  cardBody: { padding: SPACING.sm },
  cardTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  cardAuthor: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 4 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  ratingText: { color: COLORS.accent, fontSize: 11 },
  ratingCount: { color: COLORS.textMuted, fontSize: 11 },
  cardPrice: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  freePrice: { color: COLORS.success },

  // Wide card
  wideCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  wideThumb: { width: 100, height: 80 },
  wideBody: { flex: 1, padding: SPACING.sm, justifyContent: 'space-between' },
  progressBg: { height: 5, backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.full, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.full },
  progressText: { color: COLORS.textSecondary, fontSize: 10, marginTop: 2 },

  // SectionHeader
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, marginBottom: SPACING.sm,
  },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' },
  seeAll: { color: COLORS.primary, fontSize: 13 },

  // Button
  btn: {
    borderRadius: RADIUS.md, paddingVertical: 14, paddingHorizontal: SPACING.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  btnOutline: { borderWidth: 1.5, backgroundColor: 'transparent' },
  btnDisabled: { opacity: 0.5 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Input
  inputWrapper: { marginBottom: SPACING.md },
  inputLabel: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 6 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, minHeight: 52,
  },
  inputBoxError: { borderColor: COLORS.danger },
  inputText: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },
  inputError: { color: COLORS.danger, fontSize: 11, marginTop: 4 },

  // EmptyState
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', marginTop: SPACING.md, textAlign: 'center' },
  emptySubtitle: { color: COLORS.textSecondary, fontSize: 15, marginTop: SPACING.sm, textAlign: 'center' },

  // StatCard
  statCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    padding: SPACING.md, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2,
  },
  statIcon: { width: 44, height: 44, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  statValue: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '800' },
  statLabel: { color: COLORS.textSecondary, fontSize: 11 },
});
