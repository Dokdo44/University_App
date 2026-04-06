import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../../theme';
import { Movie, MovieStatus, PLATFORM_OPTIONS, GENRE_OPTIONS } from '../../types/movie';
import { subscribeToMovies, filterMovies }                      from '../../services/movieService';
import MovieCard                                                from '../../components/movie/MovieCard';
import FilterBar                                                from '../../components/movie/FilterBar';

const NUM_COLS = 2;

interface Props {
  navigation:    any;
  coupleSpaceId: string;
  user1Name:     string;
  user2Name:     string;
}

type ViewMode = 'grid' | 'list';

export default function MovieListScreen({ navigation, coupleSpaceId, user1Name, user2Name }: Props) {
  const [movies,         setMovies]         = useState<Movie[]>([]);
  const [search,         setSearch]         = useState('');
  const [viewMode,       setViewMode]       = useState<ViewMode>('grid');
  const [statusFilter,   setStatusFilter]   = useState<MovieStatus | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [genreFilter,    setGenreFilter]    = useState('all');

  useEffect(() => {
    return subscribeToMovies(coupleSpaceId, setMovies);
  }, [coupleSpaceId]);

  const usedPlatforms = useMemo(() => {
    const set = new Set(movies.map(m => m.platform).filter(Boolean));
    return PLATFORM_OPTIONS.filter(p => set.has(p));
  }, [movies]);

  const usedGenres = useMemo(() => {
    const set = new Set(movies.flatMap(m => m.genres));
    return GENRE_OPTIONS.filter(g => set.has(g));
  }, [movies]);

  const filtered = useMemo(() => {
    let list = filterMovies(movies, { status: statusFilter, platform: platformFilter, genre: genreFilter });
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(q));
    }
    return list;
  }, [movies, statusFilter, platformFilter, genreFilter, search]);

  function goDetail(movieId: string) {
    navigation.navigate('MovieDetail', { movieId });
  }

  const isEmpty = filtered.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>영화 목록</Text>
        <View style={styles.topRight}>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'grid' && styles.viewToggleActive]}
            onPress={() => setViewMode('grid')}
          >
            <Text style={[styles.viewToggleText, viewMode === 'grid' && styles.viewToggleTextActive]}>⊞</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'list' && styles.viewToggleActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>≡</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddMovie', {})}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="영화 제목 검색"
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <FilterBar
        statusFilter={statusFilter}
        platformFilter={platformFilter}
        genreFilter={genreFilter}
        platforms={usedPlatforms}
        genres={usedGenres}
        onStatusChange={setStatusFilter}
        onPlatformChange={setPlatformFilter}
        onGenreChange={setGenreFilter}
      />

      {/* Count */}
      <View style={styles.countBar}>
        <Text style={styles.count}>{filtered.length}편</Text>
      </View>

      {/* List */}
      {isEmpty
        ? <EmptyState search={search} onAdd={() => navigation.navigate('AddMovie', {})} />
        : viewMode === 'grid'
          ? (
            <FlatList
              key="grid"
              data={filtered}
              numColumns={NUM_COLS}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.gridContainer}
              columnWrapperStyle={styles.gridRow}
              renderItem={({ item }) => (
                <MovieCard
                  movie={item}
                  user1Name={user1Name}
                  user2Name={user2Name}
                  onPress={() => goDetail(item.id)}
                  variant="grid"
                />
              )}
            />
          )
          : (
            <FlatList
              key="list"
              data={filtered}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <MovieCard
                  movie={item}
                  user1Name={user1Name}
                  user2Name={user2Name}
                  onPress={() => goDetail(item.id)}
                  variant="list"
                />
              )}
            />
          )}
    </SafeAreaView>
  );
}

function EmptyState({ search, onAdd }: { search: string; onAdd: () => void }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>{search ? '🔍' : '🎬'}</Text>
      <Text style={styles.emptyTitle}>
        {search ? `"${search}" 검색 결과 없음` : '아직 영화가 없어요'}
      </Text>
      {!search && (
        <TouchableOpacity style={styles.emptyBtn} onPress={onAdd}>
          <Text style={styles.emptyBtnText}>첫 영화 추가하기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  topBar: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical:   spacing.md,
    backgroundColor:   colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  screenTitle: { ...typography.title2 },
  topRight:    { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },

  viewToggle: {
    width:          32,
    height:         32,
    borderRadius:   radius.sm,
    justifyContent: 'center',
    alignItems:     'center',
    backgroundColor: colors.surfaceSecond,
  },
  viewToggleActive:    { backgroundColor: colors.primaryLight },
  viewToggleText:      { fontSize: 16, color: colors.textSecondary },
  viewToggleTextActive:{ color: colors.primary },

  addBtn: {
    width:           36,
    height:          36,
    borderRadius:    radius.full,
    backgroundColor: colors.primary,
    justifyContent:  'center',
    alignItems:      'center',
  },
  addBtnText: { ...typography.title2, color: '#fff', lineHeight: 36 },

  searchBar: {
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.base,
    marginVertical:   spacing.sm,
    borderRadius:   radius.lg,
    borderWidth:    1,
    borderColor:    colors.border,
    paddingHorizontal: spacing.md,
    height:         44,
  },
  searchIcon:  { fontSize: 15, marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body2, color: colors.textPrimary },
  clearIcon:   { ...typography.body2, color: colors.textTertiary, paddingLeft: spacing.sm },

  countBar:     { paddingHorizontal: spacing.base, paddingVertical: spacing.xs },
  count:        { ...typography.caption, color: colors.textSecondary },

  gridContainer: { padding: spacing.base, paddingTop: spacing.sm },
  gridRow:       { justifyContent: 'space-between', marginBottom: spacing.md },

  listContainer: { padding: spacing.base, paddingTop: spacing.sm },

  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji:  { fontSize: 52, marginBottom: spacing.base },
  emptyTitle:  { ...typography.title3, color: colors.textSecondary, textAlign: 'center' },
  emptyBtn:    { marginTop: spacing.base, backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.full },
  emptyBtnText:{ ...typography.label1, color: '#fff' },
});
