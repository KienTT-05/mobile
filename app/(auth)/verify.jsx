import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { authApi } from '@/api/courseApi';
import { Button } from '@/components/ui';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { login } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const refs = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleChange = (val, idx) => {
    const next = [...otp];
    next[idx] = val.replace(/\D/, '').slice(-1);
    setOtp(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (key, idx) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      Alert.alert('Thiếu mã', 'Vui lòng nhập đủ 6 chữ số OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyEmail(email, code);
      await login(res.data.user, res.data.token);
      router.replace('/(tabs)');
    } catch (err) {
      const msg =
        err?.response?.data?.message ?? 'Mã xác nhận không đúng';
      Alert.alert('Xác thực thất bại', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.resendOtp(email);
      setCooldown(60);
      Alert.alert('Đã gửi lại', 'Mã OTP mới đã được gửi đến email của bạn');
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi lại OTP');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <View style={styles.iconWrapper}>
        <View style={styles.iconBg}>
          <Ionicons name="mail" size={48} color={COLORS.primary} />
        </View>
      </View>

      <Text style={styles.title}>Xác thực email</Text>
      <Text style={styles.subtitle}>
        Mã OTP đã được gửi đến{'\n'}
        <Text style={styles.emailText}>{email}</Text>
      </Text>

      {/* 6-digit OTP boxes */}
      <View style={styles.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={(r) => { refs.current[i] = r; }}
            style={[styles.otpBox, !!digit && styles.otpBoxFilled]}
            value={digit}
            onChangeText={(v) => handleChange(v, i)}
            onKeyPress={(e) => handleKeyPress(e.nativeEvent.key, i)}
            keyboardType="number-pad"
            maxLength={1}
            selectionColor={COLORS.primary}
          />
        ))}
      </View>

      <Button
        title="Xác nhận"
        onPress={handleVerify}
        loading={loading}
        icon="checkmark-circle-outline"
        style={{ marginHorizontal: SPACING.lg, marginTop: SPACING.xl }}
      />

      <View style={styles.resendRow}>
        <Text style={styles.resendText}>Không nhận được mã? </Text>
        {cooldown > 0 ? (
          <Text style={styles.resendCooldown}>Gửi lại sau {cooldown}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendLink}>Gửi lại</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.background,
    paddingTop: 60, paddingHorizontal: SPACING.lg,
  },
  backBtn: { marginBottom: SPACING.xl },
  iconWrapper: { alignItems: 'center', marginBottom: SPACING.lg },
  iconBg: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.primary + '22',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  subtitle: {
    color: COLORS.textSecondary, fontSize: 15,
    textAlign: 'center', marginTop: SPACING.sm, lineHeight: 22,
  },
  emailText: { color: COLORS.primary, fontWeight: '700' },
  otpRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: SPACING.xl,
  },
  otpBox: {
    width: 48, height: 56, borderRadius: RADIUS.md,
    borderWidth: 2, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    textAlign: 'center', fontSize: 22,
    color: COLORS.textPrimary, fontWeight: '700',
  },
  otpBoxFilled: { borderColor: COLORS.primary },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  resendText: { color: COLORS.textSecondary, fontSize: 13 },
  resendCooldown: { color: COLORS.textMuted, fontSize: 13 },
  resendLink: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
});
