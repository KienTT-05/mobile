import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { authApi } from '@/api/courseApi';
import { Button, Input } from '@/components/ui';
import { COLORS, SPACING } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Vui lòng nhập họ tên';
    if (!email.trim()) e.email = 'Vui lòng nhập email';
    if (password.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự';
    else if (!/[A-Z]/.test(password)) e.password = 'Cần ít nhất 1 chữ in hoa';
    else if (!/[!@#$%^&*()\-_,.?":{}|<>]/.test(password))
      e.password = 'Cần ít nhất 1 ký tự đặc biệt';
    if (password !== confirm) e.confirm = 'Mật khẩu không khớp';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.register(name.trim(), email.trim(), password, confirm);
      if (res.data.status === 'needs_verification') {
        router.push({ pathname: '/(auth)/verify', params: { email: email.trim() } });
      }
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) {
        const mapped = {};
        Object.keys(data.errors).forEach((k) => {
          mapped[k] = data.errors[k][0];
        });
        setErrors(mapped);
      } else {
        Alert.alert('Lỗi', data?.message ?? 'Đăng ký thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Tham gia StudyHub ngay hôm nay 🚀</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Họ và tên"
            value={name}
            onChangeText={setName}
            placeholder="Nguyễn Văn A"
            icon="person-outline"
            error={errors.name}
            autoCapitalize="words"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            icon="mail-outline"
            error={errors.email}
          />
          <View style={styles.passWrapper}>
            <Input
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              placeholder="Ít nhất 6 ký tự, 1 hoa, 1 ký tự đặc biệt"
              secureTextEntry={!showPass}
              icon="lock-closed-outline"
              error={errors.password}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
              <Ionicons
                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <Input
            label="Xác nhận mật khẩu"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry={!showPass}
            icon="shield-checkmark-outline"
            error={errors.confirm}
          />

          <View style={styles.hint}>
            <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.hintText}>
              Mật khẩu cần: ít nhất 6 ký tự, 1 chữ hoa, 1 ký tự đặc biệt
            </Text>
          </View>

          <Button
            title="Đăng ký"
            onPress={handleRegister}
            loading={loading}
            icon="person-add-outline"
            style={{ marginTop: SPACING.sm }}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1 },
  header: { padding: SPACING.lg, paddingTop: 60 },
  backBtn: { marginBottom: SPACING.md },
  title: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '800' },
  subtitle: { color: COLORS.textSecondary, fontSize: 15, marginTop: 4 },
  form: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  passWrapper: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: SPACING.md, bottom: 30 },
  hint: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: SPACING.md },
  hintText: { color: COLORS.textMuted, fontSize: 11, flex: 1 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  loginText: { color: COLORS.textSecondary, fontSize: 15 },
  loginLink: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
});
