import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Theme/ThemeProvider';
import { useNotifications } from '../../services/NotificationContext';
import HeaderBack from '../../components/HeaderBack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const categories = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'general', label: 'General' },
  { key: 'emergency', label: 'Emergency' },
  { key: 'waste', label: 'Waste' },
];

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const { notifications, markAllAsRead, removeNotification, markAsRead, clearAll } = useNotifications();
  const [active, setActive] = useState('all');

  const filtered = useMemo(() => {
    if (active === 'all') return notifications;
    if (active === 'unread') return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === active);
  }, [notifications, active]);

    const renderItem = ({ item }) => {
    const tint = item.color || '#28942c';
    const cardBg = theme === 'light' ? '#fff' : '#14181F';
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => markAsRead(item.id)}
        style={[styles.card, { backgroundColor: cardBg, borderColor: theme === 'light' ? '#e1e5ea' : '#27313F' }]}
      >
        <View style={[styles.iconCircle, { backgroundColor: tint + '20' }]}> 
          <Ionicons name={item.icon || 'notifications'} size={20} color={tint} />
          {!item.read && <View style={[styles.iconUnreadDot, { borderColor: cardBg }]} />}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
          </View>
          <Text style={[styles.message, { color: colors.text + 'AA' }]} numberOfLines={2}>{item.message}</Text>
          <Text style={[styles.timestamp, { color: colors.text + '88' }]}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        <TouchableOpacity onPress={() => removeNotification(item.id)} style={styles.deleteBtn} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name="close" size={16} color={colors.text + '88'} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: insets.top }]}> 
      <StatusBar
        backgroundColor={theme === 'light' ? '#ffffff' : '#14181F'}
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
      />

      <View style={styles.container}> 
        <HeaderBack title="Notifications" />

        <View style={{ flex: 1 }}>
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={markAllAsRead} style={[styles.actionBtn, { backgroundColor: theme === 'light' ? '#f1f3f5' : '#1F2633' }]}>
              <Ionicons name="checkmark-done" size={16} color="#28942c" />
              <Text style={[styles.actionLabel, { color: colors.text }]}>Mark all read</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearAll} style={[styles.actionBtn, { backgroundColor: theme === 'light' ? '#f1f3f5' : '#1F2633' }]}>
              <Ionicons name="trash-outline" size={16} color="#E53935" />
              <Text style={[styles.actionLabel, { color: colors.text }]}>Clear</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipsRow}>
            {categories.map((c) => {
              const selected = active === c.key;
              const baseBg = theme === 'light' ? '#f1f3f5' : '#1F2633';
              const baseBorder = theme === 'light' ? '#e1e5ea' : '#27313F';
              return (
                <TouchableOpacity key={c.key} onPress={() => setActive(c.key)}
                  style={[
                    styles.chip,
                    { backgroundColor: baseBg, borderColor: baseBorder },
                    selected && { backgroundColor: '#28942c', borderColor: '#28942c' },
                  ]}
                >
                  <Text style={[styles.chipLabel, { color: selected ? '#fff' : colors.text }]}>{c.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={filtered.length === 0 && { flex: 1, justifyContent: 'center', alignItems: 'center' }}
            ListEmptyComponent={() => (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="notifications-off-outline" size={28} color={colors.text + '66'} />
                <Text style={{ color: colors.text + '88', marginTop: 8 }}>No notifications</Text>
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: 'flex-start' },
  actionsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  actionLabel: { fontSize: 13, fontWeight: '600' },
  chipsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  chipLabel: { fontSize: 13, fontWeight: '600' },
  card: { marginHorizontal: 16, marginVertical: 6, borderRadius: 12, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'flex-start', position: 'relative' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12, position: 'relative' },
  iconUnreadDot: { position: 'absolute', top: -1, right: -1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#28942c', borderWidth: 2 },
  cardContent: { flex: 1 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 14, fontWeight: '700' },
  message: { marginTop: 4, fontSize: 13 },
  timestamp: { marginTop: 6, fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#28942c' },
  deleteBtn: { position: 'absolute', top: 8, right: 8, padding: 4 },

});