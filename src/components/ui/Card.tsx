import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme';

interface Props {
  children:  React.ReactNode;
  style?:    ViewStyle;
  padding?:  number;
  elevated?: boolean;
}

export default function Card({ children, style, padding = spacing.base, elevated = false }: Props) {
  return (
    <View style={[styles.card, elevated && shadow.md, { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius:    radius.lg,
    ...shadow.sm,
  },
});
