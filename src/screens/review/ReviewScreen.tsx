import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, shadow } from '../../theme';

interface Review {
  id:         string;
  course:     string;
  professor:  string;
  year:       string;
  rating:     number;
  tags:       string[];
  content:    string;
  likeCount:  number;
}

const SAMPLE: Review[] = [
  {
    id: '1', course: '운영체제', professor: '김철수',
    year: '2024 가을', rating: 4.5,
    tags: ['과제많음', '시험어려움', '열정적'],
    content: '수업 자체는 재밌는데 과제가 정말 많아요. 시험은 꽤 어렵지만 배우는 게 많습니다. 프로젝트 위주라 실력이 많이 늘어요.',
    likeCount: 24,
  },
  {
    id: '2', course: '데이터베이스', professor: '이영희',
    year: '2025 봄', rating: 5.0,
    tags: ['친절함', '성적잘줌', '수업좋음'],
    content: '교수님이 정말 친절하시고 질문도 잘 받아주세요. 과제도 합리적이고 수업 내용도 체계적입니다. 강추!',
    likeCount: 67,
  },
  {
    id: '3', course: '알고리즘', professor: '박민준',
    year: '2024 봄', rating: 3.0,
    tags: ['시험어려움', '강의빠름', '출석체크'],
    content: '강의 속도가 빠르고 시험이 매우 어렵습니다. 미리 예습하고 가지 않으면 따라가기 힘들어요. 알고리즘 기초가 확실해야 들을 수 있는 수업.',
    likeCount: 11,
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Text key={i} style={{ fontSize: 13, color: i <= rating ? '#F7AE00' : colors.border }}>
          ★
        </Text>
      ))}
      <Text style={[typography.label2, { color: colors.textSecondary, marginLeft: 4 }]}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

export default function ReviewScreen() {
  const insets  = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = SAMPLE.filter(
    r => r.course.includes(query) || r.professor.includes(query),
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>강의평가</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="강의명 또는 교수명 검색"
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={r => r.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: r }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.courseName}>{r.course}</Text>
                <Text style={styles.prof}>{r.professor} · {r.year}</Text>
              </View>
              <Stars rating={r.rating} />
            </View>

            <View style={styles.tags}>
              {r.tags.map(t => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.content} numberOfLines={3}>{r.content}</Text>

            <TouchableOpacity style={styles.likeBtn}>
              <Text style={styles.likeBtnText}>♡ 도움이 됐어요 {r.likeCount}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  topBar: {
    paddingHorizontal: spacing.base,
    paddingVertical:   spacing.md,
  },
  pageTitle: { ...typography.title1 },

  searchWrap: { paddingHorizontal: spacing.base, marginBottom: spacing.md },
  search: {
    backgroundColor: colors.surface,
    borderRadius:    radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical:   12,
    ...typography.body2,
    ...shadow.sm,
  },

  list: { paddingHorizontal: spacing.base, paddingBottom: 100 },

  card: {
    backgroundColor: colors.surface,
    borderRadius:    radius.lg,
    padding:         spacing.base,
    marginBottom:    spacing.sm,
    ...shadow.sm,
  },
  cardTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   spacing.md,
  },
  courseName: { ...typography.title3, marginBottom: 2 },
  prof:       { ...typography.caption },

  tags:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md },
  tag:     { backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { ...typography.caption2, color: colors.textSecondary },

  content:  { ...typography.body2, lineHeight: 22, color: colors.textSecondary },

  likeBtn:     { alignSelf: 'flex-start', marginTop: spacing.md },
  likeBtnText: { ...typography.label2, color: colors.textSecondary },
});
