import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../../theme';

const BOARDS = ['자유게시판', '비밀게시판', '취업·진로', '스터디', '분실물', '졸업생'];

export default function WritePostScreen({ navigation }: any) {
  const insets     = useSafeAreaInsets();
  const [board,    setBoard]     = useState(BOARDS[0]);
  const [title,    setTitle]     = useState('');
  const [body,     setBody]      = useState('');
  const [anon,     setAnon]      = useState(true);
  const canSubmit  = title.trim().length > 0 && body.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancel}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>새 글 작성</Text>
          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            disabled={!canSubmit}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
              등록
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Board selector */}
          <Text style={styles.label}>게시판 선택</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boardRow}>
            {BOARDS.map(b => (
              <TouchableOpacity
                key={b}
                style={[styles.boardChip, b === board && styles.boardChipActive]}
                onPress={() => setBoard(b)}
              >
                <Text style={[styles.boardChipText, b === board && styles.boardChipTextActive]}>
                  {b}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Title */}
          <TextInput
            style={styles.titleInput}
            placeholder="제목을 입력하세요"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          {/* Body */}
          <TextInput
            style={styles.bodyInput}
            placeholder="내용을 입력하세요"
            placeholderTextColor={colors.textTertiary}
            multiline
            textAlignVertical="top"
            value={body}
            onChangeText={setBody}
          />

          {/* Anonymous toggle */}
          <View style={styles.anonRow}>
            <View>
              <Text style={styles.anonLabel}>익명으로 작성</Text>
              <Text style={styles.anonSub}>이름 대신 '익명'으로 표시됩니다</Text>
            </View>
            <Switch
              value={anon}
              onValueChange={setAnon}
              trackColor={{ true: colors.primary, false: colors.border }}
              ios_backgroundColor={colors.border}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },

  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical:   spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cancel:          { ...typography.body1, color: colors.textSecondary },
  headerTitle:     { ...typography.title3 },
  submitBtn:       { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 7 },
  submitBtnDisabled:{ backgroundColor: colors.border },
  submitText:      { ...typography.label2, color: '#fff' },
  submitTextDisabled: { color: colors.textTertiary },

  scroll: { padding: spacing.base },

  label:    { ...typography.label1, marginBottom: spacing.sm },
  boardRow: { marginBottom: spacing.base },
  boardChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: radius.full, backgroundColor: colors.background,
    marginRight: 8,
  },
  boardChipActive:    { backgroundColor: colors.primary },
  boardChipText:      { ...typography.label2, color: colors.textSecondary },
  boardChipTextActive:{ color: '#fff' },

  titleInput: {
    ...typography.title3,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical:   spacing.md,
    marginBottom:      spacing.md,
  },
  bodyInput: {
    ...typography.body1,
    minHeight:       200,
    paddingTop:      0,
    marginBottom:    spacing.xl,
    lineHeight:      26,
  },

  anonRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  anonLabel: { ...typography.label1 },
  anonSub:   { ...typography.caption, marginTop: 2 },
});
