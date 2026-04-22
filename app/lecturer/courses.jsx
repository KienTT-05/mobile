import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  UIManager
} from 'react-native';
import { lecturerApi } from '@/api/courseApi';
import { Button, EmptyState } from '@/components/ui';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import CourseCard from './editor/CourseCard'; // Nạp Component thẻ khóa học vào đây

// Bật LayoutAnimation cho Android để có hiệu ứng chuyển động mượt mà
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LecturerCoursesScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await lecturerApi.getCourses();
      setCourses(res.data.data ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchCourses();
    }, [fetchCourses])
  );

  const handleCreate = async () => {
    if (!newTitle.trim()) { Alert.alert('Thiếu tiêu đề', 'Nhập tiêu đề khoá học'); return; }
    setCreating(true);
    try {
      const res = await lecturerApi.createCourse(newTitle.trim());
      const newId = res.data.courseGroupId;
      setNewTitle(''); setShowCreate(false);
      await fetchCourses();
      Alert.alert('Tạo thành công!', 'Chỉnh sửa khoá học ngay?', [
        { text: 'Sau', style: 'cancel' },
        { text: 'Chỉnh sửa', onPress: () => router.push(`/lecturer/editor/${newId}`) },
      ]);
    } catch (e) {
      Alert.alert('Lỗi', e?.response?.data?.message ?? 'Tạo thất bại');
    } finally { setCreating(false); }
  };

  const handlePublish = (courseGroupId) => {
    Alert.alert('Xuất bản', 'Khoá học sẽ được công khai.', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xuất bản', onPress: async () => {
        try { await lecturerApi.publishCourse(courseGroupId); void fetchCourses(); }
        catch (e) { Alert.alert('Lỗi', e?.response?.data?.message ?? ''); }
      }},
    ]);
  };

  const handleUnpublish = (courseGroupId) => {
    Alert.alert('Huỷ xuất bản', 'Khoá học sẽ bị ẩn.', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xác nhận', style: 'destructive', onPress: async () => {
        try { await lecturerApi.unpublishCourse(courseGroupId); void fetchCourses(); }
        catch { /* ignore */ }
      }},
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khoá học của tôi</Text>
        <Text style={styles.headerSub}>{courses.length} khoá học</Text>
      </LinearGradient>

      {/* Khung Tạo khóa học */}
      {showCreate ? (
        <View style={styles.createPanel}>
          <Text style={styles.createTitle}>Tạo khoá học mới</Text>
          <TextInput
            style={styles.createInput}
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Tiêu đề khoá học..."
            placeholderTextColor={COLORS.textMuted}
            autoFocus
          />
          <View style={styles.createActions}>
            <Button title="Huỷ" onPress={() => { setShowCreate(false); setNewTitle(''); }} variant="outline" style={{ flex: 1 }} />
            <Button title="Tạo" onPress={handleCreate} loading={creating} icon="add-circle-outline" style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.newBtn} onPress={() => setShowCreate(true)} activeOpacity={0.7}>
          <Ionicons name="add-circle" size={22} color={COLORS.primary} />
          <Text style={styles.newBtnText}>Tạo khoá học mới</Text>
        </TouchableOpacity>
      )}

      {/* Danh sách khóa học */}
      <FlatList
        data={courses}
        keyExtractor={(item, index) => {
          const id = item.courseGroupId || item._id || 'course';
          return `${id}-${index}`; 
        }}
        renderItem={({ item }) => (
          <CourseCard 
            item={item} 
            router={router}
            fetchCourses={fetchCourses}
            handlePublish={handlePublish}
            handleUnpublish={handleUnpublish}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void fetchCourses(); }} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <EmptyState icon="layers-outline" title="Chưa có khoá học" subtitle="Tạo khoá học đầu tiên!" />
        }
        contentContainerStyle={{ padding: SPACING.md, paddingTop: SPACING.sm, flexGrow: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { paddingTop: 56, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg },
  backBtn: { marginBottom: SPACING.md },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: SPACING.md, padding: SPACING.md,
    backgroundColor: COLORS.primary + '18',
    borderRadius: RADIUS.md, borderWidth: 1.5,
    borderColor: COLORS.primary, borderStyle: 'dashed',
  },
  newBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  createPanel: { margin: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md },
  createTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: SPACING.sm },
  createInput: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, height: 48,
    color: COLORS.textPrimary, fontSize: 15, marginBottom: SPACING.sm,
  },
  createActions: { flexDirection: 'row', gap: SPACING.sm },
});