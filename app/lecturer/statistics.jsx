import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { lecturerApi } from '@/api/courseApi';
import { StatCard } from '@/components/ui';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import { formatPrice } from '@/utils/formatPrice';

export default function StatisticsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await lecturerApi.getStatistics();
      setStats(res.data);
    } catch { /* ignore */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { void fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const topCourses = stats?.topCourses ?? stats?.courses ?? [];
  const monthly = stats?.monthlyRevenue;
  const maxRevenue = monthly ? Math.max(...Object.values(monthly), 1) : 1;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); void fetchStats(); }}
          tintColor={COLORS.primary}
        />
      }
    >
      <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê</Text>
        <Text style={styles.headerSub}>Tổng quan khoá học & doanh thu</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* KPI cards */}
        <Text style={styles.sectionTitle}>Tổng quan</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Học viên" value={stats?.totalStudents ?? 0} icon="people-outline" color={COLORS.primary} />
          <StatCard label="Doanh thu" value={formatPrice(stats?.totalRevenue ?? 0)} icon="cash-outline" color={COLORS.success} />
          <StatCard label="Khoá học" value={stats?.totalCourses ?? 0} icon="book-outline" color={COLORS.secondary} />
          <StatCard
            label="Đánh giá TB"
            value={stats?.averageRating != null ? `${stats.averageRating.toFixed(1)} ⭐` : 'N/A'}
            icon="star-outline"
            color={COLORS.accent}
          />
        </View>

        {/* Top courses */}
        {topCourses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Khoá học nổi bật</Text>
            {topCourses.map((course, idx) => (
              <View key={course.courseGroupId ?? idx} style={styles.courseRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
                  <View style={styles.courseStats}>
                    <View style={styles.courseStat}>
                      <Ionicons name="people-outline" size={12} color={COLORS.textSecondary} />
                      <Text style={styles.courseStatText}>{course.student_count} học viên</Text>
                    </View>
                    <View style={styles.courseStat}>
                      <Ionicons name="star-outline" size={12} color={COLORS.accent} />
                      <Text style={styles.courseStatText}>
                        {course.rating_score > 0 ? course.rating_score.toFixed(1) : '--'}
                      </Text>
                    </View>
                    {course.revenue != null && (
                      <View style={styles.courseStat}>
                        <Ionicons name="cash-outline" size={12} color={COLORS.success} />
                        <Text style={styles.courseStatText}>{formatPrice(course.revenue)}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Monthly revenue */}
        {monthly && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Doanh thu theo tháng</Text>
            {Object.entries(monthly)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .slice(0, 6)
              .map(([month, amount]) => (
                <View key={month} style={styles.monthRow}>
                  <Text style={styles.monthLabel}>{month}</Text>
                  <View style={styles.revBar}>
                    <View
                      style={[
                        styles.revBarFill,
                        { width: `${Math.round((amount / maxRevenue) * 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.monthAmount}>{formatPrice(amount)}</Text>
                </View>
              ))}
          </View>
        )}
      </View>
      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { paddingTop: 56, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.lg },
  backBtn: { marginBottom: SPACING.md },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  content: { padding: SPACING.md },
  statsGrid: { gap: SPACING.sm, marginBottom: SPACING.lg },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700', marginBottom: SPACING.sm },
  section: { marginBottom: SPACING.lg },
  courseRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
  },
  rankBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary + '22', justifyContent: 'center', alignItems: 'center',
  },
  rankText: { color: COLORS.primary, fontSize: 13, fontWeight: '800' },
  courseTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  courseStats: { flexDirection: 'row', gap: SPACING.md, flexWrap: 'wrap' },
  courseStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  courseStatText: { color: COLORS.textSecondary, fontSize: 11 },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  monthLabel: { color: COLORS.textSecondary, fontSize: 11, width: 56 },
  revBar: { flex: 1, height: 8, backgroundColor: COLORS.surface, borderRadius: RADIUS.full, overflow: 'hidden' },
  revBarFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: RADIUS.full },
  monthAmount: { color: COLORS.textPrimary, fontSize: 11, width: 86, textAlign: 'right' },
});
