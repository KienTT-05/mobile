import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { studentApi } from '@/api/courseApi';
import { CourseCard, EmptyState, SectionHeader } from '@/components/ui';
import { COLORS, SPACING } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = [
  { key: 'Lập trình' },
  { key: 'Thiết kế' },
  { key: 'Marketing' },
  { key: 'AI / ML' },
  { key: 'Kinh doanh' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHome = useCallback(async () => {
    try {
      const res = await studentApi.getHome();
      setData(res.data);
    } catch {
      // silently fail – user can pull to refresh
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void fetchHome(); }, [fetchHome]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const renderCourse = ({ item }) => (
    <CourseCard
      course={item}
      onPress={() => router.push(`/course/${item.courseGroupId}`)}
    />
  );

  const CourseRow = ({ title, courses, sortBy }) =>
    courses.length === 0 ? null : (
      <View style={styles.section}>
        <SectionHeader
          title={title}
          onSeeAll={() => router.push({ pathname: '/search', params: { sortBy } })}
        />
        <FlatList
          data={courses}
          keyExtractor={(item) => item.courseGroupId}
          renderItem={renderCourse}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        />
      </View>
    );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); void fetchHome(); }}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Banner */}
      <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.banner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.userName}>{user?.name ?? 'Học viên'} 👋</Text>
          <Text style={styles.bannerSub}>Tiếp tục hành trình học tập</Text>
        </View>
        <Ionicons name="school" size={60} color="rgba(255,255,255,0.15)" />
      </LinearGradient>

      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <TouchableOpacity
          style={styles.searchBox}
          onPress={() => router.push('/search')}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <Text style={styles.searchPlaceholder}>Tìm kiếm khoá học...</Text>
        </TouchableOpacity>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catList}
      >
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.key}
            style={styles.catChip}
            onPress={() => router.push({ pathname: '/search', params: { keyword: c.key } })}
            activeOpacity={0.7}
          >
            <Text style={styles.catText}>{c.key}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Course sections */}
      <CourseRow
        title="🔥 Mới nhất"
        courses={data?.trending?.data ?? []}
        sortBy="newest"
      />
      <CourseRow
        title="🏆 Bán chạy nhất"
        courses={data?.bestSellers?.data ?? []}
        sortBy="popular"
      />
      <CourseRow
        title="❤️ Được yêu thích"
        courses={data?.mostLoved?.data ?? []}
        sortBy="highest_rated"
      />
      {(data?.recommended?.length ?? 0) > 0 && (
        <CourseRow
          title="✨ Gợi ý cho bạn"
          courses={data?.recommended ?? []}
          sortBy="newest"
        />
      )}

      {!data && (
        <EmptyState
          icon="wifi-outline"
          title="Không tải được dữ liệu"
          subtitle="Kiểm tra kết nối và kéo xuống để thử lại"
        />
      )}

      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  banner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.xl,
  },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  userName: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 2 },
  bannerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  searchWrapper: { paddingHorizontal: SPACING.md, marginTop: -20, marginBottom: SPACING.md },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 12,
    paddingHorizontal: SPACING.md, height: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
  },
  searchPlaceholder: { color: COLORS.textMuted, fontSize: 15 },
  catList: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.surface, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  catEmoji: { fontSize: 14 },
  catText: { color: COLORS.textSecondary, fontSize: 12 },
  section: { marginBottom: SPACING.lg },
  hList: { paddingLeft: SPACING.md, paddingRight: SPACING.md },
});
