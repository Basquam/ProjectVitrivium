import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStories, startStory } from '../../src/services/api';
import { Story } from '../../src/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../src/contexts/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function StoriesScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeStory, refreshAll } = useApp();

  useEffect(() => {
    loadStories();
  }, []);

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

  const handleStartStory = async (storyId: string) => {
    if (activeStory?.has_active_story) {
      Alert.alert(
        'Active Story',
        'You already have an active story. Complete it first before starting a new one!',
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
            } catch (error) {
              console.error('Error starting story:', error);
              Alert.alert('Error', 'Failed to start story');
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Story Library</Text>
        <Text style={styles.headerSubtitle}>
          Choose your adventure and transform tasks into epic quests
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {stories.map((story) => (
          <View key={story.id} style={styles.storyCardContainer}>
            <LinearGradient
              colors={['#2563eb', '#1e40af']}
              style={styles.storyCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.storyHeader}>
                <View style={styles.themeTag}>
                  <Text style={styles.themeText}>{story.theme.toUpperCase()}</Text>
                </View>
                {activeStory?.has_active_story && activeStory.progress?.story_id === story.id && (
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
                  <Text style={styles.statLabel}>Story Beats</Text>
                </View>
              </View>

              {activeStory?.has_active_story && activeStory.progress?.story_id === story.id ? (
                <View style={styles.activeButton}>
                  <Text style={styles.activeButtonText}>Currently Playing</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => handleStartStory(story.id)}
                  disabled={activeStory?.has_active_story}
                >
                  <Text style={styles.startButtonText}>
                    {activeStory?.has_active_story ? 'Complete Current Story First' : 'Start Adventure'}
                  </Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        ))}

        {/* Coming Soon Section */}
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonEmoji}>🚧</Text>
          <Text style={styles.comingSoonTitle}>More Stories Coming Soon!</Text>
          <Text style={styles.comingSoonText}>
            Custom story creation and AI-generated adventures will be available in the next update.
          </Text>
        </View>
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  storyDescription: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.9,
  },
  storyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
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
    color: '#1e40af',
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
  comingSoonCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#374151',
    borderStyle: 'dashed',
  },
  comingSoonEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});