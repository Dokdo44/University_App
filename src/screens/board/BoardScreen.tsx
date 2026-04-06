import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PostCard, { Post } from '../../components/board/PostCard';
import { colors, typography, spacing, shadow, radius } from '../../theme';

const BOARDS = ['전체', '자유게시판', '비밀게시판', '졸업생', '취업·진로', '스터디', '분실물'];

const SAMPLE_POSTS: Post[] = [
  {
    id: '1', board: '자유게시판',
    title: '중간고사 끝나고 MT 가는 사람?',
    preview: '이번 중간 다들 어떻게 됐나요 ㅋㅋ 같이 MT 기획하고 싶은 사람 댓글 달아줘요',
    likeCount: 34, commentCount: 12, viewCount: 280,
    isAnonymous: true, author: '익명', createdAt: '방금 전',
  },
  {
    id: '2', board: '취업·진로',
    title: '카카오 인턴 서류 합격했어요 🎉',
    preview: '2년 준비했는데 드디어 통과했네요. 지원하신 분들 다들 파이팅!',
    likeCount: 127, commentCount: 45, viewCount: 1240,
    isAnonymous: false, author: '컴공4', createdAt: '10분 전',
  },
  {
    id: '3', board: '스터디',
    title: '[모집] 알고리즘 스터디 4명 모집합니다',
    preview: '코테 준비 같이 하실 분들~ 주 2회, 온/오프 병행 예정입니다. 오픈채팅 링크 댓글에',
    likeCount: 8, commentCount: 23, viewCount: 310,
    isAnonymous: false, author: '정보통신3', createdAt: '1시간 전',
  },
  {
    id: '4', board: '비밀게시판',
    title: '교수님한테 연락하기 너무 무섭다',
    preview: '과제 기한 연장 부탁드리고 싶은데 어떻게 말씀드려야 할지... 다들 어떻게 하세요?',
    likeCount: 56, commentCount: 31, viewCount: 870,
    isAnonymous: true, author: '익명', createdAt: '2시간 전',
  },
  {
    id: '5', board: '분실물',
    title: '공학관 3층 에어팟 잃어버린 분 있나요?',
    preview: '오늘 오전 11시쯤 공학관 3층 복도에서 에어팟 프로 케이스 발견했습니다',
    likeCount: 3, commentCount: 7, viewCount: 190,
    isAnonymous: false, author: '전기공학2', createdAt: '3시간 전',
  },
];

export default function BoardScreen({ navigation }: any) {
  const insets        = useSafeAreaInsets();
  const [activeBoard, setActiveBoard] = useState('전체');

  const filtered = activeBoard === '전체'
    ? SAMPLE_POSTS
    : SAMPLE_POSTS.filter(p => p.board === activeBoard);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>게시판</Text>
        <TouchableOpacity
          style={styles.writeBtn}
          onPress={() => navigation.navigate('WritePost')}
        >
          <Text style={styles.writeBtnText}>✏️ 글쓰기</Text>
        </TouchableOpacity>
      </View>

      {/* Board filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {BOARDS.map(b => (
          <TouchableOpacity
            key={b}
            style={[styles.chip, b === activeBoard && styles.chipActive]}
            onPress={() => setActiveBoard(b)}
          >
            <Text style={[styles.chipText, b === activeBoard && styles.chipTextActive]}>
              {b}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Post list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => navigation.navigate('Post', { post: item })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>게시글이 없습니다</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  topBar: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingHorizontal: spacing.base,
    paddingVertical:   spacing.md,
  },
  pageTitle: { ...typography.title1 },
  writeBtn: {
    backgroundColor: colors.primary,
    borderRadius:    radius.full,
    paddingHorizontal: 14,
    paddingVertical:   8,
  },
  writeBtnText: { ...typography.label2, color: '#fff' },

  chipRow: { paddingHorizontal: spacing.base, paddingBottom: spacing.md, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical:   7,
    borderRadius:      radius.full,
    backgroundColor:   colors.surface,
    ...shadow.sm,
  },
  chipActive:     { backgroundColor: colors.primary },
  chipText:       { ...typography.label2, color: colors.textSecondary },
  chipTextActive: { color: '#fff' },

  list:      { paddingHorizontal: spacing.base, paddingBottom: 100 },
  empty:     { alignItems: 'center', paddingTop: 60 },
  emptyText: { ...typography.body2, color: colors.textTertiary },
});
