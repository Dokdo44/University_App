import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';

interface Thread {
  thread_id: string;
  title: string;
  author: string;
  reply_count: number;
  view_count: number;
  created_at: string;
  is_pinned: boolean;
}

export default function ThreadListScreen({ route, navigation }: any) {
  const forum = route.params.forum;
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/forums/${encodeURIComponent(forum.forum_name)}/threads`)
      .then(r => r.json())
      .then(setThreads)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [forum.forum_name]);

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error)   return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{forum.forum_name}</Text>
      <FlatList
        data={threads}
        keyExtractor={item => item.thread_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, item.is_pinned && styles.pinned]}
            onPress={() => navigation.navigate('Thread', { thread: item })}
          >
            {item.is_pinned && <Text style={styles.pinnedTag}>PINNED</Text>}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.author} · {item.reply_count} replies · {item.view_count} views
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  center:     { flex: 1, justifyContent: 'center' },
  header:     { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  error:      { color: 'red', padding: 16 },
  card:       {
    backgroundColor: '#fff', borderRadius: 10,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 3, elevation: 1,
  },
  pinned:     { borderLeftWidth: 3, borderLeftColor: '#1a56db' },
  pinnedTag:  { fontSize: 10, color: '#1a56db', fontWeight: '700', marginBottom: 4 },
  title:      { fontSize: 15, fontWeight: '600' },
  meta:       { fontSize: 12, color: '#6b7280', marginTop: 4 },
});
