import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, shadow } from '../../theme';
import { Movie, STATUS_LABELS }                         from '../../types/movie';
import { subscribeToMovies, deleteMovie }               from '../../services/movieService';
import StarRating                                       from '../../components/movie/StarRating';

interface Props {
  navigation:    any;
  route:         any;
  coupleSpaceId: string;
  user1Name:     string;
  user2Name:     string;
}

export default function MovieDetailScreen({ navigation, route, coupleSpaceId, user1Name, user2Name }: Props) {
  const { movieId } = route.params;
  const [movie,   setMovie]   = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time subscription scoped to this movie
  useEffect(() => {
    return subscribeToMovies(coupleSpaceId, movies => {
      const found = movies.find(m => m.id === movieId) ?? null;
      setMovie(found);
      setLoading(false);
    });
  }, [coupleSpaceId, movieId]);

  async function handleDelete() {
    Alert.alert('삭제', '이 영화 기록을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive',
        onPress: async () => {
          await deleteMovie(movieId);
          navigation.goBack();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!movie) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.notFound}>영화를 찾을 수 없습니다.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = STATUS_COLOR[movie.status];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.navActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddMovie', { movie })}
            style={styles.navBtn}
          >
            <Text style={styles.navBtnText}>편집</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={[styles.navBtn, styles.deleteBtn]}>
            <Text style={styles.deleteBtnText}>삭제</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Poster + title */}
        <View style={styles.hero}>
          {movie.posterUrl
            ? <Image source={{ uri: movie.posterUrl }} style={styles.poster} resizeMode="cover" />
            : <View style={[styles.poster, styles.posterPlaceholder]}>
                <Text style={styles.placeholderText}>{movie.title.slice(0, 2)}</Text>
              </View>}

          <View style={styles.heroInfo}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{STATUS_LABELS[movie.status]}</Text>
            </View>
            <Text style={styles.title}>{movie.title}</Text>
            {movie.year      && <Text style={styles.meta}>{movie.year}</Text>}
            {movie.director  && <Text style={styles.meta}>감독 {movie.director}</Text>}
            {movie.genres.length > 0 && <Text style={styles.meta}>{movie.genres.join(' · ')}</Text>}
            {movie.platform  && <Text style={styles.meta}>{movie.platform}</Text>}
            {movie.watchedAt && <Text style={styles.meta}>📅 {formatDate(movie.watchedAt)} 함께 봄</Text>}
          </View>
        </View>

        {/* Ratings section */}
        {movie.status !== 'want_to_watch' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>우리의 평점</Text>
            <View style={styles.ratingsCard}>
              <RatingBlock
                name={user1Name}
                rating={movie.ratingUser1}
                comment={movie.commentUser1}
              />
              <View style={styles.divider} />
              <RatingBlock
                name={user2Name}
                rating={movie.ratingUser2}
                comment={movie.commentUser2}
              />
            </View>
          </View>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function RatingBlock({ name, rating, comment }: { name: string; rating: number | null; comment: string }) {
  return (
    <View style={styles.ratingBlock}>
      <View style={styles.ratingHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.slice(0, 1)}</Text>
        </View>
        <Text style={styles.raterName}>{name}</Text>
      </View>
      <View style={styles.starRow}>
        <StarRating value={rating} readonly size={22} />
      </View>
      {comment ? (
        <View style={styles.commentBox}>
          <Text style={styles.commentText}>"{comment}"</Text>
        </View>
      ) : (
        <Text style={styles.noComment}>한줄평 없음</Text>
      )}
    </View>
  );
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

const STATUS_COLOR: Record<string, string> = {
  want_to_watch: colors.primary,
  watched:       colors.success,
  rewatch:       colors.warning,
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },

  navBar: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical:   spacing.sm,
    backgroundColor:   colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backIcon:    { fontSize: 28, color: colors.primary, lineHeight: 36 },
  navActions:  { flexDirection: 'row', gap: spacing.sm },
  navBtn:      { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.surfaceSecond },
  navBtnText:  { ...typography.label2, color: colors.textPrimary },
  deleteBtn:   { backgroundColor: colors.errorLight },
  deleteBtnText:{ ...typography.label2, color: colors.error },

  hero: {
    flexDirection:    'row',
    padding:          spacing.base,
    backgroundColor:  colors.surface,
    gap:              spacing.base,
  },
  poster: {
    width:        120,
    height:       180,
    borderRadius: radius.md,
  },
  posterPlaceholder: {
    backgroundColor: colors.surfaceSecond,
    justifyContent:  'center',
    alignItems:      'center',
  },
  placeholderText: { ...typography.display2, color: colors.textTertiary },
  heroInfo:        { flex: 1, paddingTop: spacing.xs },
  statusBadge: {
    alignSelf:         'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
    borderRadius:      radius.full,
    marginBottom:      spacing.sm,
  },
  statusText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  title:      { ...typography.title1, marginBottom: spacing.sm, lineHeight: 28 },
  meta:       { ...typography.body2, color: colors.textSecondary, marginBottom: spacing.xs },

  section:      { paddingHorizontal: spacing.base, marginTop: spacing.lg },
  sectionTitle: { ...typography.title3, marginBottom: spacing.md },

  ratingsCard: {
    backgroundColor: colors.surface,
    borderRadius:    radius.lg,
    overflow:        'hidden',
    ...shadow.sm,
  },
  ratingBlock:  { padding: spacing.base },
  ratingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  avatar: {
    width:           36,
    height:          36,
    borderRadius:    radius.full,
    backgroundColor: colors.primaryLight,
    justifyContent:  'center',
    alignItems:      'center',
  },
  avatarText:  { ...typography.label1, color: colors.primary },
  raterName:   { ...typography.title3 },
  starRow:     { marginBottom: spacing.md },
  commentBox: {
    backgroundColor: colors.surfaceSecond,
    borderRadius:    radius.md,
    padding:         spacing.md,
  },
  commentText: { ...typography.body2, color: colors.textPrimary, lineHeight: 22, fontStyle: 'italic' },
  noComment:   { ...typography.caption, color: colors.textTertiary },
  divider:     { height: 1, backgroundColor: colors.borderLight },

  notFound:    { ...typography.body1, color: colors.textSecondary, marginBottom: spacing.base },
  backBtn:     { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.full },
  backBtnText: { ...typography.label1, color: '#fff' },
});
