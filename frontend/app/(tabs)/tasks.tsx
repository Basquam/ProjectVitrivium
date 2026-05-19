import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/contexts/AppContext';
import TaskCard from '../../src/components/TaskCard';
import { createTask, completeTask, deleteTask } from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import VictoryModal from '../../src/components/VictoryModal';
import { TaskStatus, TaskFrequency } from '../../src/types';
import * as Haptics from 'expo-haptics';

const FREQUENCIES = [
  { id: TaskFrequency.ONCE, label: 'One-time', icon: '📌' },
  { id: TaskFrequency.DAILY, label: 'Daily', icon: '🔄' },
  { id: TaskFrequency.WEEKLY, label: 'Weekly', icon: '📅' },
  { id: TaskFrequency.MONTHLY, label: 'Monthly', icon: '🗓️' },
];

export default function TasksScreen() {
  const { todayTasks, refreshAll } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState(TaskFrequency.ONCE);
  const [victoryModalVisible, setVictoryModalVisible] = useState(false);
  const [victoryData, setVictoryData] = useState<any>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        frequency: frequency,
      });
      
      setTitle('');
      setDescription('');
      setCategory('');
      setFrequency(TaskFrequency.ONCE);
      setModalVisible(false);
      await refreshAll();
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      const response = await completeTask(taskId);
      
      if (response.victory) {
        setVictoryData(response.victory);
        setVictoryModalVisible(true);
      }
      
      await refreshAll();
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      await refreshAll();
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  const handleCloseVictory = () => {
    setVictoryModalVisible(false);
    setVictoryData(null);
  };

  const pendingTasks = todayTasks.filter(t => t.status === TaskStatus.PENDING);
  const completedTasks = todayTasks.filter(t => t.status === TaskStatus.COMPLETED);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tasks</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
            testID="add-task-btn"
          >
            <Ionicons name="add" size={28} color="#0a0a0a" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffd700"
            />
          }
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ⏳ Pending ({pendingTasks.length})
            </Text>
            {pendingTasks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No pending tasks</Text>
              </View>
            ) : (
              pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </View>

          {completedTasks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                ✅ Completed ({completedTasks.length})
              </Text>
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Task</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} testID="close-task-modal">
                  <Ionicons name="close" size={28} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 500 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Task title *"
                  placeholderTextColor="#6b7280"
                  value={title}
                  onChangeText={setTitle}
                  testID="task-title-input"
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description (optional)"
                  placeholderTextColor="#6b7280"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  testID="task-description-input"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Category (optional)"
                  placeholderTextColor="#6b7280"
                  value={category}
                  onChangeText={setCategory}
                  testID="task-category-input"
                />

                <Text style={styles.fieldLabel}>Repeat</Text>
                <View style={styles.frequencyGrid}>
                  {FREQUENCIES.map((freq) => (
                    <TouchableOpacity
                      key={freq.id}
                      style={[
                        styles.frequencyOption,
                        frequency === freq.id && styles.frequencyOptionSelected,
                      ]}
                      onPress={() => setFrequency(freq.id)}
                      testID={`frequency-${freq.id}`}
                    >
                      <Text style={styles.frequencyIcon}>{freq.icon}</Text>
                      <Text style={[
                        styles.frequencyLabel,
                        frequency === freq.id && styles.frequencyLabelSelected,
                      ]}>
                        {freq.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateTask}
                testID="submit-task-btn"
              >
                <Text style={styles.createButtonText}>Create Task</Text>
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
            onClose={handleCloseVictory}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f3f4f6',
  },
  addButton: {
    backgroundColor: '#ffd700',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f3f4f6',
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#f3f4f6',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: 8,
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  frequencyOption: {
    width: '48%',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  frequencyOptionSelected: {
    borderColor: '#ffd700',
  },
  frequencyIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  frequencyLabel: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '600',
  },
  frequencyLabelSelected: {
    color: '#ffd700',
  },
  createButton: {
    backgroundColor: '#ffd700',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
