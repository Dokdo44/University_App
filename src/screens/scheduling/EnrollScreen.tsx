import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { EnrollmentHealth } from '../../services/db';

export default function EnrollScreen({ route, navigation }: any) {
  const section: EnrollmentHealth = route.params.section;
  const [loading, setLoading] = useState(false);
  const isFull = section.enrolled_count >= section.max_capacity;

  async function handleEnroll() {
    setLoading(true);
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_code: section.section_code }),
      });
      Alert.alert('Success', isFull ? 'Added to waitlist.' : 'Enrolled successfully!');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.code}>{section.course_code}</Text>
      <Text style={styles.title}>{section.course_title}</Text>
      <Text style={styles.meta}>Section {section.section_code}  ·  {section.instructor}</Text>
      <Text style={styles.meta}>
        {section.enrolled_count} / {section.max_capacity} enrolled ({section.fill_pct}% full)
      </Text>
      {isFull && <Text style={styles.warning}>Section full — you will be waitlisted.</Text>}

      <TouchableOpacity
        style={[styles.btn, isFull && styles.btnWaitlist]}
        onPress={handleEnroll}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>{isFull ? 'Join Waitlist' : 'Enroll'}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, padding: 24, backgroundColor: '#fff' },
  code:        { fontSize: 15, fontWeight: '700', color: '#1a56db' },
  title:       { fontSize: 22, fontWeight: '700', marginTop: 4, marginBottom: 8 },
  meta:        { fontSize: 14, color: '#555', marginBottom: 4 },
  warning:     { color: '#d97706', marginVertical: 12, fontWeight: '600' },
  btn:         {
    backgroundColor: '#1a56db', borderRadius: 8,
    padding: 14, alignItems: 'center', marginTop: 24,
  },
  btnWaitlist: { backgroundColor: '#d97706' },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '600' },
});
