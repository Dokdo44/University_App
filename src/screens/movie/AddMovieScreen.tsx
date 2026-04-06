import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../../theme';
import {
  MovieFormData, MovieStatus, STATUS_LABELS, PLATFORM_OPTIONS, GENRE_OPTIONS,
} from '../../types/movie';
import { addMovie, updateMovie } from '../../services/movieService';
import StarRating                from '../../components/movie/StarRating';

interface Props {
  navigation:    any;
  route:         any;
  coupleSpaceId: string;
  user1Name:     string;
  user2Name:     string;
}

const EMPTY_FORM: MovieFormData = {
  title:        '',
  posterUrl:    '',
  status:       'want_to_watch',
  watchedAt:    null,
  platform:     '',
  genres:       [],
  ratingUser1:  null,
  ratingUser2:  null,
  commentUser1: '',
  commentUser2: '',
  year:         '',
  director:     '',
};

export default function AddMovieScreen({ navigation, route, coupleSpaceId, user1Name, user2Name }: Props) {
  const existingMovie = route.params?.movie;
  const isEdit        = !!existingMovie;

  const [form, setForm] = useState<MovieFormData>(
    isEdit
      ? {
          title:        existingMovie.title,
          posterUrl:    existingMovie.posterUrl,
          status:       existingMovie.status,
          watchedAt:    existingMovie.watchedAt,
          platform:     existingMovie.platform,
          genres:       existingMovie.genres,
          ratingUser1:  existingMovie.ratingUser1,
          ratingUser2:  existingMovie.ratingUser2,
          commentUser1: existingMovie.commentUser1,
          commentUser2: existingMovie.commentUser2,
          year:         existingMovie.year,
          director:     existingMovie.director,
        }
      : EMPTY_FORM,
  );
  const [loading,        setLoading]        = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateStr,        setDateStr]        = useState(
    existingMovie?.watchedAt ? formatDateISO(existingMovie.watchedAt) : '',
  );

  function set<K extends keyof MovieFormData>(key: K, value: MovieFormData[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function toggleGenre(g: string) {
    set('genres', form.genres.includes(g)
      ? form.genres.filter(x => x !== g)
      : [...form.genres, g]);
  }

  function handleDateInput(text: string) {
    setDateStr(text);
    // Parse YYYY-MM-DD
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      if (!isNaN(d.getTime())) {
        set('watchedAt', d);
        return;
      }
    }
    set('watchedAt', null);
  }

  async function handleSubmit() {
    if (!form.title.trim()) { Alert.alert('알림', '제목을 입력해 주세요.'); return; }

    setLoading(true);
    try {
      if (isEdit) {
        await updateMovie(existingMovie.id, form);
      } else {
        await addMovie(coupleSpaceId, form);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('오류', e.message);
    } finally {
      setLoading(false);
    }
  }

  const needsWatchedAt = form.status === 'watched' || form.status === 'rewatch';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.navCancel}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{isEdit ? '영화 편집' : '영화 추가'}</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color={colors.primary} />
            : <Text style={styles.navSave}>저장</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {/* Title */}
          <Field label="영화 제목 *">
            <TextInput
              style={styles.input}
              placeholder="영화 제목을 입력하세요"
              placeholderTextColor={colors.textTertiary}
              value={form.title}
              onChangeText={t => set('title', t)}
              autoFocus={!isEdit}
            />
          </Field>

          {/* Poster URL */}
          <Field label="포스터 URL">
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor={colors.textTertiary}
              value={form.posterUrl}
              onChangeText={t => set('posterUrl', t)}
              autoCapitalize="none"
              keyboardType="url"
            />
          </Field>

          {/* Status */}
          <Field label="상태">
            <View style={styles.chipRow}>
              {(['want_to_watch', 'watched', 'rewatch'] as MovieStatus[]).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, form.status === s && styles.chipActive]}
                  onPress={() => set('status', s)}
                >
                  <Text style={[styles.chipText, form.status === s && styles.chipTextActive]}>
                    {STATUS_LABELS[s]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          {/* Watched date */}
          {needsWatchedAt && (
            <Field label="함께 본 날짜">
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (예: 2025-06-15)"
                placeholderTextColor={colors.textTertiary}
                value={dateStr}
                onChangeText={handleDateInput}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
            </Field>
          )}

          {/* Platform */}
          <Field label="플랫폼">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {PLATFORM_OPTIONS.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, form.platform === p && styles.chipActive]}
                  onPress={() => set('platform', form.platform === p ? '' : p)}
                >
                  <Text style={[styles.chipText, form.platform === p && styles.chipTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Field>

          {/* Genres */}
          <Field label="장르">
            <View style={styles.genreWrap}>
              {GENRE_OPTIONS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, form.genres.includes(g) && styles.chipActive]}
                  onPress={() => toggleGenre(g)}
                >
                  <Text style={[styles.chipText, form.genres.includes(g) && styles.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          {/* Year & Director */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="개봉연도">
                <TextInput
                  style={styles.input}
                  placeholder="예: 2024"
                  placeholderTextColor={colors.textTertiary}
                  value={form.year}
                  onChangeText={t => set('year', t)}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </Field>
            </View>
            <View style={{ width: spacing.md }} />
            <View style={{ flex: 2 }}>
              <Field label="감독">
                <TextInput
                  style={styles.input}
                  placeholder="예: 봉준호"
                  placeholderTextColor={colors.textTertiary}
                  value={form.director}
                  onChangeText={t => set('director', t)}
                />
              </Field>
            </View>
          </View>

          {/* Ratings & comments – only for watched */}
          {needsWatchedAt && (
            <>
              <View style={styles.sectionDivider}>
                <Text style={styles.sectionDividerText}>평점 & 한줄평</Text>
              </View>

              {/* User 1 */}
              <Field label={`${user1Name}의 평점`}>
                <StarRating value={form.ratingUser1} onChange={v => set('ratingUser1', v)} size={28} />
              </Field>
              <Field label={`${user1Name}의 한줄평`}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="한 줄로 감상을 남겨보세요"
                  placeholderTextColor={colors.textTertiary}
                  value={form.commentUser1}
                  onChangeText={t => set('commentUser1', t)}
                  multiline
                  maxLength={200}
                />
              </Field>

              {/* User 2 */}
              <Field label={`${user2Name}의 평점`}>
                <StarRating value={form.ratingUser2} onChange={v => set('ratingUser2', v)} size={28} />
              </Field>
              <Field label={`${user2Name}의 한줄평`}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="한 줄로 감상을 남겨보세요"
                  placeholderTextColor={colors.textTertiary}
                  value={form.commentUser2}
                  onChangeText={t => set('commentUser2', t)}
                  multiline
                  maxLength={200}
                />
              </Field>
            </>
          )}

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function formatDateISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  navBar: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical:   spacing.md,
    backgroundColor:   colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  navCancel: { ...typography.body1, color: colors.textSecondary },
  navTitle:  { ...typography.title3 },
  navSave:   { ...typography.label1, color: colors.primary },

  container: { padding: spacing.base },

  field:      { marginBottom: spacing.base },
  fieldLabel: { ...typography.label1, color: colors.textSecondary, marginBottom: spacing.sm },

  input: {
    backgroundColor:   colors.surface,
    borderRadius:      radius.md,
    borderWidth:       1,
    borderColor:       colors.border,
    paddingHorizontal: spacing.base,
    height:            48,
    ...typography.body1,
    color:             colors.textPrimary,
  },
  textArea: {
    height:      96,
    paddingTop:  spacing.md,
    textAlignVertical: 'top',
  },

  chipRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  genreWrap:{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm,
    borderRadius:      radius.full,
    backgroundColor:   colors.surfaceSecond,
    borderWidth:       1,
    borderColor:       colors.border,
  },
  chipActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:       { ...typography.label2, color: colors.textSecondary },
  chipTextActive: { color: '#fff' },

  row: { flexDirection: 'row' },

  sectionDivider: {
    borderTopWidth:   1,
    borderTopColor:   colors.borderLight,
    paddingTop:       spacing.base,
    marginBottom:     spacing.base,
    marginTop:        spacing.sm,
  },
  sectionDividerText: { ...typography.title3 },
});
