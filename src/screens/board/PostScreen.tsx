import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Post } from '../../components/board/PostCard';
import { colors, typography, spacing, radius, shadow } from '../../theme';

const SAMPLE_COMMENTS = [
  { id: 'c1', author: '익명', body: '저도 가고 싶어요!',    likeCount: 5, createdAt: '5분 전' },
  { id: 'c2', author: '익명2', body: 'ㅋㅋ 저도요 같이가요', likeCount: 2, createdAt: '3분 전' },
];

export default function PostScreen({ route, navigation }: any) {
  const post: Post = route.params.post;
  const insets     = useSafeAreaInsets();
  const [comment,  setComment]  = useState('');
  const [liked,    setLiked]    = useState(false);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.boardTagWrap}>
            <Text style={styles.boardTag}>{post.board}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Post body */}
          <View style={styles.postCard}>
            <Text style={styles.title}>{post.title}</Text>
            <View style={styles.meta}>
              <Text style={styles.author}>{post.isAnonymous ? '익명' : post.author}</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.time}>{post.createdAt}</Text>
            </View>
            <Text style={styles.body}>{post.preview}{'\n\n'}더 자세한 내용이 여기에 표시됩니다.</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, liked && styles.actionBtnActive]}
                onPress={() => setLiked(l => !l)}
              >
                <Text style={[styles.actionText, liked && styles.actionTextActive]}>
                  {liked ? '♥' : '♡'} {post.likeCount + (liked ? 1 : 0)}
                </Text>
              </TouchableOpacity>
              <View style={styles.actionBtn}>
                <Text style={styles.actionText}>💬 {post.commentCount}</Text>
              </View>
              <View style={styles.actionBtn}>
                <Text style={styles.actionText}>👁 {post.viewCount}</Text>
              </View>
            </View>
          </View>

          {/* Comments */}
          <Text style={styles.sectionTitle}>댓글 {SAMPLE_COMMENTS.length}</Text>
          {SAMPLE_COMMENTS.map(c => (
            <View key={c.id} style={styles.commentCard}>
              <View style={styles.commentTop}>
                <Text style={styles.commentAuthor}>{c.author}</Text>
                <Text style={styles.commentTime}>{c.createdAt}</Text>
              </View>
              <Text style={styles.commentBody}>{c.body}</Text>
              <TouchableOpacity style={styles.commentLike}>
                <Text style={styles.commentLikeText}>♡ {c.likeCount}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Comment input */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="댓글을 입력하세요"
            placeholderTextColor={colors.textTertiary}
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !comment.trim() && styles.sendBtnDisabled]}
            disabled={!comment.trim()}
          >
            <Text style={styles.sendText}>등록</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: spacing.base,
    paddingVertical:   spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  back:     { marginRight: spacing.sm },
  backIcon: { fontSize: 30, color: colors.textPrimary, lineHeight: 34, marginTop: -2 },
  boardTagWrap: { backgroundColor: colors.primaryLight, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  boardTag: { ...typography.label2, color: colors.primary },

  scroll: { padding: spacing.base, paddingBottom: 20 },

  postCard: {
    backgroundColor: colors.surface,
    borderRadius:    radius.lg,
    padding:         spacing.base,
    marginBottom:    spacing.base,
    ...shadow.sm,
  },
  title:    { ...typography.title2, marginBottom: spacing.sm },
  meta:     { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.base },
  author:   { ...typography.label2, color: colors.textSecondary },
  dot:      { ...typography.caption, marginHorizontal: 4, color: colors.textTertiary },
  time:     { ...typography.caption },
  body:     { ...typography.body1, lineHeight: 26 },

  actions: {
    flexDirection:  'row',
    gap:            8,
    marginTop:      spacing.base,
    paddingTop:     spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: 12,
    paddingVertical:   7,
    borderRadius:   radius.full,
    backgroundColor: colors.background,
    gap: 4,
  },
  actionBtnActive: { backgroundColor: colors.errorLight },
  actionText:      { ...typography.label2, color: colors.textSecondary },
  actionTextActive:{ color: colors.error },

  sectionTitle: { ...typography.label1, marginBottom: spacing.sm },

  commentCard: {
    backgroundColor: colors.surface,
    borderRadius:    radius.md,
    padding:         spacing.md,
    marginBottom:    spacing.sm,
    ...shadow.sm,
  },
  commentTop:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentAuthor: { ...typography.label2 },
  commentTime:   { ...typography.caption },
  commentBody:   { ...typography.body2 },
  commentLike:   { alignSelf: 'flex-start', marginTop: spacing.sm },
  commentLikeText: { ...typography.caption, color: colors.textSecondary },

  inputBar: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: spacing.base,
    paddingTop:      spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth:  1,
    borderTopColor:  colors.borderLight,
    gap:             spacing.sm,
  },
  input: {
    flex:            1,
    backgroundColor: colors.background,
    borderRadius:    radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical:   10,
    ...typography.body2,
  },
  sendBtn:         { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10 },
  sendBtnDisabled: { backgroundColor: colors.border },
  sendText:        { ...typography.label2, color: '#fff' },
});
