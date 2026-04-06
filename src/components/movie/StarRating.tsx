import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';

interface Props {
  value:      number | null;
  onChange?:  (v: number) => void;
  size?:      number;
  readonly?:  boolean;
}

export default function StarRating({ value, onChange, size = 22, readonly = false }: Props) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.row}>
      {stars.map(n => {
        const filled = value !== null && n <= value;
        const star = (
          <Text key={n} style={[styles.star, { fontSize: size }, filled && styles.filled]}>
            {filled ? '★' : '☆'}
          </Text>
        );
        if (readonly) return star;
        return (
          <TouchableOpacity key={n} onPress={() => onChange?.(n)} hitSlop={8}>
            {star}
          </TouchableOpacity>
        );
      })}
      {value !== null && (
        <Text style={styles.label}>{value}.0</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  star:   { color: colors.border },
  filled: { color: colors.warning },
  label:  { fontSize: 13, color: colors.textSecondary, marginLeft: spacing.xs },
});
