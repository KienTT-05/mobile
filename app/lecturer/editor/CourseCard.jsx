import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { lecturerApi } from '@/api/courseApi';
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

// Hàm hỗ trợ format tiền tệ
const formatMoney = (amount) => {
  if (amount === 0 || amount === '0' || !amount) return 'Miễn phí';
  return parseInt(amount).toLocaleString('vi-VN') + ' ₫';
};

export default function CourseCard({ item, router, fetchCourses, handlePublish, handleUnpublish }) {
  const [expanded, setExpanded] = useState(false);
  const [discountPrice, setDiscountPrice] = useState(item.discountPrice != null ? String(item.discountPrice) : '');
  const [updating, setUpdating] = useState(false);

  const sc = STATUS_COLOR[item.status ?? ''] ?? COLORS.textMuted;
  const originalPrice = item.price || 0;
  const hasDiscount = item.discountPrice != null;
  const currentSellPrice = hasDiscount ? item.discountPrice : originalPrice;

  // Hiệu ứng mở rộng Set Giá
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  // Xử lý gọi API cập nhật giá
  const handleUpdatePrice = async () => {
    const dp = discountPrice === '' ? null : parseInt(discountPrice, 10);
    
    // --- BẮT ĐẦU LOGIC KIỂM TRA GIÁ ---
    if (dp !== null) {
      if (dp < 0) {
        Alert.alert('Lỗi nhập liệu', 'Giá giảm không được là số âm!');
        return;
      }
      if (dp >= originalPrice) {
        Alert.alert('Lỗi nhập liệu', 'Giá giảm phải bé hơn giá gốc!');
        return;
      }
    }
    // --- KẾT THÚC LOGIC KIỂM TRA GIÁ ---

    setUpdating(true);
    try {
      await lecturerApi.updatePrice(item.courseGroupId, dp);
      Alert.alert('✅ Thành công', 'Đã cập nhật giá giảm mới!');
      void fetchCourses(); // Load lại list để lấy giá mới
      toggleExpand(); // Đóng form lại
    } catch (e) {
      Alert.alert('Lỗi', e?.response?.data?.message ?? 'Cập nhật giá thất bại');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* VÙNG THÔNG TIN CHÍNH ĐƯỢC CHIA 2 CỘT */}
      <View style={styles.cardMain}>
        
        {/* Cột Trái: Trạng thái + Tiêu đề + Mô tả */}
        <View style={styles.leftColumn}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: sc }]} />
            <Text style={[styles.statusLabel, { color: sc }]}>
              {STATUS_LABEL[item.status ?? ''] ?? item.status}
            </Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
          ) : null}
        </View>

        {/* Cột Phải: Giá + Số chương */}
        <View style={styles.rightColumn}>
          {hasDiscount && (
            <Text style={styles.originalPriceStrike}>{formatMoney(originalPrice)}</Text>
          )}
          <Text style={[styles.currentPrice, currentSellPrice === 0 && { color: COLORS.success }]}>
            {formatMoney(currentSellPrice)}
          </Text>
          <Text style={styles.unitCount}>{item.unit_count ?? 0} chương</Text>
        </View>
      </View>

      {/* Thông tin học viên, đánh giá */}
      <View style={styles.metaRow}>
        {[
          { icon: 'people-outline', text: `${item.student_count ?? 0} học viên` },
          { icon: 'star-outline', text: item.rating_score > 0 ? item.rating_score.toFixed(1) : '--', color: COLORS.accent },
        ].map((m) => (
          <View key={m.icon} style={styles.metaItem}>
            <Ionicons name={m.icon} size={12} color={m.color ?? COLORS.textSecondary} />
            <Text style={styles.metaText}>{m.text}</Text>
          </View>
        ))}
      </View>

      {/* Các nút hành động */}
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
            <Text style={[styles.actionText, { color: COLORS.warning }]}>Huỷ XB</Text>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }} />
        
        {/* Nút Set Giá gập/mở */}
        <TouchableOpacity 
          style={styles.expandBtn} 
          onPress={toggleExpand}
          activeOpacity={0.6}
        >
          <Text style={styles.expandText}>Set Giá</Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Form Set Giá */}
      {expanded && (
        <View style={styles.expandedSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Giá gốc</Text>
            <View style={styles.disabledInputBox}>
              <Text style={styles.disabledInputText}>{formatMoney(originalPrice)}</Text>
              <Ionicons name="lock-closed" size={14} color={COLORS.textMuted} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            {/* Đổi chữ "Giá bán mới" thành "Giá giảm" */}
            <Text style={styles.inputLabel}>Giá giảm (₫)</Text>
            <TextInput
              style={styles.activeInput}
              value={discountPrice}
              onChangeText={setDiscountPrice}
              placeholder="Nhập 0 để Miễn phí"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity 
            style={styles.applyBtn} 
            onPress={handleUpdatePrice} 
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                <Text style={styles.applyBtnText}>Áp dụng giảm giá</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2,
    overflow: 'hidden'
  },
  cardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm
  },
  leftColumn: {
    flex: 1,
    paddingRight: SPACING.sm
  },
  rightColumn: {
    alignItems: 'flex-end',
    minWidth: 80
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusLabel: { fontSize: 11, fontWeight: '600' },
  
  cardTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  cardDesc: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  
  originalPriceStrike: { fontSize: 11, color: COLORS.textMuted, textDecorationLine: 'line-through', marginBottom: 2 },
  currentPrice: { fontSize: 15, fontWeight: '800', color: COLORS.primary, marginBottom: 2 },
  unitCount: { color: COLORS.textMuted, fontSize: 11 },
  
  metaRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { color: COLORS.textSecondary, fontSize: 11 },
  
  actionsRow: {
    flexDirection: 'row', gap: SPACING.sm, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.sm, paddingVertical: 6,
    borderRadius: RADIUS.sm, backgroundColor: COLORS.background,
  },
  actionText: { fontSize: 11, fontWeight: '600' },
  
  expandBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: 8,
    backgroundColor: COLORS.background, borderRadius: RADIUS.sm
  },
  expandText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },

  expandedSection: {
    marginTop: SPACING.md, paddingTop: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.border, borderStyle: 'dashed',
    backgroundColor: COLORS.background + '55',
    paddingHorizontal: 8, borderRadius: RADIUS.sm, paddingBottom: 8
  },
  inputGroup: { marginBottom: SPACING.sm },
  inputLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 4 },
  disabledInputBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.background, height: 42, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, opacity: 0.7
  },
  disabledInputText: { color: COLORS.textMuted, fontSize: 14 },
  activeInput: {
    backgroundColor: COLORS.surface, height: 42, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.primary + '55',
    color: COLORS.textPrimary, fontSize: 14,
  },
  applyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: COLORS.primary, height: 40, borderRadius: RADIUS.sm, marginTop: SPACING.xs
  },
  applyBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' }
});