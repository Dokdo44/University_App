import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, shadow } from '../../theme';
import { Movie, STATUS_LABELS }                         from '../../types/movie';
import { subscribeToMovies }                            from '../../services/movieService';
import StarRating                                       from '../../components/movie/StarRating';

interface Props {
  navigation:    any;
  coupleSpaceId: string;
  user1Name:     string;
  user2Name:     string;
}

export default function HomeScreen({ navigation, coupleSpaceId, user1Name, user2Name }: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    return subscribeToMovies(coupleSpaceId, setMovies);
  }, [coupleSpaceId]);

  const watched    = movies.filter(m => m.status === 'watched' || m.status === 'rewatch');
  const wantList   = movies.filter(m => m.status === 'want_to_watch');
  const recent     = watched.slice(0, 5);

  const thisMonth  = watched.filter(m => {
    if (!m.watchedAt) return false;
    const now = new Date();
    return m.watchedAt.getFullYear() === now.getFullYear() && m.watchedAt.getMonth() === now.getMonth();
  });

  const avgUser1 = avg(watched.map(m => m.ratingUser1));
  const avgUser2 = avg(watched.map(m => m.ratingUser2));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>{user1Name} &amp; {user2Name}</Text>
            <Text style={styles.headerTitle}>우리 영화 기록장 🎬</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddMovie', {})}
          >
            <Text style={styles.addBtnText}>+ 추가</Text>
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard label="함께 본 영화" value={`${watched.length}편`} emoji="🎞" />
          <StatCard label="이번 달"      value={`${thisMonth.length}편`} emoji="📅" />
          <StatCard label="보고 싶어요"  value={`${wantList.length}편`} emoji="⭐" />
        </View>

        {/* Rating comparison */}
        {watched.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>평균 평점</Text>
            <View style={[styles.card, styles.ratingCard]}>
              <View style={styles.ratingRow}>
                <Text style={styles.raterName}>{user1Name}</Text>
                <StarRating value={avgUser1 !== null ? Math.round(avgUser1) : null} readonly size={18} />
                <Text style={styles.ratingNum}>{avgUser1 !== null ? avgUser1.toFixed(1) : '-'}</Text>
              </View>
              <View style={styles.ratingDivider} />
              <View style={styles.ratingRow}>
                <Text style={styles.raterName}>{user2Name}</Text>
                <StarRating value={avgUser2 !== null ? Math.round(avgUser2) : null} readonly size={18} />
                <Text style={styles.ratingNum}>{avgUser2 !== null ? avgUser2.toFixed(1) : '-'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recently watched */}
        {recent.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근에 본 영화</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Movies')}>
                <Text style={styles.sectionMore}>전체 보기</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {recent.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.recentCard}
                  onPress={() => navigation.navigate('MovieDetail', { movieId: m.id })}
                  activeOpacity={0.85}
                >
                  {m.posterUrl
                    ? <Image source={{ uri: m.posterUrl }} style={styles.recentPoster} resizeMode="cover" />
                    : <View style={[styles.recentPoster, styles.posterPlaceholder]}>
                        <Text style={styles.placeholderText}>{m.title.slice(0, 2)}</Text>
                      </View>}
                  <Text style={styles.recentTitle} numberOfLines={2}>{m.title}</Text>
                  {m.watchedAt && <Text style={styles.recentDate}>{formatDate(m.watchedAt)}</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Want to watch */}
        {wantList.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>보고 싶은 영화 {wantList.length}편</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Movies')}>
                <Text style={styles.sectionMore}>전체 보기</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {wantList.slice(0, 6).map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.recentCard}
                  onPress={() => navigation.navigate('MovieDetail', { movieId: m.id })}
                  activeOpacity={0.85}
                >
                  {m.posterUrl
                    ? <Image source={{ uri: m.posterUrl }} style={styles.recentPoster} resizeMode="cover" />
                    : <View style={[styles.recentPoster, styles.posterPlaceholder]}>
                        <Text style={styles.placeholderText}>{m.title.slice(0, 2)}</Text>
                      </View>}
                  <Text style={styles.recentTitle} numberOfLines={2}>{m.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Empty state */}
        {movies.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎬</Text>
            <Text style={styles.emptyTitle}>첫 영화를 기록해보세요</Text>
            <Text style={styles.emptyDesc}>함께 본 영화, 보고 싶은 영화를{'\n'}여기에 기록할 수 있어요</Text>
            <TouchableOpacity
              style={[styles.btn, { marginTop: spacing.lg }]}
              onPress={() => navigation.navigate('AddMovie', {})}
            >
              <Text style={styles.btnText}>영화 추가하기</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function avg(nums: (number | null)[]): number | null {
  const valid = nums.filter((n): n is number => n !== null);
  if (!valid.length) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function formatDate(d: Date): string {
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingHorizontal: spacing.base,
    paddingTop:     spacing.base,
    paddingBottom:  spacing.sm,
  },
  headerSub:   { ...typography.caption, color: colors.textSecondary },
  headerTitle: { ...typography.title1 },

  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.base,
    paddingVertical:   spacing.sm,
    borderRadius:    radius.full,
  },
  addBtnText: { ...typography.label2, color: '#fff' },

  statsRow: {
    flexDirection:  'row',
    paddingHorizontal: spacing.base,
    gap:            spacing.sm,
    marginTop:      spacing.sm,
  },
  statCard: {
    flex:           1,
    backgroundColor: colors.surface,
    borderRadius:   radius.lg,
    padding:        spacing.md,
    alignItems:     'center',
    ...shadow.sm,
  },
  statEmoji: { fontSize: 22, marginBottom: spacing.xs },
  statValue: { ...typography.title2, color: colors.primary },
  statLabel: { ...typography.caption2, color: colors.textSecondary, textAlign: 'center' },

  section:       { marginTop: spacing.xl, paddingHorizontal: spacing.base },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle:  { ...typography.title3 },
  sectionMore:   { ...typography.caption, color: colors.primary },

  card: { backgroundColor: colors.surface, borderRadius: radius.lg, ...shadow.sm },
  ratingCard:   { padding: spacing.base },
  ratingRow:    { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  raterName:    { ...typography.label1, width: 60 },
  ratingNum:    { ...typography.label2, color: colors.warning, marginLeft: 'auto' },
  ratingDivider:{ height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.sm },

  hScroll: { paddingRight: spacing.base, gap: spacing.md },
  recentCard: { width: 110 },
  recentPoster: {
    width:        110,
    height:       165,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  posterPlaceholder: {
    backgroundColor: colors.surfaceSecond,
    justifyContent:  'center',
    alignItems:      'center',
  },
  placeholderText: { ...typography.title2, color: colors.textTertiary },
  recentTitle:     { ...typography.caption, fontWeight: '600', color: colors.textPrimary },
  recentDate:      { ...typography.caption2 },

  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji:  { fontSize: 60, marginBottom: spacing.base },
  emptyTitle:  { ...typography.title2, marginBottom: spacing.sm },
  emptyDesc:   { ...typography.body2, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  btn: {
    backgroundColor: colors.primary,
    height:          48,
    paddingHorizontal: spacing.xl,
    borderRadius:    radius.full,
    justifyContent:  'center',
    alignItems:      'center',
  },
  btnText: { ...typography.label1, color: '#fff' },
});
