import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Task, TaskStatus } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { GLOBAL_THEME } from '../theme';
import { confirmAction } from '../utils/confirm';
import * as Haptics from 'expo-haptics';

interface QuestCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  themeColor?: string;
}

const QuestCard: React.FC<QuestCardProps> = ({ task, onComplete, onDelete, themeColor }) => {
  const isDone = task.status === TaskStatus.COMPLETED;
  const accentColor = themeColor || GLOBAL_THEME.gold;

  const handleComplete = () => {
    if (isDone) return;
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    confirmAction(
      'Complete Quest',
      'Strike down this quest and advance your story?',
      [
        { text: 'Not yet', style: 'cancel' },
        { text: 'Conquer it', style: 'default', onPress: () => onComplete(task.id) },
      ]
    );
  };

  const handleDelete = () => {
    confirmAction(
      'Abandon Quest',
      'Are you sure you want to delete this quest?',
      [
        { text: 'Keep', style: 'cancel' },
        { text: 'Abandon', style: 'destructive', onPress: () => onDelete(task.id) },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        { borderLeftColor: isDone ? GLOBAL_THEME.textMuted : accentColor },
        isDone && styles.containerDone,
      ]}
      testID={`quest-card-${task.id}`}
    >
      <TouchableOpacity
        style={styles.checkBox}
        onPress={handleComplete}
        disabled={isDone}
        testID={`complete-task-${task.id}`}
      >
        {isDone ? (
          <View style={[styles.checkBoxFilled, { borderColor: GLOBAL_THEME.textMuted }]}>
            <Ionicons name="checkmark" size={16} color={GLOBAL_THEME.textMuted} />
          </View>
        ) : (
          <View style={[styles.checkBoxEmpty, { borderColor: accentColor }]} />
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            isDone && styles.titleDone,
          ]}
        >
          {task.title}
        </Text>
        {task.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          {task.category ? (
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>{task.category.toUpperCase()}</Text>
            </View>
          ) : null}
          {task.frequency && task.frequency !== 'once' ? (
            <View style={[styles.metaPill, { borderColor: accentColor }]}>
              <Ionicons name="refresh" size={10} color={accentColor} />
              <Text style={[styles.metaText, { color: accentColor }]}>
                {task.frequency.toUpperCase()}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {!isDone && (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          testID={`delete-task-${task.id}`}
        >
          <Ionicons name="close" size={18} color={GLOBAL_THEME.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLOBAL_THEME.surface,
    borderRadius: 14,
    borderLeftWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 12,
  },
  containerDone: {
    opacity: 0.5,
  },
  checkBox: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  checkBoxFilled: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: GLOBAL_THEME.textPrimary,
    marginBottom: 2,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: GLOBAL_THEME.textSecondary,
  },
  description: {
    fontSize: 13,
    color: GLOBAL_THEME.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: GLOBAL_THEME.border,
  },
  metaText: {
    fontSize: 9,
    fontWeight: '700',
    color: GLOBAL_THEME.textSecondary,
    letterSpacing: 1,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuestCard;
