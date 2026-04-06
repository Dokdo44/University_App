import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { dbService, ForumEngagement } from '../../services/db';

export default function ForumListScreen({ navigation }: any) {
  const [forums,  setForums]  = useState<ForumEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    dbService.getForumEngagement()
      .then(setForums)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error)   return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Community Forums</Text>
      <FlatList
        data={forums}
        keyExtractor={item => item.forum_name}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Threads', { forum: item })}
          >
            <Text style={styles.dept}>{item.department}</Text>
            <Text style={styles.name}>{item.forum_name}</Text>
            <View style={styles.stats}>
              <Text style={styles.stat}>{item.total_threads} threads</Text>
              <Text style={styles.stat}>{item.total_posts} posts</Text>
              <Text style={styles.stat}>{item.unique_authors} members</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  center:    { flex: 1, justifyContent: 'center' },
  header:    { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  error:     { color: 'red', padding: 16 },
  card:      {
    backgroundColor: '#fff', borderRadius: 10,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 4, elevation: 2,
  },
  dept:  { fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  name:  { fontSize: 17, fontWeight: '600', marginTop: 2 },
  stats: { flexDirection: 'row', gap: 16, marginTop: 8 },
  stat:  { fontSize: 13, color: '#4b5563' },
});
