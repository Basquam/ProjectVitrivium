import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/contexts/AppContext';
import StoryBeatCard from '../../src/components/StoryBeatCard';
import TaskCard from '../../src/components/TaskCard';
import VictoryModal from '../../src/components/VictoryModal';
import { completeTask, deleteTask } from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TaskStatus } from '../../src/types';

export default function HomeScreen() {
  const { activeStory, todayTasks, loading, refreshAll } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [victoryModalVisible, setVictoryModalVisible] = useState(false);
  const [victoryData, setVictoryData] = useState<any>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await completeTask(taskId);
      
      // Show victory modal if there's victory data
      if (response.victory) {
        setVictoryData(response.victory);
        setVictoryModalVisible(true);
      }
      
      // Refresh data
      await refreshAll();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      await refreshAll();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCloseVictory = () => {
    setVictoryModalVisible(false);
    setVictoryData(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffd700" />
      </View>
    );
  }

  const pendingTasks = todayTasks.filter(t => t.status === TaskStatus.PENDING);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quest Hero</Text>
          <Text style={styles.headerSubtitle}>Transform Tasks into Adventures</Text>
        </View>

        {/* Active Story Section */}
        {activeStory?.has_active_story ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📖 Your Current Story</Text>
              <Text style={styles.progressText}>
                {activeStory.progress_percentage?.toFixed(0)}% Complete
              </Text>
            </View>
            
            <View style={styles.storyCard}>
              <Text style={styles.storyTitle}>{activeStory.story?.title}</Text>
              <Text style={styles.storyAct}>
                Act {activeStory.progress?.current_act} of {activeStory.story?.total_acts}
              </Text>
              
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${activeStory.progress_percentage}%` },
                  ]}
                />
              </View>

              {/* Current Beat */}
              {activeStory.current_beat && (
                <View style={styles.currentBeatContainer}>
                  <StoryBeatCard beat={activeStory.current_beat} />
                </View>
              )}

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{activeStory.progress?.total_points}</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{activeStory.progress?.tasks_completed}</Text>
                  <Text style={styles.statLabel}>Tasks Done</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{activeStory.progress?.rewards_earned.length}</Text>
                  <Text style={styles.statLabel}>Badges</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.noStoryCard}>
              <Text style={styles.noStoryEmoji}>🏰</Text>
              <Text style={styles.noStoryTitle}>No Active Story</Text>
              <Text style={styles.noStoryText}>
                Start an epic adventure to make your tasks meaningful!
              </Text>
              <TouchableOpacity
                style={styles.startStoryButton}
                onPress={() => router.push('/stories')}
              >
                <Text style={styles.startStoryButtonText}>Browse Stories</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Today's Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✔️ Today's Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/tasks')}>
              <Ionicons name="add-circle" size={28} color="#ffd700" />
            </TouchableOpacity>
          </View>

          {pendingTasks.length === 0 ? (
            <View style={styles.emptyTasksCard}>
              <Text style={styles.emptyTasksEmoji}>🎉</Text>
              <Text style={styles.emptyTasksText}>
                No pending tasks! Add some to continue your adventure.
              </Text>
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
      </ScrollView>

      {/* Victory Modal */}
      {victoryData && (
        <VictoryModal
          visible={victoryModalVisible}
          victoryText={victoryData.victory_text}
          pointsEarned={victoryData.points_earned}
          badgeEarned={victoryData.badge_earned}
          onClose={handleCloseVictory}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f3f4f6',
  },
  progressText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  storyCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 4,
  },
  storyAct: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffd700',
  },
  currentBeatContainer: {
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  noStoryCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  noStoryEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  noStoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginBottom: 8,
  },
  noStoryText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  startStoryButton: {
    backgroundColor: '#ffd700',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  startStoryButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyTasksCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  emptyTasksEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTasksText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});