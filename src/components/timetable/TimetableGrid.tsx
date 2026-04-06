import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, typography, spacing } from '../../theme';

const SCREEN_W    = Dimensions.get('window').width;
const TIME_COL_W  = 36;
const DAY_COUNT   = 5;
const CELL_W      = (SCREEN_W - TIME_COL_W - spacing.base * 2) / DAY_COUNT;
const HOUR_HEIGHT = 52;
const START_HOUR  = 9;   // 09:00
const END_HOUR    = 20;  // 20:00
const TOTAL_HOURS = END_HOUR - START_HOUR;

const DAYS = ['월', '화', '수', '목', '금'];

export interface CourseBlock {
  id:       string;
  name:     string;
  room?:    string;
  day:      number;   // 0=월 … 4=금
  startMin: number;   // minutes since midnight  e.g. 9*60
  endMin:   number;
  color:    string;
}

interface Props {
  courses: CourseBlock[];
}

function minutesToY(min: number) {
  return ((min - START_HOUR * 60) / 60) * HOUR_HEIGHT;
}

export default function TimetableGrid({ courses }: Props) {
  const hours = useMemo(
    () => Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i),
    [],
  );

  return (
    <View style={styles.wrapper}>
      {/* Day headers */}
      <View style={styles.headerRow}>
        <View style={{ width: TIME_COL_W }} />
        {DAYS.map(d => (
          <View key={d} style={styles.dayHeader}>
            <Text style={styles.dayText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid body */}
      <View style={styles.body}>
        {/* Time labels + horizontal lines */}
        <View style={styles.timeCol}>
          {hours.map(h => (
            <View key={h} style={styles.timeCell}>
              <Text style={styles.timeText}>{h}</Text>
            </View>
          ))}
        </View>

        {/* Day columns with grid lines */}
        <View style={styles.gridArea}>
          {/* Horizontal hour lines */}
          {hours.map((h, i) => (
            <View
              key={h}
              style={[styles.hLine, { top: i * HOUR_HEIGHT }]}
            />
          ))}

          {/* Vertical day dividers */}
          {DAYS.map((_, i) => (
            <View
              key={i}
              style={[styles.vLine, { left: i * CELL_W }]}
            />
          ))}

          {/* Course blocks */}
          {courses.map(course => {
            const top    = minutesToY(course.startMin);
            const height = ((course.endMin - course.startMin) / 60) * HOUR_HEIGHT - 2;
            const left   = course.day * CELL_W + 1;
            return (
              <View
                key={course.id}
                style={[
                  styles.courseBlock,
                  {
                    top,
                    left,
                    width:  CELL_W - 2,
                    height,
                    backgroundColor: course.color,
                  },
                ]}
              >
                <Text style={styles.courseName} numberOfLines={2}>
                  {course.name}
                </Text>
                {course.room && (
                  <Text style={styles.courseRoom} numberOfLines={1}>
                    {course.room}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderRadius:    16,
    overflow:        'hidden',
  },

  // Header
  headerRow: {
    flexDirection:   'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dayHeader: { width: CELL_W, alignItems: 'center' },
  dayText:   { ...typography.label2, color: colors.textSecondary },

  // Body
  body:    { flexDirection: 'row' },
  timeCol: { width: TIME_COL_W },
  timeCell:{
    height:     HOUR_HEIGHT,
    alignItems: 'flex-end',
    paddingRight: 4,
    paddingTop: 2,
  },
  timeText: { ...typography.caption2, color: colors.textTertiary },

  // Grid
  gridArea: {
    flex:     1,
    height:   TOTAL_HOURS * HOUR_HEIGHT,
    position: 'relative',
  },
  hLine: {
    position:        'absolute',
    left:            0,
    right:           0,
    height:          1,
    backgroundColor: colors.borderLight,
  },
  vLine: {
    position:        'absolute',
    top:             0,
    bottom:          0,
    width:           1,
    backgroundColor: colors.borderLight,
  },

  // Course block
  courseBlock: {
    position:     'absolute',
    borderRadius: 6,
    padding:      4,
    opacity:      0.92,
  },
  courseName: {
    fontSize:   10,
    fontWeight: '700',
    color:      '#fff',
    lineHeight: 14,
  },
  courseRoom: {
    fontSize:   9,
    color:      'rgba(255,255,255,0.85)',
    marginTop:  2,
  },
});
