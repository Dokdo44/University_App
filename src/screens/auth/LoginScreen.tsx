import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService }       from '../../services/firebase';
import { colors, typography, spacing, radius } from '../../theme';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await authService.login(email.trim(), password);
    } catch {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo area */}
        <View style={styles.logoWrap}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>U</Text>
          </View>
          <Text style={styles.appName}>UniTalk</Text>
          <Text style={styles.tagline}>우리 학교 커뮤니티</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>학교 이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="example@university.ac.kr"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.loginBtnText}>로그인</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>비밀번호를 잊으셨나요?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign up */}
        <View style={styles.signupRow}>
          <Text style={styles.signupPrompt}>아직 계정이 없으신가요? </Text>
          <TouchableOpacity>
            <Text style={styles.signupLink}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.surface, paddingHorizontal: spacing.xl },

  logoWrap: { alignItems: 'center', marginBottom: spacing.xxxl },
  logoBox: {
    width:           64,
    height:          64,
    borderRadius:    20,
    backgroundColor: colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing.md,
    shadowColor:     colors.primary,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.3,
    shadowRadius:    12,
  },
  logoText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  appName:  { ...typography.title1, marginBottom: 4 },
  tagline:  { ...typography.body2, color: colors.textSecondary },

  form:       { gap: spacing.base },
  inputGroup: { gap: spacing.xs },
  inputLabel: { ...typography.label1 },
  input: {
    backgroundColor: colors.surfaceSecond,
    borderRadius:    radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical:   14,
    ...typography.body1,
    borderWidth:     1,
    borderColor:     colors.borderLight,
  },

  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius:    radius.md,
    paddingVertical: 16,
    alignItems:      'center',
    marginTop:       spacing.sm,
    shadowColor:     colors.primary,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.25,
    shadowRadius:    8,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText:     { ...typography.title3, color: '#fff' },

  forgotBtn:  { alignItems: 'center', paddingVertical: spacing.sm },
  forgotText: { ...typography.body2, color: colors.textSecondary },

  signupRow:   { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  signupPrompt:{ ...typography.body2, color: colors.textSecondary },
  signupLink:  { ...typography.body2, color: colors.primary, fontWeight: '600' },
});
