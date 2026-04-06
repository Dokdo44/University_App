import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { dbService, EnrollmentHealth } from '../../services/db';

export default function ScheduleScreen({ navigation }: any) {
  const [sections, setSections] = useState<EnrollmentHealth[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    dbService.getEnrollmentHealth()
      .then(setSections)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error)   return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Current Sections</Text>
      <FlatList
        data={sections}
        keyExtractor={item => `${item.course_code}-${item.section_code}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Enroll', { section: item })}
          >
            <Text style={styles.courseCode}>{item.course_code} – {item.section_code}</Text>
            <Text style={styles.title}>{item.course_title}</Text>
            <Text style={styles.meta}>
              {item.instructor} · {item.enrolled_count}/{item.max_capacity} enrolled ({item.fill_pct}%)
            </Text>
            {item.waitlisted_count > 0 && (
              <Text style={styles.waitlist}>{item.waitlisted_count} on waitlist</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  center:     { flex: 1, justifyContent: 'center' },
  header:     { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  error:      { color: 'red', padding: 16 },
  card:       {
    backgroundColor: '#fff', borderRadius: 10,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 4, elevation: 2,
  },
  courseCode: { fontSize: 14, fontWeight: '700', color: '#1a56db' },
  title:      { fontSize: 16, fontWeight: '600', marginTop: 2 },
  meta:       { fontSize: 13, color: '#555', marginTop: 4 },
  waitlist:   { fontSize: 12, color: '#d97706', marginTop: 4 },
});
