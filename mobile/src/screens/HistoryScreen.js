import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, Chip, ActivityIndicator } from 'react-native-paper';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const RESULT_COLORS = { FRESH: '#2e7d32', MEDIUM: '#f9a825', SPOILED: '#c62828' };

export default function HistoryScreen() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/history');
        setPredictions(data.predictions);
      } catch (err) {
        showToast(err?.response?.data?.error || 'Unable to load history.');
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  if (loading) return <ActivityIndicator style={{ marginTop: 32 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={predictions}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListFooterComponent={<View style={{ height: 80 }} />}
        ListEmptyComponent={<Text style={styles.empty}>No predictions yet.</Text>}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View>
                <Text>{item.species} — {item.bodyPart}</Text>
                <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
              <Chip style={{ backgroundColor: RESULT_COLORS[item.result] }} textStyle={{ color: 'white' }}>
                {item.result} {item.confidence}%
              </Chip>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginBottom: 8 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timestamp: { color: '#888', fontSize: 12 },
  empty: { textAlign: 'center', color: '#888', marginTop: 16 }
});
