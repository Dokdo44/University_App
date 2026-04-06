import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';

export interface Post {
  id:          string;
  board:       string;
  title:       string;
  preview:     string;
  likeCount:   number;
  commentCount:number;
  viewCount:   number;
  isAnonymous: boolean;
  author:      string;
  createdAt:   string;
}

interface Props {
  post:    Post;
  onPress: () => void;
}

export default function PostCard({ post, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.top}>
        <View style={styles.boardTag}>
          <Text style={styles.boardText}>{post.board}</Text>
        </View>
        <Text style={styles.time}>{post.createdAt}</Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>{post.title}</Text>
      <Text style={styles.preview} numberOfLines={2}>{post.preview}</Text>

      <View style={styles.footer}>
        <Text style={styles.author}>
          {post.isAnonymous ? '익명' : post.author}
        </Text>
        <View style={styles.stats}>
          <StatItem icon="♡" count={post.likeCount} />
          <StatItem icon="💬" count={post.commentCount} />
          <StatItem icon="👁" count={post.viewCount} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function StatItem({ icon, count }: { icon: string; count: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statCount}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius:    radius.lg,
    padding:         spacing.base,
    marginBottom:    spacing.sm,
  },
  top: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   spacing.sm,
  },
  boardTag: {
    backgroundColor: colors.primaryLight,
    borderRadius:    radius.sm,
    paddingHorizontal: 8,
    paddingVertical:   3,
  },
  boardText:{ ...typography.label2, color: colors.primary },
  time:     { ...typography.caption },

  title:    { ...typography.label1, marginBottom: 4 },
  preview:  { ...typography.body2, color: colors.textSecondary, lineHeight: 20 },

  footer: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginTop:      spacing.md,
  },
  author:   { ...typography.caption, color: colors.textTertiary },
  stats:    { flexDirection: 'row', gap: 10 },
  stat:     { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statIcon: { fontSize: 11 },
  statCount:{ ...typography.caption2, color: colors.textSecondary },
});
