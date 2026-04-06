import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TimetableGrid, { CourseBlock } from '../../components/timetable/TimetableGrid';
import { colors, typography, spacing, shadow } from '../../theme';

// ── Sample data ──────────────────────────────────────────────────
const SAMPLE_COURSES: CourseBlock[] = [
  {
    id: '1', name: '운영체제',   room: '공학관 201',
    day: 0, startMin: 9*60,      endMin: 10*60+30,
    color: colors.course[0],
  },
  {
    id: '2', name: '데이터베이스', room: '정보관 103',
    day: 1, startMin: 10*60+30,  endMin: 12*60,
    color: colors.course[1],
  },
  {
    id: '3', name: '알고리즘',   room: '공학관 301',
    day: 2, startMin: 13*60,     endMin: 14*60+30,
    color: colors.course[2],
  },
  {
    id: '4', name: '컴퓨터네트워크', room: '공학관 202',
    day: 3, startMin: 15*60,     endMin: 16*60+30,
    color: colors.course[3],
  },
  {
    id: '5', name: '운영체제',   room: '공학관 201',
    day: 2, startMin: 9*60,      endMin: 10*60+30,
    color: colors.course[0],
  },
  {
    id: '6', name: '알고리즘',   room: '공학관 301',
    day: 4, startMin: 13*60,     endMin: 14*60+30,
    color: colors.course[2],
  },
];

const TERMS = ['2025 봄학기', '2024 가을학기', '2024 봄학기'];

export default function TimetableScreen() {
  const insets        = useSafeAreaInsets();
  const [termIdx, setTermIdx] = useState(0);
  const totalCredits  = 15;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.pageTitle}>시간표</Text>
          <Text style={styles.credit}>{totalCredits}학점 수강 중</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ 과목 추가</Text>
        </TouchableOpacity>
      </View>

      {/* Term selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.termRow}
      >
        {TERMS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[styles.termChip, i === termIdx && styles.termChipActive]}
            onPress={() => setTermIdx(i)}
          >
            <Text style={[styles.termText, i === termIdx && styles.termTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Timetable */}
      <ScrollView
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        <TimetableGrid courses={termIdx === 0 ? SAMPLE_COURSES : []} />

        {/* Course list below grid */}
        <View style={styles.courseList}>
          <Text style={styles.sectionTitle}>수강 과목</Text>
          {SAMPLE_COURSES.filter((c, i, arr) =>
            arr.findIndex(x => x.id === c.id || x.name === c.name) === i
          ).map(c => (
            <View key={c.id} style={styles.courseRow}>
              <View style={[styles.colorDot, { backgroundColor: c.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.courseName}>{c.name}</Text>
                <Text style={styles.courseRoom}>{c.room}</Text>
              </View>
              <Text style={styles.courseCredit}>3학점</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  topBar: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'flex-end',
    paddingHorizontal: spacing.base,
    paddingVertical:   spacing.md,
  },
  pageTitle: { ...typography.title1 },
  credit:    { ...typography.caption, marginTop: 2 },
  addBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius:    20,
    paddingHorizontal: 14,
    paddingVertical:   8,
  },
  addBtnText: { ...typography.label2, color: colors.primary },

  termRow: { paddingHorizontal: spacing.base, paddingBottom: spacing.md, gap: 8 },
  termChip: {
    paddingHorizontal: 14,
    paddingVertical:   7,
    borderRadius:      20,
    backgroundColor:   colors.surface,
    ...shadow.sm,
  },
  termChipActive: { backgroundColor: colors.primary },
  termText:       { ...typography.label2, color: colors.textSecondary },
  termTextActive: { color: '#fff' },

  gridContainer: { paddingHorizontal: spacing.base, paddingBottom: 100 },

  courseList:   { marginTop: spacing.base },
  sectionTitle: { ...typography.label1, marginBottom: spacing.sm },
  courseRow: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surface,
    borderRadius:    12,
    padding:         spacing.md,
    marginBottom:    spacing.sm,
    gap:             spacing.md,
    ...shadow.sm,
  },
  colorDot:     { width: 10, height: 10, borderRadius: 5 },
  courseName:   { ...typography.label1 },
  courseRoom:   { ...typography.caption, marginTop: 2 },
  courseCredit: { ...typography.label2, color: colors.primary },
});
