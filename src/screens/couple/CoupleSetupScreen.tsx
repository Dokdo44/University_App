import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../../theme';
import { authService }                          from '../../services/firebase';
import { createCoupleSpace, joinCoupleSpace }   from '../../services/coupleService';

type Mode = 'idle' | 'create' | 'join';

interface Props {
  userId:   string;
  onJoined: () => void;
}

export default function CoupleSetupScreen({ userId, onJoined }: Props) {
  const [mode,         setMode]         = useState<Mode>('idle');
  const [displayName,  setDisplayName]  = useState('');
  const [inviteCode,   setInviteCode]   = useState('');
  const [createdCode,  setCreatedCode]  = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);

  async function handleCreate() {
    if (!displayName.trim()) { Alert.alert('알림', '이름을 입력해 주세요.'); return; }
    setLoading(true);
    try {
      const space = await createCoupleSpace(userId, displayName.trim());
      setCreatedCode(space.inviteCode);
    } catch (e: any) {
      Alert.alert('오류', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!displayName.trim()) { Alert.alert('알림', '이름을 입력해 주세요.'); return; }
    if (!inviteCode.trim())  { Alert.alert('알림', '초대 코드를 입력해 주세요.'); return; }
    setLoading(true);
    try {
      await joinCoupleSpace(userId, displayName.trim(), inviteCode.trim());
      onJoined();
    } catch (e: any) {
      Alert.alert('오류', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>🎬</Text>
            <Text style={styles.title}>둘만의 영화 기록장</Text>
            <Text style={styles.subtitle}>파트너와 함께 영화를 기록하고{'\n'}추억을 쌓아보세요</Text>
          </View>

          {/* Idle: choose mode */}
          {mode === 'idle' && (
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => setMode('create')}>
                <Text style={styles.btnTextPrimary}>새 공간 만들기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => setMode('join')}>
                <Text style={styles.btnTextSecondary}>코드로 참여하기</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => authService.logout()} style={styles.logoutBtn}>
                <Text style={styles.logoutText}>로그아웃</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Create mode */}
          {mode === 'create' && !createdCode && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>내 이름 설정</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 정가원"
                placeholderTextColor={colors.textTertiary}
                value={displayName}
                onChangeText={setDisplayName}
                autoFocus
              />
              {loading
                ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
                : (
                  <>
                    <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleCreate}>
                      <Text style={styles.btnTextPrimary}>공간 만들기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setMode('idle')} style={styles.backBtn}>
                      <Text style={styles.backText}>뒤로</Text>
                    </TouchableOpacity>
                  </>
                )}
            </View>
          )}

          {/* Show invite code after creation */}
          {mode === 'create' && createdCode && (
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>파트너에게 이 코드를 공유하세요</Text>
              <Text style={styles.code}>{createdCode}</Text>
              <Text style={styles.codeHint}>파트너가 코드를 입력하면 공간이 연결됩니다</Text>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onJoined}>
                <Text style={styles.btnTextPrimary}>앱 계속 사용하기</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Join mode */}
          {mode === 'join' && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>내 이름 설정</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 신예서"
                placeholderTextColor={colors.textTertiary}
                value={displayName}
                onChangeText={setDisplayName}
              />
              <Text style={[styles.formTitle, { marginTop: spacing.base }]}>초대 코드 입력</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="XXXXXX"
                placeholderTextColor={colors.textTertiary}
                value={inviteCode}
                onChangeText={t => setInviteCode(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={6}
              />
              {loading
                ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
                : (
                  <>
                    <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleJoin}>
                      <Text style={styles.btnTextPrimary}>참여하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setMode('idle')} style={styles.backBtn}>
                      <Text style={styles.backText}>뒤로</Text>
                    </TouchableOpacity>
                  </>
                )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center' },
  header:    { alignItems: 'center', marginBottom: spacing.xxxl },
  emoji:     { fontSize: 56, marginBottom: spacing.base },
  title:     { ...typography.title1, marginBottom: spacing.sm, textAlign: 'center' },
  subtitle:  { ...typography.body2, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  buttonGroup: { gap: spacing.md },
  btn: {
    height:         52,
    borderRadius:   radius.lg,
    justifyContent: 'center',
    alignItems:     'center',
  },
  btnPrimary:     { backgroundColor: colors.primary },
  btnSecondary:   { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  btnTextPrimary: { ...typography.label1, color: '#fff' },
  btnTextSecondary:{ ...typography.label1, color: colors.textPrimary },

  form:       { gap: spacing.sm },
  formTitle:  { ...typography.label1, color: colors.textSecondary },
  input: {
    height:          52,
    backgroundColor: colors.surface,
    borderRadius:    radius.md,
    borderWidth:     1,
    borderColor:     colors.border,
    paddingHorizontal: spacing.base,
    ...typography.body1,
  },
  codeInput: { letterSpacing: 4, textAlign: 'center', ...typography.title2 },

  backBtn:  { alignItems: 'center', marginTop: spacing.sm },
  backText: { ...typography.body2, color: colors.textSecondary },

  logoutBtn: { alignItems: 'center', marginTop: spacing.xl },
  logoutText:{ ...typography.body2, color: colors.error },

  codeBox:   { alignItems: 'center', gap: spacing.base },
  codeLabel: { ...typography.body2, color: colors.textSecondary },
  code: {
    ...typography.display1,
    color:           colors.primary,
    letterSpacing:   6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.xl,
    paddingVertical:   spacing.base,
    borderRadius:    radius.lg,
  },
  codeHint: { ...typography.caption, textAlign: 'center' },
});
