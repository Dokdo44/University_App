import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, shadow } from '../../theme';

interface MenuItem {
  icon:  string;
  label: string;
  badge?: string;
}

const MENU_GROUPS: { title: string; items: MenuItem[] }[] = [
  {
    title: '학교생활',
    items: [
      { icon: '🍽️', label: '학식 메뉴' },
      { icon: '📚', label: '도서관 좌석' },
      { icon: '🚌', label: '셔틀버스' },
      { icon: '📅', label: '학사 일정' },
    ],
  },
  {
    title: '내 정보',
    items: [
      { icon: '📝', label: '내가 쓴 글' },
      { icon: '💬', label: '댓글 단 글' },
      { icon: '♡',  label: '좋아요한 글' },
      { icon: '🔔', label: '알림 설정', badge: '3' },
    ],
  },
  {
    title: '설정',
    items: [
      { icon: '🔒', label: '계정 보안' },
      { icon: '🌙', label: '다크모드' },
      { icon: '❓', label: '고객센터' },
      { icon: '📄', label: '이용약관' },
    ],
  },
];

export default function MoreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>컴</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>김컴공</Text>
          <Text style={styles.userInfo}>컴퓨터공학과 · 3학년</Text>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editBtnText}>편집</Text>
        </TouchableOpacity>
      </View>

      {/* Menu groups */}
      {MENU_GROUPS.map(group => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <View style={styles.groupCard}>
            {group.items.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuItem,
                  idx < group.items.length - 1 && styles.menuItemBorder,
                ]}
                activeOpacity={0.6}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.badge && (
                  <View style={styles.badgeDot}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      <Text style={styles.version}>버전 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll:    { padding: spacing.base, paddingBottom: 100 },

  profileCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surface,
    borderRadius:    radius.lg,
    padding:         spacing.base,
    marginBottom:    spacing.base,
    gap:             spacing.md,
    ...shadow.sm,
  },
  avatar: {
    width:           48,
    height:          48,
    borderRadius:    24,
    backgroundColor: colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText: { fontSize: 20, color: '#fff' },
  userName:   { ...typography.title3 },
  userInfo:   { ...typography.caption, marginTop: 2 },
  editBtn:    { backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6 },
  editBtnText:{ ...typography.label2, color: colors.textSecondary },

  group:      { marginBottom: spacing.base },
  groupTitle: { ...typography.label2, color: colors.textSecondary, marginBottom: spacing.sm, marginLeft: 4 },
  groupCard:  { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.sm },

  menuItem: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: spacing.base,
    paddingVertical:   spacing.md,
    gap:             spacing.md,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  menuIcon:  { fontSize: 18, width: 24, textAlign: 'center' },
  menuLabel: { ...typography.body2, flex: 1 },
  badgeDot:  { backgroundColor: colors.error, borderRadius: radius.full, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  chevron:   { fontSize: 20, color: colors.textTertiary, lineHeight: 24 },

  logoutBtn:  { alignItems: 'center', paddingVertical: spacing.base, marginTop: spacing.sm },
  logoutText: { ...typography.body2, color: colors.error },
  version:    { ...typography.caption, textAlign: 'center', marginTop: spacing.sm },
});
