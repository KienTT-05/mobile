import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Vui lòng nhập email';
    if (!password) e.password = 'Vui lòng nhập mật khẩu';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.login(email.trim(), password);
      await login(res.data.user, res.data.token);
      router.replace('/(tabs)');
    } catch (err) {
      const msg =
        err?.response?.data?.message ?? 'Đăng nhập thất bại, thử lại!';
      Alert.alert('Lỗi đăng nhập', msg);
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
        {/* Hero gradient */}
        <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.hero}>
          <Ionicons name="school" size={64} color="#fff" />
          <Text style={styles.appName}>StudyHub</Text>
          <Text style={styles.heroSub}>Nền tảng học trực tuyến</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Chào mừng bạn trở lại 👋</Text>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            icon="mail-outline"
            error={errors.email}
            style={{ marginTop: SPACING.md }}
          />

          <View style={styles.passWrapper}>
            <Input
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPass}
              icon="lock-closed-outline"
              error={errors.password}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPass(!showPass)}
            >
              <Ionicons
                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Button
            title="Đăng nhập"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: SPACING.sm }}
          />

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
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
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  appName: { color: '#fff', fontSize: 36, fontWeight: '900', marginTop: 12, letterSpacing: 1 },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 15, marginTop: 4 },
  form: { flex: 1, padding: SPACING.lg },
  title: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '800', marginTop: SPACING.sm },
  subtitle: { color: COLORS.textSecondary, fontSize: 15, marginBottom: SPACING.lg },
  passWrapper: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: SPACING.md, bottom: 30 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  registerText: { color: COLORS.textSecondary, fontSize: 15 },
  registerLink: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
});
