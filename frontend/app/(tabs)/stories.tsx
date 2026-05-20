import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStories, startStory, abandonStory, deleteCustomStory } from '../../src/services/api';
import { Story } from '../../src/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../src/contexts/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

export default function StoriesScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { activeStory, refreshAll } = useApp();

  useFocusEffect(
    useCallback(() => {
      loadStories();
      refreshAll();
    }, [])
  );

  const loadStories = async () => {
    try {
      const data = await getStories();
      setStories(data);
    } catch (error) {
      console.error('Error loading stories:', error);
      Alert.alert('Error', 'Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStories(), refreshAll()]);
    setRefreshing(false);
  };

  const handleStartStory = async (storyId: string) => {
    if (activeStory?.has_active_story) {
      Alert.alert(
        'Active Story',
        'You already have an active story. Abandon it first to start a new one.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Start Adventure',
      'Ready to begin this epic journey?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              await startStory(storyId);
              await refreshAll();
              Alert.alert('Success', 'Your adventure begins!');
              router.push('/');
            } catch (error) {
              console.error('Error starting story:', error);
              Alert.alert('Error', 'Failed to start story');
            }
          },
        },
      ]
    );
  };

  const handleAbandonStory = () => {
    Alert.alert(
      'Abandon Story',
      'Are you sure? Your progress will be saved but you cannot continue this story.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Abandon',
          style: 'destructive',
          onPress: async () => {
            try {
              await abandonStory();
              await refreshAll();
              Alert.alert('Done', 'Story abandoned. Pick a new adventure!');
            } catch (error) {
              Alert.alert('Error', 'Failed to abandon story');
            }
          },
        },
      ]
    );
  };

  const handleDeleteCustomStory = (storyId: string) => {
    Alert.alert(
      'Delete Story',
      'Are you sure you want to delete this custom story?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomStory(storyId);
              await loadStories();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete story');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffd700" />
      </View>
    );
  }

  const isCustomStory = (story: Story) => story.id.startsWith('custom-');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Story Library</Text>
          <Text style={styles.headerSubtitle}>
            Choose your adventure
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/create-story')}
          testID="create-custom-story-btn"
        >
          <Ionicons name="add" size={20} color="#0a0a0a" />
          <Text style={styles.createButtonText}>Custom</Text>
        </TouchableOpacity>
      </View>

      {activeStory?.has_active_story && (
        <TouchableOpacity 
          style={styles.abandonBanner}
          onPress={handleAbandonStory}
          testID="abandon-story-btn"
        >
          <Ionicons name="warning" size={16} color="#ef4444" />
          <Text style={styles.abandonText}>
            Currently playing: {activeStory.progress?.story_title}. Tap to abandon.
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffd700" />
        }
      >
        {stories.map((story) => {
          const isActive = activeStory?.has_active_story && activeStory.progress?.story_id === story.id;
          const colors: [string, string] = [story.color_primary || '#2563eb', story.color_secondary || '#1e40af'];

          return (
            <View key={story.id} style={styles.storyCardContainer}>
              <LinearGradient
                colors={colors}
                style={styles.storyCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.storyHeader}>
                  <View style={styles.themeRow}>
                    <Text style={styles.storyIcon}>{story.icon}</Text>
                    <View style={styles.themeTag}>
                      <Text style={styles.themeText}>{story.theme.toUpperCase()}</Text>
                    </View>
                    {isCustomStory(story) && (
                      <View style={styles.customTag}>
                        <Text style={styles.customText}>CUSTOM</Text>
                      </View>
                    )}
                  </View>
                  {isActive && (
                    <View style={styles.activeTag}>
                      <Ionicons name="play-circle" size={16} color="#fff" />
                      <Text style={styles.activeText}>ACTIVE</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.storyTitle}>{story.title}</Text>
                <Text style={styles.storyDescription}>{story.description}</Text>

                <View style={styles.storyStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{story.total_acts}</Text>
                    <Text style={styles.statLabel}>Acts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{story.total_points}</Text>
                    <Text style={styles.statLabel}>Max Points</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {story.acts.reduce((acc, act) => acc + act.beats.length, 0)}
                    </Text>
                    <Text style={styles.statLabel}>Beats</Text>
                  </View>
                </View>

                {isActive ? (
                  <View style={styles.activeButton}>
                    <Text style={styles.activeButtonText}>Currently Playing</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => handleStartStory(story.id)}
                    testID={`start-story-${story.id}`}
                  >
                    <Text style={[styles.startButtonText, { color: story.color_secondary || '#1e40af' }]}>
                      Start Adventure
                    </Text>
                  </TouchableOpacity>
                )}

                {isCustomStory(story) && !isActive && (
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => handleDeleteCustomStory(story.id)}
                  >
                    <Ionicons name="trash" size={16} color="#fff" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </View>
          );
        })}
      </ScrollView>
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
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  createButton: {
    backgroundColor: '#ffd700',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  createButtonText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
    fontSize: 13,
  },
  abandonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7f1d1d',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
  },
  abandonText: {
    color: '#fecaca',
    fontSize: 12,
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  storyCardContainer: {
    marginBottom: 16,
  },
  storyCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storyIcon: {
    fontSize: 28,
  },
  themeTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  themeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  customTag: {
    backgroundColor: '#fbbf24',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  customText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 4,
  },
  activeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  storyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  storyDescription: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.9,
  },
  storyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.7,
    marginTop: 2,
  },
  startButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  activeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    marginTop: 12,
    padding: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
