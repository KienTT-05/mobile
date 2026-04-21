import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
} from 'react-native';
import { lecturerApi } from '@/api/courseApi';
import { Button, EmptyState } from '@/components/ui';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

const STATUS_COLOR = {
  DRAFT: COLORS.textMuted,
  PUBLISHED: COLORS.success,
  UNPUBLISHED: COLORS.warning,
  ARCHIVED: COLORS.danger,
};
const STATUS_LABEL = {
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Đã xuất bản',
  UNPUBLISHED: 'Chưa xuất bản',
  ARCHIVED: 'Lưu trữ',
};

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

  useEffect(() => { void fetchCourses(); }, [fetchCourses]);

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

  const renderItem = ({ item }) => {
    const sc = STATUS_COLOR[item.status ?? ''] ?? COLORS.textMuted;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.statusDot, { backgroundColor: sc }]} />
          <Text style={[styles.statusLabel, { color: sc }]}>
            {STATUS_LABEL[item.status ?? ''] ?? item.status}
          </Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.unitCount}>{item.unit_count ?? 0} chương</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.metaRow}>
          {[
            { icon: 'people-outline', text: `${item.student_count} học viên` },
            { icon: 'star-outline', text: item.rating_score > 0 ? item.rating_score.toFixed(1) : '--', color: COLORS.accent },
          ].map((m) => (
            <View key={m.icon} style={styles.metaItem}>
              <Ionicons name={m.icon} size={12} color={m.color ?? COLORS.textSecondary} />
              <Text style={styles.metaText}>{m.text}</Text>
            </View>
          ))}
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push(`/lecturer/editor/${item.courseGroupId}`)}
          >
            <Ionicons name="create-outline" size={15} color={COLORS.primary} />
            <Text style={[styles.actionText, { color: COLORS.primary }]}>Chỉnh sửa</Text>
          </TouchableOpacity>

          {item.status === 'DRAFT' && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => handlePublish(item.courseGroupId)}>
              <Ionicons name="cloud-upload-outline" size={15} color={COLORS.success} />
              <Text style={[styles.actionText, { color: COLORS.success }]}>Xuất bản</Text>
            </TouchableOpacity>
          )}
          {item.status === 'PUBLISHED' && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleUnpublish(item.courseGroupId)}>
              <Ionicons name="eye-off-outline" size={15} color={COLORS.warning} />
              <Text style={[styles.actionText, { color: COLORS.warning }]}>Huỷ xuất bản</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
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

      {/* Create panel */}
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

      <FlatList
        data={courses}
        keyExtractor={(item) => item.courseGroupId}
        renderItem={renderItem}
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
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusLabel: { fontSize: 11, fontWeight: '600' },
  unitCount: { color: COLORS.textMuted, fontSize: 11 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: SPACING.sm },
  metaRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { color: COLORS.textSecondary, fontSize: 11 },
  actionsRow: {
    flexDirection: 'row', gap: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.sm, paddingVertical: 6,
    borderRadius: RADIUS.sm, backgroundColor: COLORS.background,
  },
  actionText: { fontSize: 11, fontWeight: '600' },
});
