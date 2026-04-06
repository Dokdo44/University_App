import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';
import { MovieStatus, STATUS_LABELS }           from '../../types/movie';

type FilterValue = MovieStatus | 'all';

interface Chip {
  label: string;
  value: string;
}

interface Props {
  statusFilter:   FilterValue;
  platformFilter: string;
  genreFilter:    string;
  platforms:      string[];
  genres:         string[];
  onStatusChange:   (v: FilterValue) => void;
  onPlatformChange: (v: string)      => void;
  onGenreChange:    (v: string)      => void;
}

function ChipRow({ chips, selected, onSelect }: { chips: Chip[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {chips.map(c => {
        const active = c.value === selected;
        return (
          <TouchableOpacity
            key={c.value}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(c.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const STATUS_CHIPS: Chip[] = [
  { label: '전체',   value: 'all' },
  ...(['want_to_watch', 'watched', 'rewatch'] as MovieStatus[]).map(s => ({
    label: STATUS_LABELS[s],
    value: s,
  })),
];

export default function FilterBar({
  statusFilter, platformFilter, genreFilter,
  platforms, genres,
  onStatusChange, onPlatformChange, onGenreChange,
}: Props) {
  const platformChips: Chip[] = [{ label: '전체 플랫폼', value: 'all' }, ...platforms.map(p => ({ label: p, value: p }))];
  const genreChips:   Chip[] = [{ label: '전체 장르',   value: 'all' }, ...genres.map(g => ({ label: g, value: g }))];

  return (
    <View style={styles.container}>
      <ChipRow chips={STATUS_CHIPS}   selected={statusFilter}   onSelect={onStatusChange as any} />
      <ChipRow chips={platformChips}  selected={platformFilter} onSelect={onPlatformChange} />
      <ChipRow chips={genreChips}     selected={genreFilter}    onSelect={onGenreChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.surface, paddingVertical: spacing.sm },
  row:       { paddingHorizontal: spacing.base, gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical:   6,
    borderRadius:      radius.full,
    backgroundColor:   colors.surfaceSecond,
    borderWidth:       1,
    borderColor:       colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor:     colors.primary,
  },
  chipText:       { ...typography.label2, color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
});
