import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useApp } from '../../src/contexts/AppContext';
import QuestCard from '../../src/components/QuestCard';
import { createTask, completeTask, deleteTask } from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import VictoryModal from '../../src/components/VictoryModal';
import { TaskStatus, TaskFrequency } from '../../src/types';
import { GLOBAL_THEME, getTheme, DEFAULT_THEME } from '../../src/theme';
import { notify } from '../../src/utils/confirm';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';

const FREQUENCIES = [
  { id: TaskFrequency.ONCE, label: 'Single Quest', icon: 'flag' as const },
  { id: TaskFrequency.DAILY, label: 'Daily', icon: 'sunny' as const },
  { id: TaskFrequency.WEEKLY, label: 'Weekly', icon: 'calendar' as const },
  { id: TaskFrequency.MONTHLY, label: 'Monthly', icon: 'time' as const },
];

export default function TasksScreen() {
  const { todayTasks, activeStory, refreshAll } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState(TaskFrequency.ONCE);
  const [victoryModalVisible, setVictoryModalVisible] = useState(false);
  const [victoryData, setVictoryData] = useState<any>(null);

  const theme = activeStory?.has_active_story ? getTheme(activeStory.story?.theme) : DEFAULT_THEME;

  useFocusEffect(useCallback(() => { refreshAll(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      notify('Quest needs a name', 'Please enter a quest title');
      return;
    }
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        frequency,
      });
      setTitle(''); setDescription(''); setCategory(''); setFrequency(TaskFrequency.ONCE);
      setModalVisible(false);
      await refreshAll();
    } catch {
      notify('Error', 'Could not create quest');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const response = await completeTask(taskId);
      if (response.victory) {
        setVictoryData(response.victory);
        setVictoryModalVisible(true);
      }
      await refreshAll();
    } catch {
      notify('Error', 'Could not complete quest');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      await refreshAll();
    } catch {
      notify('Error', 'Could not delete quest');
    }
  };

  const pendingTasks = todayTasks.filter(t => t.status === TaskStatus.PENDING);
  const completedTasks = todayTasks.filter(t => t.status === TaskStatus.COMPLETED);

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="tasks-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>MISSIONS</Text>
            <Text style={styles.headerTitle}>Your Quest Log</Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => setModalVisible(true)}
            testID="add-task-btn"
          >
            <Ionicons name="add" size={26} color="#0A0A0A" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
        >
          <Animated.View entering={FadeIn.duration(400)} style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>⚔ ACTIVE QUESTS</Text>
              <Text style={[styles.sectionCount, { color: theme.primary }]}>
                {pendingTasks.length}
              </Text>
            </View>
            {pendingTasks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>📜</Text>
                <Text style={styles.emptyText}>No quests await. Forge new ones above.</Text>
              </View>
            ) : (
              pendingTasks.map((task, idx) => (
                <Animated.View key={task.id} entering={FadeInDown.delay(idx * 60).duration(400)}>
                  <QuestCard
                    task={task}
                    onComplete={handleCompleteTask}
                    onDelete={handleDeleteTask}
                    themeColor={theme.primary}
                  />
                </Animated.View>
              ))
            )}
          </Animated.View>

          {completedTasks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>🏆 CONQUERED</Text>
                <Text style={[styles.sectionCount, { color: theme.primary }]}>
                  {completedTasks.length}
                </Text>
              </View>
              {completedTasks.map((task) => (
                <QuestCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                  themeColor={theme.primary}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {/* CREATE QUEST MODAL */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Forge a Quest</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} testID="close-task-modal">
                  <Ionicons name="close" size={26} color={GLOBAL_THEME.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 520 }}>
                <Text style={styles.fieldLabel}>QUEST NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Clean the kitchen"
                  placeholderTextColor={GLOBAL_THEME.textMuted}
                  value={title}
                  onChangeText={setTitle}
                  testID="task-title-input"
                />

                <Text style={styles.fieldLabel}>DESCRIPTION (OPTIONAL)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Details of the quest..."
                  placeholderTextColor={GLOBAL_THEME.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  testID="task-description-input"
                />

                <Text style={styles.fieldLabel}>CATEGORY (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., chores, work, health"
                  placeholderTextColor={GLOBAL_THEME.textMuted}
                  value={category}
                  onChangeText={setCategory}
                  testID="task-category-input"
                />

                <Text style={styles.fieldLabel}>REPEAT</Text>
                <View style={styles.frequencyGrid}>
                  {FREQUENCIES.map((freq) => (
                    <TouchableOpacity
                      key={freq.id}
                      style={[
                        styles.frequencyOption,
                        frequency === freq.id && [styles.frequencyOptionSelected, { borderColor: theme.primary }],
                      ]}
                      onPress={() => setFrequency(freq.id)}
                      testID={`frequency-${freq.id}`}
                    >
                      <Ionicons 
                        name={freq.icon} 
                        size={18} 
                        color={frequency === freq.id ? theme.primary : GLOBAL_THEME.textMuted} 
                      />
                      <Text style={[
                        styles.frequencyLabel,
                        frequency === freq.id && { color: theme.primary, fontWeight: '800' },
                      ]}>
                        {freq.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: theme.primary }]}
                onPress={handleCreateTask}
                testID="submit-task-btn"
              >
                <Text style={styles.createButtonText}>BEGIN QUEST</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {victoryData && (
          <VictoryModal
            visible={victoryModalVisible}
            victoryText={victoryData.victory_text}
            pointsEarned={victoryData.points_earned}
            streakBonus={victoryData.streak_bonus}
            badgeEarned={victoryData.badge_earned}
            villainName={victoryData.villain_name}
            themeColor={theme.primary}
            themeFont={theme.fontFamily}
            onClose={() => {
              setVictoryModalVisible(false);
              setVictoryData(null);
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBAL_THEME.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  kicker: {
    fontSize: 10,
    color: GLOBAL_THEME.gold,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: GLOBAL_THEME.textPrimary,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    color: GLOBAL_THEME.textSecondary,
    fontWeight: '900',
    letterSpacing: 2,
  },
  sectionCount: {
    fontSize: 18,
    fontWeight: '900',
  },
  emptyCard: {
    backgroundColor: GLOBAL_THEME.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLOBAL_THEME.border,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: GLOBAL_THEME.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: GLOBAL_THEME.border,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: GLOBAL_THEME.textMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: GLOBAL_THEME.textPrimary,
  },
  fieldLabel: {
    fontSize: 10,
    color: GLOBAL_THEME.textSecondary,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: GLOBAL_THEME.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: GLOBAL_THEME.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  frequencyOption: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  frequencyOptionSelected: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  frequencyLabel: {
    fontSize: 13,
    color: GLOBAL_THEME.textSecondary,
    fontWeight: '600',
  },
  createButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: '#0A0A0A',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
