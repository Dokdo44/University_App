import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../theme';

interface Props {
  title:        string;
  subtitle?:    string;
  showBack?:    boolean;
  onBack?:      () => void;
  rightElement?: React.ReactNode;
}

export default function Header({ title, subtitle, showBack, onBack, rightElement }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight ?? 0;

  return (
    <View style={[styles.container, { paddingTop: topPad + spacing.sm }]}>
      <View style={styles.row}>
        {showBack && (
          <TouchableOpacity style={styles.back} onPress={onBack} hitSlop={{ top:8,bottom:8,left:8,right:8 }}>
            {/* Chevron left */}
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titles}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightElement && <View style={styles.right}>{rightElement}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  row:      { flexDirection: 'row', alignItems: 'center' },
  back:     { marginRight: spacing.sm },
  backIcon: { fontSize: 32, color: colors.textPrimary, lineHeight: 36, marginTop: -4 },
  titles:   { flex: 1 },
  title:    { ...typography.title2 },
  subtitle: { ...typography.caption, marginTop: 2 },
  right:    { marginLeft: spacing.sm },
});
