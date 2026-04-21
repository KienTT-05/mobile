import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { studentApi } from '@/api/courseApi';
import { CourseCardWide, EmptyState } from '@/components/ui';
import { COLORS, SPACING } from '@/constants/theme';

export default function CoursesScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await studentApi.getMyCourses();
      setCourses(res.data.data ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void fetchCourses(); }, [fetchCourses]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Khoá học của tôi</Text>
        <Text style={styles.count}>{courses.length} khoá học</Text>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.courseGroupId}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); void fetchCourses(); }}
            tintColor={COLORS.primary}
          />
        }
        renderItem={({ item }) => (
          <CourseCardWide
            course={item}
            progress={item.progress ?? 0}
            onPress={() => router.push(`/player/${item.courseGroupId}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title="Chưa có khoá học nào"
            subtitle="Hãy khám phá và đăng ký khoá học đầu tiên!"
          />
        }
        contentContainerStyle={{ paddingTop: SPACING.sm, paddingBottom: SPACING.xl, flexGrow: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { padding: SPACING.lg, paddingTop: 56 },
  title: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '800' },
  count: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
});
