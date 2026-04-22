import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { studentApi } from '@/api/courseApi';
import { CourseCardWide, EmptyState } from '@/components/ui';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

const SORTS = [
  { key: 'newest', label: 'Mới nhất' },
  { key: 'highest_rated', label: 'Đánh giá cao' },
  { key: 'popular', label: 'Phổ biến' },
  { key: 'price_asc', label: 'Giá ↑' },
  { key: 'price_desc', label: 'Giá ↓' },
];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [keyword, setKeyword] = useState(params.keyword ?? '');
  const [sortBy, setSortBy] = useState(params.sortBy ?? 'newest');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentApi.search({ keyword, sortBy });
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, sortBy]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => void search(), 500);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Tìm kiếm khoá học..."
            placeholderTextColor={COLORS.textMuted}
            autoFocus={!keyword}
            returnKeyType="search"
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => setKeyword('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort chips - cố định */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortList}
        style={styles.sortScroll}
      >
        {SORTS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.sortChip, sortBy === item.key && styles.sortChipActive]}
            onPress={() => setSortBy(item.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.sortChipText, sortBy === item.key && styles.sortChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results - flex:1 để chiếm phần còn lại */}
      <View style={styles.resultsContainer}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.courseGroupId}
            renderItem={({ item }) => (
              <CourseCardWide
                course={item}
                onPress={() => router.push(`/course/${item.courseGroupId}`)}
              />
            )}
            ListHeaderComponent={
              results.length > 0 ? (
                <Text style={styles.resultCount}>{results.length} kết quả</Text>
              ) : null
            }
            ListEmptyComponent={
              <EmptyState
                icon="search-outline"
                title={keyword ? `Không tìm thấy "${keyword}"` : 'Nhập từ khoá để tìm kiếm'}
                subtitle={keyword ? 'Thử từ khoá khác' : undefined}
              />
            }
            contentContainerStyle={{ paddingBottom: SPACING.xl }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingTop: 56, paddingBottom: SPACING.sm,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm, height: 44,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },
  sortScroll: { flexGrow: 0, flexShrink: 0 },             // ← cố định chiều cao ScrollView
  sortList: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: 8 },
  sortChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    alignSelf: 'flex-start',
  },
  sortChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sortChipText: { color: COLORS.textSecondary, fontSize: 12 },
  sortChipTextActive: { color: '#fff', fontWeight: '700' },
  resultsContainer: { flex: 1 },                           // ← chiếm toàn bộ phần còn lại
  resultCount: {
    color: COLORS.textSecondary, fontSize: 13,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
});
