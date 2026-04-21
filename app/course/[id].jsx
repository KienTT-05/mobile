import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { studentApi } from '@/api/courseApi';
import { Button } from '@/components/ui';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { effectivePrice, formatPrice } from '@/utils/formatPrice';

function TagBadge({ tag }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{tag}</Text>
    </View>
  );
}

export default function CourseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isLoggedIn } = useAuth();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedUnit, setExpandedUnit] = useState(0);

  useEffect(() => { void fetchDetail(); }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await studentApi.getCourseDetail(id);
      setCourse(res.data.data);
      setIsEnrolled(Boolean(res.data.isEnrolled));
      setIsFree(Boolean(res.data.isFree));
    } catch {
      Alert.alert('Lỗi', 'Không tải được thông tin khoá học');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      Alert.alert('Yêu cầu đăng nhập', '', [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    setEnrolling(true);
    try {
      await studentApi.enrollCourse(id);
      setIsEnrolled(true);
      Alert.alert('✅ Thành công', 'Đăng ký khoá học thành công!');
    } catch (e) {
      Alert.alert('Lỗi', e?.response?.data?.message ?? 'Đăng ký thất bại');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading || !course) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const ep = effectivePrice(course.price, course.discountPrice);
  const tags = course.tags ? course.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const units = Array.isArray(course.courseData) ? course.courseData : [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Thumbnail */}
        <View style={styles.thumbWrap}>
          {course.thumbnail ? (
            <Image source={{ uri: course.thumbnail }} style={styles.thumb} />
          ) : (
            <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.thumb}>
              <Ionicons name="book" size={80} color="rgba(255,255,255,0.25)" />
            </LinearGradient>
          )}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <View style={styles.backBtnInner}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{course.title}</Text>

          <View style={styles.authorRow}>
            <Ionicons name="person-circle-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.authorText}>{course.author_name ?? 'Giảng viên'}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <Ionicons name="star" size={14} color={COLORS.accent} />
            <Text style={styles.statText}>
              {course.rating_score > 0 ? course.rating_score.toFixed(1) : 'Chưa có'}
            </Text>
            <Text style={styles.statDot}>·</Text>
            <Text style={styles.statText}>{course.student_count} học viên</Text>
            <Text style={styles.statDot}>·</Text>
            <Text style={styles.statText}>{units.length} chương</Text>
          </View>

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.map((t) => <TagBadge key={t} tag={t} />)}
            </View>
          )}

          {/* Description */}
          {course.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mô tả khoá học</Text>
              <Text style={styles.desc}>{course.description}</Text>
            </View>
          ) : null}

          {/* Curriculum */}
          {units.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nội dung khoá học</Text>
              {units.map((unit, uIdx) => (
                <View key={uIdx} style={styles.unitBlock}>
                  <TouchableOpacity
                    style={styles.unitHeader}
                    onPress={() => setExpandedUnit(expandedUnit === uIdx ? null : uIdx)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.unitTitle}>{unit.title ?? `Chương ${uIdx + 1}`}</Text>
                      <Text style={styles.unitCount}>{unit.items?.length ?? 0} bài học</Text>
                    </View>
                    <Ionicons
                      name={expandedUnit === uIdx ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>

                  {expandedUnit === uIdx &&
                    unit.items?.map((item, iIdx) => (
                      <View key={iIdx} style={styles.lessonRow}>
                        <Ionicons
                          name={
                            item.type === 'video'
                              ? 'play-circle-outline'
                              : item.type === 'quiz'
                                ? 'help-circle-outline'
                                : 'document-text-outline'
                          }
                          size={17}
                          color={item.isLocked && !isEnrolled ? COLORS.textMuted : COLORS.primary}
                        />
                        <Text
                          style={[styles.lessonTitle, item.isLocked && !isEnrolled && styles.lessonLocked]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        {item.isLocked && !isEnrolled ? (
                          <Ionicons name="lock-closed" size={13} color={COLORS.textMuted} />
                        ) : item.isPreview ? (
                          <Text style={styles.previewBadge}>Thử</Text>
                        ) : null}
                      </View>
                    ))}
                </View>
              ))}
            </View>
          )}

          {/* Reviews */}
          {(course.comments?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Đánh giá ({course.rating_count ?? 0})</Text>
              {course.comments.slice(0, 3).map((c) => (
                <View key={c.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{c.user_name}</Text>
                    <View style={{ flexDirection: 'row', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name="star"
                          size={11}
                          color={s <= c.rating ? COLORS.accent : COLORS.surfaceLight}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewContent}>{c.content}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* CTA bar */}
      <View style={styles.ctaBar}>
        <View>
          <Text style={[styles.ctaPrice, ep === 0 && styles.freePrice]}>{formatPrice(ep)}</Text>
          {course.discountPrice != null && course.discountPrice < course.price && (
            <Text style={styles.ctaOriginal}>{formatPrice(course.price)}</Text>
          )}
        </View>

        {isEnrolled ? (
          <Button
            title="Vào học ngay"
            onPress={() => router.push(`/player/${id}`)}
            icon="play-circle-outline"
            variant="success"
            style={{ flex: 1 }}
          />
        ) : isFree ? (
          <Button
            title="Đăng ký miễn phí"
            onPress={handleEnroll}
            loading={enrolling}
            icon="add-circle-outline"
            style={{ flex: 1 }}
          />
        ) : (
          <Button
            title="Mua khoá học"
            onPress={() => router.push({ pathname: `/checkout/[id]`, params: { id: id, courseJson: JSON.stringify(course) } })}
            icon="card-outline"
            style={{ flex: 1 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  thumbWrap: { height: 240, position: 'relative' },
  thumb: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: 48, left: SPACING.md },
  backBtnInner: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  content: { padding: SPACING.lg },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: SPACING.sm },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm },
  authorText: { color: COLORS.textSecondary, fontSize: 13 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.md },
  statText: { color: COLORS.textSecondary, fontSize: 13 },
  statDot: { color: COLORS.textMuted, fontSize: 13 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.md },
  tag: {
    backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  tagText: { color: COLORS.textSecondary, fontSize: 11 },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700', marginBottom: SPACING.sm },
  desc: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  unitBlock: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, marginBottom: SPACING.sm, overflow: 'hidden' },
  unitHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  unitTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  unitCount: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  lessonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: SPACING.md, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  lessonTitle: { flex: 1, color: COLORS.textPrimary, fontSize: 13 },
  lessonLocked: { color: COLORS.textMuted },
  previewBadge: {
    color: COLORS.primary, fontSize: 10, fontWeight: '700',
    backgroundColor: COLORS.primary + '22', borderRadius: RADIUS.full,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  reviewCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewerName: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  reviewContent: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
  ctaBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  ctaPrice: { color: COLORS.primary, fontSize: 22, fontWeight: '800' },
  freePrice: { color: COLORS.success },
  ctaOriginal: { color: COLORS.textMuted, fontSize: 11, textDecorationLine: 'line-through' },
});
