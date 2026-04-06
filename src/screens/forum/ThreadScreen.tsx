import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';

interface Post {
  post_id: string;
  author: string;
  body: string;
  created_at: string;
  like_count: number;
  helpful_count: number;
}

export default function ThreadScreen({ route }: any) {
  const thread = route.params.thread;
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [body,    setBody]    = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const apiBase = process.env.EXPO_PUBLIC_API_URL ?? '';

  useEffect(() => {
    fetch(`${apiBase}/api/threads/${thread.thread_id}/posts`)
      .then(r => r.json())
      .then(setPosts)
      .catch(() => Alert.alert('Error', 'Could not load posts.'))
      .finally(() => setLoading(false));
  }, [thread.thread_id]);

  async function submitPost() {
    if (!body.trim()) return;
    setPosting(true);
    try {
      await fetch(`${apiBase}/api/threads/${thread.thread_id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim() }),
      });
      setBody('');
      // Refresh posts
      const updated = await fetch(`${apiBase}/api/threads/${thread.thread_id}/posts`);
      setPosts(await updated.json());
    } catch {
      Alert.alert('Error', 'Could not post reply.');
    } finally {
      setPosting(false);
    }
  }

  if (loading) return <ActivityIndicator style={styles.center} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{thread.title}</Text>

      <FlatList
        data={posts}
        keyExtractor={item => item.post_id}
        renderItem={({ item }) => (
          <View style={styles.post}>
            <Text style={styles.postAuthor}>{item.author}</Text>
            <Text style={styles.postBody}>{item.body}</Text>
            <View style={styles.reactions}>
              <Text style={styles.reaction}>👍 {item.like_count}</Text>
              <Text style={styles.reaction}>💡 {item.helpful_count}</Text>
            </View>
          </View>
        )}
        style={{ flex: 1 }}
      />

      <View style={styles.compose}>
        <TextInput
          style={styles.input}
          placeholder="Write a reply…"
          multiline
          value={body}
          onChangeText={setBody}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={submitPost} disabled={posting}>
          {posting
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.sendText}>Post</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f7fa' },
  center:       { flex: 1, justifyContent: 'center' },
  title:        { fontSize: 18, fontWeight: '700', padding: 16, backgroundColor: '#fff' },
  post:         {
    backgroundColor: '#fff', marginHorizontal: 12,
    marginTop: 10, borderRadius: 10, padding: 14,
  },
  postAuthor:   { fontWeight: '700', fontSize: 13, color: '#1a56db' },
  postBody:     { fontSize: 15, marginTop: 4, lineHeight: 22 },
  reactions:    { flexDirection: 'row', gap: 12, marginTop: 8 },
  reaction:     { fontSize: 13, color: '#6b7280' },
  compose:      {
    flexDirection: 'row', padding: 12, borderTopWidth: 1,
    borderTopColor: '#e5e7eb', backgroundColor: '#fff', alignItems: 'flex-end',
  },
  input:        {
    flex: 1, borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 8, padding: 10, maxHeight: 100, fontSize: 14,
  },
  sendBtn:      {
    backgroundColor: '#1a56db', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 10, marginLeft: 8,
  },
  sendText:     { color: '#fff', fontWeight: '600' },
});
