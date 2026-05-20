import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

function MenuItem({ icon, label, onPress, color }) {
  const c = color ?? COLORS.primary;
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: c + '22' }]}>
        <Ionicons name={icon} size={20} color={c} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLecturer, viewMode, toggleViewMode } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(-2)
        .join('')
        .toUpperCase()
    : 'SH';

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Avatar banner */}
      <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.banner}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'Học viên'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.roleText}>
            {user?.role === 'admin'
              ? '👑 Admin'
              : user?.role === 'lecturer'
                ? '🎓 Giảng viên'
                : '📚 Học viên'}
          </Text>
        </View>
      </LinearGradient>
      {/* Switch mode */}
      <TouchableOpacity style={styles.switchBtn} onPress={toggleViewMode} activeOpacity={0.8}>
        <Ionicons
          name={viewMode === 'student' ? 'school-outline' : 'person-outline'}
          size={20}
          color="#fff"
        />
        <Text style={styles.switchText}>
          {viewMode === 'student' ? 'Chuyển sang chế độ Giảng viên' : 'Chuyển sang chế độ Học viên'}
        </Text>
        <Ionicons name="swap-horizontal" size={18} color="#fff" />
      </TouchableOpacity>
      {/* Student section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>HỌC TẬP</Text>
        <MenuItem
          icon="search-outline"
          label="Khám phá khoá học"
          onPress={() => router.push('/search')}
        />
      </View>

      {/* Lecturer section */}
      {isLecturer && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GIẢNG DẠY</Text>
          <MenuItem
            icon="stats-chart-outline"
            label="Thống kê doanh thu"
            color={COLORS.accent}
            onPress={() => router.push('/lecturer/statistics')}
          />
          <MenuItem
            icon="layers-outline"
            label="Quản lý khoá học"
            color={COLORS.secondary}
            onPress={() => router.push('/lecturer/courses')}
          />
        </View>
      )}

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>TÀI KHOẢN</Text>
        <MenuItem
          icon="help-circle-outline"
          label="Trợ giúp & Hỗ trợ"
          color={COLORS.secondary}
          onPress={() => Alert.alert('Hỗ trợ', 'Email: support@studyhub.vn')}
        />
        <MenuItem
          icon="information-circle-outline"
          label="Về ứng dụng"
          color={COLORS.textSecondary}
          onPress={() => Alert.alert('StudyHub v1.0', 'Nền tảng học trực tuyến hiện đại\nPowered by Expo Router')}
        />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

      <Text style={styles.version}>StudyHub v1.0.0 · Expo SDK 54</Text>
      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  banner: { alignItems: 'center', paddingTop: 60, paddingBottom: SPACING.xl },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: SPACING.sm,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  name: { color: '#fff', fontSize: 22, fontWeight: '800' },
  email: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  rolePill: {
    marginTop: SPACING.sm, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4,
  },
  switchBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  switchText: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 14 },
    roleText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  section: {
    margin: SPACING.md, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, overflow: 'hidden',
  },
  sectionLabel: {
    color: COLORS.textSecondary, fontSize: 11, fontWeight: '700',
    letterSpacing: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  menuIcon: { width: 36, height: 36, borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    margin: SPACING.md, backgroundColor: COLORS.danger + '18',
    borderRadius: RADIUS.md, paddingVertical: 14,
    borderWidth: 1, borderColor: COLORS.danger + '44',
  },
  logoutText: { color: COLORS.danger, fontSize: 15, fontWeight: '700' },
  version: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center', marginBottom: SPACING.sm },
});
