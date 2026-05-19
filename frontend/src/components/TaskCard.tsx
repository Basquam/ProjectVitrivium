import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Task, TaskStatus } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onDelete }) => {
  const handleComplete = () => {
    Alert.alert(
      'Complete Task',
      'Mark this task as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', onPress: () => onComplete(task.id) },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(task.id) },
      ]
    );
  };

  return (
    <View style={[
      styles.container,
      task.status === TaskStatus.COMPLETED && styles.completedContainer
    ]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            onPress={handleComplete}
            disabled={task.status === TaskStatus.COMPLETED}
            style={styles.checkbox}
          >
            {task.status === TaskStatus.COMPLETED ? (
              <Ionicons name="checkmark-circle" size={28} color="#10b981" />
            ) : (
              <Ionicons name="ellipse-outline" size={28} color="#6b7280" />
            )}
          </TouchableOpacity>

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                task.status === TaskStatus.COMPLETED && styles.completedText,
              ]}
            >
              {task.title}
            </Text>
            {task.description && (
              <Text style={styles.description}>{task.description}</Text>
            )}
            {task.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{task.category}</Text>
              </View>
            )}
          </View>
        </View>

        {task.status === TaskStatus.PENDING && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  completedContainer: {
    opacity: 0.6,
    backgroundColor: '#111827',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#374151',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  deleteButton: {
    padding: 8,
  },
});

export default TaskCard;