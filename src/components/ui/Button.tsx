import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet,
  ActivityIndicator, ViewStyle, TextStyle,
} from 'react-native';
import { colors, radius, typography } from '../../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'lg' | 'md' | 'sm';

interface Props {
  label:     string;
  onPress:   () => void;
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  disabled?: boolean;
  style?:    ViewStyle;
}

export default function Button({
  label, onPress, variant = 'primary', size = 'lg',
  loading = false, disabled = false, style,
}: Props) {
  const btnStyle  = [styles.base, styles[variant], styles[`size_${size}`], disabled && styles.disabled, style];
  const textStyle = [styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]] as TextStyle[];

  return (
    <TouchableOpacity
      style={btnStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} size="small" />
        : <Text style={textStyle}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base:         { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },

  // Variants
  primary:      { backgroundColor: colors.primary },
  secondary:    { backgroundColor: colors.primaryLight },
  ghost:        { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  danger:       { backgroundColor: colors.errorLight },
  disabled:     { opacity: 0.4 },

  // Sizes
  size_lg:      { paddingVertical: 16, paddingHorizontal: 24 },
  size_md:      { paddingVertical: 12, paddingHorizontal: 20 },
  size_sm:      { paddingVertical: 8,  paddingHorizontal: 16 },

  // Text base
  text:         { ...typography.label1 },
  text_primary: { color: '#fff' },
  text_secondary:{ color: colors.primary },
  text_ghost:   { color: colors.textPrimary },
  text_danger:  { color: colors.error },

  textSize_lg:  { fontSize: 16 },
  textSize_md:  { fontSize: 14 },
  textSize_sm:  { fontSize: 13 },
});
