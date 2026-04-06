import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from '../../theme';

type Color = 'blue' | 'green' | 'yellow' | 'red' | 'gray';

interface Props {
  label: string;
  color?: Color;
  style?: ViewStyle;
}

const palette: Record<Color, { bg: string; text: string }> = {
  blue:   { bg: colors.primaryLight, text: colors.primary },
  green:  { bg: colors.successLight,  text: colors.success },
  yellow: { bg: colors.warningLight,  text: colors.warning },
  red:    { bg: colors.errorLight,    text: colors.error },
  gray:   { bg: colors.borderLight,   text: colors.textSecondary },
};

export default function Badge({ label, color = 'blue', style }: Props) {
  const { bg, text } = palette[color];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  label: { fontSize: 11, fontWeight: '600' },
});
