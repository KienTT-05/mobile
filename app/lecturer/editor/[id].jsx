import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { lecturerApi } from '@/api/courseApi';
import { Button, Input } from '@/components/ui';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

export default function CourseEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [price, setPrice] = useState('0');
  const [discountPrice, setDiscountPrice] = useState('');

  useEffect(() => { void fetchCourse(); }, [id]);

  const fetchCourse = async () => {
    try {
      let res;
      try {
        res = await lecturerApi.getDraft(id);
      } catch {
        res = await lecturerApi.getPublishedCourse(id);
      }
      const d = res.data.data;
      setCourse(d);
      setTitle(d.title ?? '');
      setDescription(d.description ?? '');
      setTags(d.tags ?? '');
      setPrice(String(d.price ?? 0));
      setDiscountPrice(d.discountPrice != null ? String(d.discountPrice) : '');
    } catch {
      Alert.alert('Lỗi', 'Không tải được khoá học');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Thiếu tiêu đề', 'Vui lòng nhập tiêu đề'); return; }
    setSaving(true);
    try {
    await lecturerApi.updateDraft(id, {
        title: title.trim(),
        description: description.trim(),
        tags: tags.trim(),
        price: parseInt(price, 10) || 0,
      });
      // Thêm nút OK và sự kiện chuyển trang
      Alert.alert('✅ Đã lưu', 'Bản nháp đã được cập nhật!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      Alert.alert('Lỗi', e?.response?.data?.message ?? 'Lưu thất bại');
    } finally { setSaving(false); }
  };

  const handleUpdatePrice = async () => {
    const dp = discountPrice === '' ? null : parseInt(discountPrice, 10);
    try {
      await lecturerApi.updatePrice(id, dp);
      Alert.alert('✅ Thành công', 'Đã cập nhật giá khuyến mãi!');
    } catch (e) {
      Alert.alert('Lỗi', e?.response?.data?.message ?? 'Thất bại');
    }
  };

  const handlePublish = () => {
    Alert.alert('Xuất bản khoá học', 'Khoá học sẽ được công khai. Tiếp tục?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xuất bản 🚀', onPress: async () => {
        try {
          await lecturerApi.publishCourse(id);
          Alert.alert('Thành công!', 'Khoá học đã được xuất bản 🎉', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        } catch (e) {
          Alert.alert('Lỗi', e?.response?.data?.message ?? 'Thất bại');
        }
      }},
    ]);
  };

  if (loading || !course) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isDraft = course.status === 'DRAFT';
  const isPublished = course.status === 'PUBLISHED';
  const statusColor = isDraft ? COLORS.textMuted : isPublished ? COLORS.success : COLORS.warning;
  const statusLabel = isDraft ? 'Bản nháp' : isPublished ? `Đã xuất bản (v${course.version ?? 1})` : course.status;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa khoá học</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color={COLORS.primary} />
            : <Text style={styles.saveText}>Lưu</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status pill */}
        <View style={styles.statusRow}>
          <View style={[styles.statusPill, { backgroundColor: statusColor + '22' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        {/* Basic info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          <Input label="Tiêu đề *" value={title} onChangeText={setTitle} placeholder="Tiêu đề khoá học..." icon="text-outline" />
          <Input
            label="Mô tả"
            value={description}
            onChangeText={setDescription}
            placeholder="Mô tả nội dung, mục tiêu khoá học..."
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
          <Input label="Tags (cách nhau bằng dấu phẩy)" value={tags} onChangeText={setTags} placeholder="vd: Lập trình, Python, AI" icon="pricetag-outline" />
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giá khoá học</Text>
          <Input label="Giá gốc (₫)" value={price} onChangeText={setPrice} placeholder="0 = Miễn phí" keyboardType="number-pad" icon="cash-outline" />

          {!isDraft && (
            <View style={styles.discountSection}>
              <Text style={styles.discountLabel}>Giá khuyến mãi (₫)</Text>
              <Text style={styles.discountHint}>Chỉ áp dụng cho khoá học đã xuất bản. Để trống để xoá khuyến mãi.</Text>
              <View style={styles.discountRow}>
                <TextInput
                  style={styles.discountInput}
                  value={discountPrice}
                  onChangeText={setDiscountPrice}
                  placeholder="Để trống = không khuyến mãi"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                />
                <TouchableOpacity style={styles.discountApplyBtn} onPress={handleUpdatePrice}>
                  <Text style={styles.discountApplyText}>Cập nhật</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Curriculum info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nội dung khoá học</Text>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Thêm / chỉnh sửa bài học và chương học trên giao diện web. App di động hỗ trợ quản lý thông tin và xuất bản.
            </Text>
          </View>
          {(course.courseData?.length ?? 0) > 0 && (
            <View style={styles.unitList}>
              {course.courseData.map((unit, idx) => (
                <View key={idx} style={styles.unitRow}>
                  <Ionicons name="folder-outline" size={15} color={COLORS.textSecondary} />
                  <Text style={styles.unitTitle}>{unit.title ?? `Chương ${idx + 1}`}</Text>
                  <Text style={styles.unitCount}>{unit.items?.length ?? 0} bài</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button title="Lưu bản nháp" onPress={handleSave} loading={saving} variant="outline" icon="save-outline" style={{ marginBottom: SPACING.sm }} />
          {isDraft && (
            <Button title="Xuất bản khoá học 🚀" onPress={handlePublish} icon="cloud-upload-outline" />
          )}
        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: 56, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' },
  saveText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: SPACING.md },
  statusRow: { marginTop: SPACING.md, marginBottom: SPACING.sm },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700', marginBottom: SPACING.sm },
  discountSection: { marginTop: SPACING.sm },
  discountLabel: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 4 },
  discountHint: { color: COLORS.textMuted, fontSize: 11, marginBottom: SPACING.sm },
  discountRow: { flexDirection: 'row', gap: SPACING.sm },
  discountInput: {
    flex: 1, height: 48, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, color: COLORS.textPrimary, fontSize: 15,
  },
  discountApplyBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  discountApplyText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  infoBox: {
    flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '18', borderRadius: RADIUS.md,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.primary + '44',
  },
  infoText: { flex: 1, color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
  unitList: { marginTop: SPACING.sm },
  unitRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  unitTitle: { flex: 1, color: COLORS.textPrimary, fontSize: 13 },
  unitCount: { color: COLORS.textMuted, fontSize: 11 },
  actionsSection: { marginBottom: SPACING.lg },
});
