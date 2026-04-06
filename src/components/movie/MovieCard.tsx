import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { colors, typography, spacing, radius, shadow } from '../../theme';
import { Movie, STATUS_LABELS }                         from '../../types/movie';
import StarRating                                       from './StarRating';

const SCREEN_W = Dimensions.get('window').width;
const CARD_W   = (SCREEN_W - spacing.base * 2 - spacing.md) / 2;
const POSTER_H = CARD_W * 1.5;

interface Props {
  movie:      Movie;
  user1Name:  string;
  user2Name:  string;
  onPress:    () => void;
  variant?:   'grid' | 'list';
}

export default function MovieCard({ movie, user1Name, user2Name, onPress, variant = 'grid' }: Props) {
  if (variant === 'list') return <ListCard movie={movie} user1Name={user1Name} user2Name={user2Name} onPress={onPress} />;

  const statusColor = STATUS_COLOR[movie.status];

  return (
    <TouchableOpacity onPress={onPress} style={styles.gridCard} activeOpacity={0.85}>
      {movie.posterUrl
        ? <Image source={{ uri: movie.posterUrl }} style={styles.poster} resizeMode="cover" />
        : <View style={[styles.poster, styles.posterPlaceholder]}>
            <Text style={styles.placeholderText}>{movie.title.slice(0, 2)}</Text>
          </View>}

      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{STATUS_LABELS[movie.status]}</Text>
      </View>

      <View style={styles.gridInfo}>
        <Text style={styles.gridTitle} numberOfLines={2}>{movie.title}</Text>
        {movie.status !== 'want_to_watch' && (
          <View style={styles.ratingsRow}>
            <Text style={styles.ratingSmall}>
              {user1Name.slice(0, 1)} {movie.ratingUser1 !== null ? `★${movie.ratingUser1}` : '-'}
            </Text>
            <Text style={styles.ratingSmall}>
              {user2Name.slice(0, 1)} {movie.ratingUser2 !== null ? `★${movie.ratingUser2}` : '-'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function ListCard({ movie, user1Name, user2Name, onPress }: Omit<Props, 'variant'>) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.listCard} activeOpacity={0.85}>
      {movie.posterUrl
        ? <Image source={{ uri: movie.posterUrl }} style={styles.listPoster} resizeMode="cover" />
        : <View style={[styles.listPoster, styles.posterPlaceholder]}>
            <Text style={styles.placeholderText}>{movie.title.slice(0, 2)}</Text>
          </View>}

      <View style={styles.listInfo}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle} numberOfLines={1}>{movie.title}</Text>
          <View style={[styles.statusBadgeSmall, { backgroundColor: STATUS_COLOR[movie.status] }]}>
            <Text style={styles.statusTextSmall}>{STATUS_LABELS[movie.status]}</Text>
          </View>
        </View>

        {movie.platform ? <Text style={styles.listMeta}>{movie.platform}{movie.watchedAt ? ` · ${formatDate(movie.watchedAt)}` : ''}</Text> : null}
        {movie.genres.length > 0 && <Text style={styles.listMeta}>{movie.genres.slice(0, 3).join(' · ')}</Text>}

        {movie.status !== 'want_to_watch' && (
          <View style={styles.listRatings}>
            <View style={styles.listRatingItem}>
              <Text style={styles.listRaterName}>{user1Name}</Text>
              <StarRating value={movie.ratingUser1} readonly size={14} />
            </View>
            <View style={styles.listRatingItem}>
              <Text style={styles.listRaterName}>{user2Name}</Text>
              <StarRating value={movie.ratingUser2} readonly size={14} />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

const STATUS_COLOR: Record<string, string> = {
  want_to_watch: colors.primary,
  watched:       colors.success,
  rewatch:       colors.warning,
};

const styles = StyleSheet.create({
  // Grid
  gridCard: {
    width:         CARD_W,
    backgroundColor: colors.surface,
    borderRadius:  radius.lg,
    overflow:      'hidden',
    ...shadow.sm,
  },
  poster: {
    width:  CARD_W,
    height: POSTER_H,
  },
  posterPlaceholder: {
    backgroundColor: colors.surfaceSecond,
    justifyContent:  'center',
    alignItems:      'center',
  },
  placeholderText: {
    ...typography.title1,
    color: colors.textTertiary,
  },
  statusBadge: {
    position:     'absolute',
    top:          spacing.sm,
    left:         spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize:   10,
    fontWeight: '600',
    color:      '#fff',
  },
  gridInfo: {
    padding: spacing.sm,
  },
  gridTitle: {
    ...typography.label1,
    marginBottom: spacing.xs,
  },
  ratingsRow: {
    flexDirection: 'row',
    gap:           spacing.sm,
  },
  ratingSmall: {
    ...typography.caption,
    color: colors.warning,
  },

  // List
  listCard: {
    flexDirection:    'row',
    backgroundColor:  colors.surface,
    borderRadius:     radius.lg,
    overflow:         'hidden',
    marginBottom:     spacing.md,
    ...shadow.sm,
  },
  listPoster: {
    width:  80,
    height: 120,
  },
  listInfo: {
    flex:    1,
    padding: spacing.md,
  },
  listHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   spacing.xs,
  },
  listTitle: {
    ...typography.title3,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadgeSmall: {
    paddingHorizontal: spacing.sm,
    paddingVertical:   2,
    borderRadius:      radius.full,
  },
  statusTextSmall: {
    fontSize:   10,
    fontWeight: '600',
    color:      '#fff',
  },
  listMeta: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  listRatings: {
    marginTop: spacing.xs,
    gap:       spacing.xs,
  },
  listRatingItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.sm,
  },
  listRaterName: {
    ...typography.caption,
    width: 50,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
