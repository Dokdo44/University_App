import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, shadow } from '../../theme';
import { CoupleSpace, Movie }                           from '../../types/movie';
import { subscribeToMovies }                            from '../../services/movieService';
import { authService }                                  from '../../services/firebase';

interface Props {
  coupleSpace: CoupleSpace;
  isUser1:     boolean;
  myName:      string;
  partnerName: string;
}

export default function MovieMoreScreen({ coupleSpace, isUser1, myName, partnerName }: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    return subscribeToMovies(coupleSpace.id, setMovies);
  }, [coupleSpace.id]);

  const watched   = movies.filter(m => m.status !== 'want_to_watch');
  const avgRating = (ratings: (number | null)[]) => {
    const v = ratings.filter((r): r is number => r !== null);
    return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : '-';
  };

  const myRatings      = watched.map(m => isUser1 ? m.ratingUser1 : m.ratingUser2);
  const partnerRatings = watched.map(m => isUser1 ? m.ratingUser2 : m.ratingUser1);

  const platformCounts = movies.reduce<Record<string, number>>((acc, m) => {
    if (m.platform) acc[m.platform] = (acc[m.platform] ?? 0) + 1;
    return acc;
  }, {});
  const topPlatforms = Object.entries(platformCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const genreCounts = movies.reduce<Record<string, number>>((acc, m) => {
    m.genres.forEach(g => { acc[g] = (acc[g] ?? 0) + 1; });
    return acc;
  }, {});
  const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  function handleLogout() {
    Alert.alert('로그아웃', '정말 로그아웃 할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => authService.logout() },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>더보기</Text>
        </View>

        {/* Couple card */}
        <View style={styles.coupleCard}>
          <View style={styles.avatarRow}>
            <Avatar name={myName}      />
            <Text style={styles.heartIcon}>♥</Text>
            <Avatar name={partnerName} />
          </View>
          <Text style={styles.coupleName}>{myName} &amp; {partnerName}</Text>
          <View style={styles.inviteRow}>
            <Text style={styles.inviteLabel}>초대 코드</Text>
            <Text style={styles.inviteCode}>{coupleSpace.inviteCode}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>통계</Text>
          <View style={styles.statsGrid}>
            <StatItem emoji="🎬" label="총 영화" value={`${movies.length}편`} />
            <StatItem emoji="✅" label="함께 봄" value={`${watched.length}편`} />
            <StatItem emoji="⭐" label={`${myName} 평균`}      value={avgRating(myRatings)} />
            <StatItem emoji="⭐" label={`${partnerName} 평균`} value={avgRating(partnerRatings)} />
          </View>
        </View>

        {/* Top platforms */}
        {topPlatforms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>자주 본 플랫폼</Text>
            <View style={styles.card}>
              {topPlatforms.map(([p, cnt], i) => (
                <View key={p} style={[styles.rankRow, i > 0 && styles.rankRowBorder]}>
                  <Text style={styles.rankNum}>{i + 1}</Text>
                  <Text style={styles.rankLabel}>{p}</Text>
                  <Text style={styles.rankCount}>{cnt}편</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top genres */}
        {topGenres.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>좋아하는 장르</Text>
            <View style={styles.genreChips}>
              {topGenres.map(([g, cnt]) => (
                <View key={g} style={styles.genreChip}>
                  <Text style={styles.genreChipText}>{g}</Text>
                  <Text style={styles.genreChipCount}>{cnt}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={[styles.menuLabel, styles.menuLabelDanger]}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🎬 둘만의 영화 기록장</Text>
          <Text style={styles.version}>v1.0.0</Text>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{name.slice(0, 1)}</Text>
    </View>
  );
}

function StatItem({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingHorizontal: spacing.base,
    paddingVertical:   spacing.md,
    backgroundColor:   colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...typography.title2 },

  coupleCard: {
    backgroundColor: colors.surface,
    margin:          spacing.base,
    borderRadius:    radius.xl,
    padding:         spacing.xl,
    alignItems:      'center',
    ...shadow.sm,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.md },
  avatar: {
    width:           56,
    height:          56,
    borderRadius:    radius.full,
    backgroundColor: colors.primaryLight,
    justifyContent:  'center',
    alignItems:      'center',
  },
  avatarText:  { ...typography.title1, color: colors.primary },
  heartIcon:   { fontSize: 24, color: colors.error },
  coupleName:  { ...typography.title3, marginBottom: spacing.md },
  inviteRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceSecond, paddingHorizontal: spacing.base, paddingVertical: spacing.sm, borderRadius: radius.md },
  inviteLabel: { ...typography.caption, color: colors.textSecondary },
  inviteCode:  { ...typography.label1, color: colors.primary, letterSpacing: 3 },

  section:      { paddingHorizontal: spacing.base, marginBottom: spacing.base },
  sectionTitle: { ...typography.title3, marginBottom: spacing.md },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statItem: {
    flex:            1,
    minWidth:        '45%',
    backgroundColor: colors.surface,
    borderRadius:    radius.lg,
    padding:         spacing.md,
    alignItems:      'center',
    ...shadow.sm,
  },
  statEmoji: { fontSize: 24, marginBottom: spacing.xs },
  statValue: { ...typography.title2, color: colors.primary, marginBottom: 2 },
  statLabel: { ...typography.caption2, color: colors.textSecondary, textAlign: 'center' },

  card:          { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.sm },
  rankRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.md, gap: spacing.md },
  rankRowBorder: { borderTopWidth: 1, borderTopColor: colors.borderLight },
  rankNum:       { ...typography.label1, color: colors.primary, width: 20 },
  rankLabel:     { ...typography.body2, flex: 1 },
  rankCount:     { ...typography.caption, color: colors.textSecondary },

  genreChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  genreChip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm,
    backgroundColor:   colors.primaryLight,
    borderRadius:      radius.full,
  },
  genreChipText:  { ...typography.label2, color: colors.primary },
  genreChipCount: { ...typography.caption, color: colors.primary },

  menuItem: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surface,
    borderRadius:    radius.lg,
    padding:         spacing.base,
    gap:             spacing.md,
    ...shadow.sm,
  },
  menuIcon:        { fontSize: 18 },
  menuLabel:       { ...typography.body1 },
  menuLabelDanger: { color: colors.error },

  footer: { alignItems: 'center', marginTop: spacing.sm, gap: spacing.xs },
  footerText: { ...typography.caption, color: colors.textSecondary },
  version:    { ...typography.caption2 },
});
