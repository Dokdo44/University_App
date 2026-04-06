import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, shadow } from '../../theme';
import { Movie }                                        from '../../types/movie';
import { subscribeToMovies }                            from '../../services/movieService';

interface Props {
  navigation:    any;
  coupleSpaceId: string;
  user1Name:     string;
  user2Name:     string;
}

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarScreen({ navigation, coupleSpaceId, user1Name, user2Name }: Props) {
  const [movies,    setMovies]    = useState<Movie[]>([]);
  const [curYear,   setCurYear]   = useState(() => new Date().getFullYear());
  const [curMonth,  setCurMonth]  = useState(() => new Date().getMonth()); // 0-based
  const [activeDay, setActiveDay] = useState<number | null>(null);

  useEffect(() => {
    return subscribeToMovies(coupleSpaceId, setMovies);
  }, [coupleSpaceId]);

  // Build a map: "YYYY-MM-DD" -> Movie[]
  const moviesByDate = useMemo(() => {
    const map: Record<string, Movie[]> = {};
    movies.forEach(m => {
      if (!m.watchedAt) return;
      const key = dateKey(m.watchedAt);
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    return map;
  }, [movies]);

  // Movies for the active day
  const dayMovies: Movie[] = useMemo(() => {
    if (activeDay === null) return [];
    const key = `${curYear}-${pad(curMonth + 1)}-${pad(activeDay)}`;
    return moviesByDate[key] ?? [];
  }, [activeDay, curYear, curMonth, moviesByDate]);

  // Calendar grid
  const { weeks, daysWithMovies } = useMemo(() => buildCalendar(curYear, curMonth, moviesByDate), [curYear, curMonth, moviesByDate]);

  function prevMonth() {
    if (curMonth === 0) { setCurYear(y => y - 1); setCurMonth(11); }
    else setCurMonth(m => m - 1);
    setActiveDay(null);
  }

  function nextMonth() {
    if (curMonth === 11) { setCurYear(y => y + 1); setCurMonth(0); }
    else setCurMonth(m => m + 1);
    setActiveDay(null);
  }

  const monthLabel = `${curYear}년 ${curMonth + 1}월`;
  const watchedThisMonth = Object.entries(moviesByDate)
    .filter(([k]) => k.startsWith(`${curYear}-${pad(curMonth + 1)}`))
    .flatMap(([, ms]) => ms);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
        {/* Calendar header */}
        <View style={styles.calHeader}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} hitSlop={12} style={styles.navArrow}>
              <Text style={styles.navArrowText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <TouchableOpacity onPress={nextMonth} hitSlop={12} style={styles.navArrow}>
              <Text style={styles.navArrowText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Day labels */}
          <View style={styles.dayLabels}>
            {WEEK_DAYS.map((d, i) => (
              <Text key={d} style={[styles.dayLabel, i === 0 && styles.sun, i === 6 && styles.sat]}>{d}</Text>
            ))}
          </View>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.week}>
              {week.map((day, di) => {
                if (day === 0) return <View key={di} style={styles.dayCell} />;
                const key   = `${curYear}-${pad(curMonth + 1)}-${pad(day)}`;
                const hasM  = !!moviesByDate[key];
                const isAct = activeDay === day;
                const isSun = di === 0;
                const isSat = di === 6;
                return (
                  <TouchableOpacity
                    key={di}
                    style={[styles.dayCell, isAct && styles.dayCellActive]}
                    onPress={() => setActiveDay(isAct ? null : day)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dayNum,
                      isSun && styles.sun,
                      isSat && styles.sat,
                      isAct && styles.dayNumActive,
                    ]}>
                      {day}
                    </Text>
                    {hasM && <View style={[styles.dot, isAct && styles.dotActive]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* Month summary */}
          <View style={styles.monthSummary}>
            <Text style={styles.monthSummaryText}>
              이 달에 {watchedThisMonth.length}편 함께 봤어요 🎬
            </Text>
          </View>
        </View>

        {/* Day movies */}
        {activeDay !== null && dayMovies.length > 0 && (
          <View style={styles.daySection}>
            <Text style={styles.daySectionTitle}>
              {curMonth + 1}월 {activeDay}일에 본 영화
            </Text>
            {dayMovies.map(m => (
              <TouchableOpacity
                key={m.id}
                style={styles.movieRow}
                onPress={() => navigation.navigate('MovieDetail', { movieId: m.id })}
                activeOpacity={0.85}
              >
                {m.posterUrl
                  ? <Image source={{ uri: m.posterUrl }} style={styles.rowPoster} resizeMode="cover" />
                  : <View style={[styles.rowPoster, styles.posterPlaceholder]}>
                      <Text style={styles.placeholderText}>{m.title.slice(0, 2)}</Text>
                    </View>}
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>{m.title}</Text>
                  {m.platform && <Text style={styles.rowMeta}>{m.platform}</Text>}
                  <View style={styles.rowRatings}>
                    {m.ratingUser1 !== null && (
                      <Text style={styles.rowRating}>
                        {user1Name.slice(0, 1)} ★{m.ratingUser1}
                      </Text>
                    )}
                    {m.ratingUser2 !== null && (
                      <Text style={styles.rowRating}>
                        {user2Name.slice(0, 1)} ★{m.ratingUser2}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Timeline – all watched movies sorted by date */}
        <View style={styles.timeline}>
          <Text style={styles.timelineTitle}>전체 기록</Text>
          {groupByMonth(movies.filter(m => m.watchedAt)).map(([label, ms]) => (
            <View key={label}>
              <Text style={styles.timelineMonth}>{label}</Text>
              {ms.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.tlItem}
                  onPress={() => navigation.navigate('MovieDetail', { movieId: m.id })}
                  activeOpacity={0.85}
                >
                  <View style={styles.tlDot} />
                  <View style={styles.tlInfo}>
                    <Text style={styles.tlTitle}>{m.title}</Text>
                    <Text style={styles.tlDate}>
                      {m.watchedAt ? `${m.watchedAt.getDate()}일` : ''}
                      {m.platform ? ` · ${m.platform}` : ''}
                    </Text>
                  </View>
                  <View style={styles.tlRatings}>
                    {m.ratingUser1 !== null && <Text style={styles.tlRating}>★{m.ratingUser1}</Text>}
                    {m.ratingUser2 !== null && <Text style={styles.tlRating}>★{m.ratingUser2}</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          {movies.filter(m => m.watchedAt).length === 0 && (
            <Text style={styles.noTimeline}>함께 본 영화가 없어요</Text>
          )}
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── helpers ────────────────────────────────────────────────────────────
function pad(n: number): string { return String(n).padStart(2, '0'); }

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildCalendar(year: number, month: number, moviesByDate: Record<string, Movie[]>) {
  const firstDay  = new Date(year, month, 1).getDay();
  const lastDate  = new Date(year, month + 1, 0).getDate();
  const weeks: number[][] = [];
  const daysWithMovies = new Set<number>();

  let week: number[] = Array(firstDay).fill(0);
  for (let d = 1; d <= lastDate; d++) {
    week.push(d);
    const key = `${year}-${pad(month + 1)}-${pad(d)}`;
    if (moviesByDate[key]) daysWithMovies.add(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(0);
    weeks.push(week);
  }
  return { weeks, daysWithMovies };
}

function groupByMonth(movies: Movie[]): [string, Movie[]][] {
  const map = new Map<string, Movie[]>();
  const sorted = [...movies].sort((a, b) =>
    (b.watchedAt?.getTime() ?? 0) - (a.watchedAt?.getTime() ?? 0));
  sorted.forEach(m => {
    if (!m.watchedAt) return;
    const label = `${m.watchedAt.getFullYear()}년 ${m.watchedAt.getMonth() + 1}월`;
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(m);
  });
  return Array.from(map.entries());
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  calHeader: {
    backgroundColor: colors.surface,
    paddingBottom:   spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  monthNav: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical:  spacing.base,
    gap:              spacing.xl,
  },
  navArrow:     { padding: spacing.sm },
  navArrowText: { fontSize: 24, color: colors.primary },
  monthLabel:   { ...typography.title2 },

  dayLabels: {
    flexDirection:     'row',
    paddingHorizontal: spacing.sm,
    paddingBottom:     spacing.xs,
  },
  dayLabel: { flex: 1, textAlign: 'center', ...typography.caption, color: colors.textSecondary },
  sun:      { color: colors.error },
  sat:      { color: colors.primary },

  week:        { flexDirection: 'row', paddingHorizontal: spacing.sm },
  dayCell: {
    flex:           1,
    aspectRatio:    1,
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   radius.full,
  },
  dayCellActive: { backgroundColor: colors.primary },
  dayNum:        { ...typography.body2, fontWeight: '500' },
  dayNumActive:  { color: '#fff', fontWeight: '700' },
  dot:           { width: 5, height: 5, borderRadius: radius.full, backgroundColor: colors.primary, marginTop: 2 },
  dotActive:     { backgroundColor: '#fff' },

  monthSummary:     { alignItems: 'center', paddingVertical: spacing.sm },
  monthSummaryText: { ...typography.caption, color: colors.textSecondary },

  daySection:      { padding: spacing.base },
  daySectionTitle: { ...typography.title3, marginBottom: spacing.md },

  movieRow: {
    flexDirection:   'row',
    backgroundColor: colors.surface,
    borderRadius:    radius.lg,
    overflow:        'hidden',
    marginBottom:    spacing.md,
    ...shadow.sm,
  },
  rowPoster: { width: 70, height: 105 },
  posterPlaceholder: { backgroundColor: colors.surfaceSecond, justifyContent: 'center', alignItems: 'center' },
  placeholderText:   { ...typography.title3, color: colors.textTertiary },
  rowInfo:    { flex: 1, padding: spacing.md },
  rowTitle:   { ...typography.label1, marginBottom: spacing.xs },
  rowMeta:    { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  rowRatings: { flexDirection: 'row', gap: spacing.sm },
  rowRating:  { ...typography.caption, color: colors.warning, fontWeight: '600' },

  timeline:      { padding: spacing.base, marginTop: spacing.sm },
  timelineTitle: { ...typography.title3, marginBottom: spacing.base },
  timelineMonth: { ...typography.label1, color: colors.textSecondary, marginTop: spacing.base, marginBottom: spacing.sm },

  tlItem: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap:            spacing.md,
  },
  tlDot: {
    width:        8,
    height:       8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  tlInfo:   { flex: 1 },
  tlTitle:  { ...typography.label1 },
  tlDate:   { ...typography.caption, color: colors.textSecondary },
  tlRatings:{ gap: spacing.xs },
  tlRating: { ...typography.caption, color: colors.warning, fontWeight: '600' },

  noTimeline: { ...typography.body2, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xl },
});
