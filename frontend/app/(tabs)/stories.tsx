import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getStories, startStory, abandonStory, deleteCustomStory } from '../../src/services/api';
import { Story } from '../../src/types';
import { useApp } from '../../src/contexts/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { getTheme, getThemeForCustomStory, GLOBAL_THEME } from '../../src/theme';
import { confirmAction, notify } from '../../src/utils/confirm';
import * as Haptics from 'expo-haptics';
import GlassPanel from '../../src/components/GlassPanel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HEIGHT = 280;

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
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStories(), refreshAll()]);
    setRefreshing(false);
  };

  const isCustomStory = (story: Story) => story.id.startsWith('custom-');

  const handleStartStory = (storyId: string, storyTitle: string) => {
    if (activeStory?.has_active_story) {
      notify(
        'A Story Already Begins',
        `You are mid-adventure in "${activeStory.progress?.story_title}". Abandon it first to start a new tale.`
      );
      return;
    }
    confirmAction(
      'Begin the Adventure?',
      `Ready to step into "${storyTitle}"?`,
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Begin',
          style: 'default',
          onPress: async () => {
            try {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await startStory(storyId);
              await refreshAll();
              router.push('/');
            } catch (error: any) {
              notify('Error', error.response?.data?.detail || 'Could not start adventure');
            }
          },
        },
      ]
    );
  };

  const handleAbandonStory = () => {
    confirmAction(
      'Abandon Your Story?',
      'Your progress will be saved but you cannot continue this tale.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Abandon',
          style: 'destructive',
          onPress: async () => {
            try {
              await abandonStory();
              await refreshAll();
            } catch {
              notify('Error', 'Could not abandon story');
            }
          },
        },
      ]
    );
  };

  const handleDeleteCustomStory = (storyId: string) => {
    confirmAction(
      'Delete Custom Story?',
      'This cannot be undone.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomStory(storyId);
              await loadStories();
            } catch {
              notify('Error', 'Could not delete story');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GLOBAL_THEME.gold} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="stories-screen">
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>WORLDS</Text>
          <Text style={styles.title}>Choose Your Saga</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/create-story')}
          testID="create-custom-story-btn"
        >
          <Ionicons name="create" size={16} color="#0A0A0A" />
          <Text style={styles.createButtonText}>FORGE</Text>
        </TouchableOpacity>
      </View>

      {activeStory?.has_active_story && (
        <TouchableOpacity
          style={styles.abandonBanner}
          onPress={handleAbandonStory}
          testID="abandon-story-btn"
        >
          <Ionicons name="warning" size={14} color="#fca5a5" />
          <Text style={styles.abandonText}>
            Currently in <Text style={styles.abandonHighlight}>{activeStory.progress?.story_title}</Text> — tap to abandon
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GLOBAL_THEME.gold} />
        }
        showsVerticalScrollIndicator={false}
      >
        {stories.map((story, idx) => {
          const isActive = activeStory?.has_active_story && activeStory.progress?.story_id === story.id;
          const isCustom = isCustomStory(story);
          // Use built-in theme for built-in stories, mapped theme for custom
          const theme = isCustom ? getThemeForCustomStory(story.theme) : getTheme(story.theme);

          return (
            <Animated.View
              key={story.id}
              entering={FadeInDown.delay(idx * 80).duration(500)}
              style={styles.storyCardWrap}
            >
              <View style={styles.storyCard}>
                {/* Background image */}
                <Image
                  source={{ uri: theme.imageUrl }}
                  style={styles.storyBg}
                  contentFit="cover"
                  transition={300}
                />
                {/* Color tint */}
                <View style={[styles.storyTint, { backgroundColor: theme.tintOverlay }]} />
                {/* Dark gradient for legibility */}
                <LinearGradient
                  colors={['rgba(10,10,10,0.2)', 'rgba(10,10,10,0.7)', 'rgba(10,10,10,0.95)']}
                  locations={[0, 0.5, 1]}
                  style={StyleSheet.absoluteFillObject}
                />

                {/* Top tags */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.themeTag, { borderColor: theme.primary }]}>
                    <Text style={[styles.themeTagText, { color: theme.primary }]}>
                      {story.theme.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.cardTopRight}>
                    {isCustom && (
                      <View style={styles.customTag}>
                        <Ionicons name="sparkles" size={10} color="#0A0A0A" />
                        <Text style={styles.customTagText}>CUSTOM</Text>
                      </View>
                    )}
                    {isActive && (
                      <View style={[styles.activeTag, { backgroundColor: theme.primary }]}>
                        <View style={styles.activeDot} />
                        <Text style={styles.activeTagText}>ACTIVE</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Bottom info */}
                <View style={styles.cardBody}>
                  <Text style={styles.cardIcon}>{story.icon || theme.emoji}</Text>
                  <Text style={[styles.cardTitle, { fontFamily: theme.fontFamily }]}>
                    {story.title}
                  </Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {story.description}
                  </Text>
                  
                  <View style={styles.cardStats}>
                    <View style={styles.statCol}>
                      <Text style={[styles.statValue, { color: theme.primary }]}>{story.total_acts}</Text>
                      <Text style={styles.statLabel}>ACTS</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statCol}>
                      <Text style={[styles.statValue, { color: theme.primary }]}>{story.total_points}</Text>
                      <Text style={styles.statLabel}>MAX XP</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statCol}>
                      <Text style={[styles.statValue, { color: theme.primary }]}>
                        {story.acts.reduce((acc, act) => acc + act.beats.length, 0)}
                      </Text>
                      <Text style={styles.statLabel}>BEATS</Text>
                    </View>
                  </View>

                  {isActive ? (
                    <View style={[styles.actionButton, styles.activeButton, { borderColor: theme.primary }]}>
                      <Ionicons name="play-circle" size={16} color={theme.primary} />
                      <Text style={[styles.actionText, { color: theme.primary }]}>
                        IN PROGRESS
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.primary }]}
                      onPress={() => handleStartStory(story.id, story.title)}
                      testID={`start-story-${story.id}`}
                    >
                      <Text style={styles.actionTextPrimary}>BEGIN ADVENTURE</Text>
                      <Ionicons name="arrow-forward" size={16} color="#0A0A0A" />
                    </TouchableOpacity>
                  )}

                  {isCustom && !isActive && (
                    <TouchableOpacity
                      style={styles.deleteCustom}
                      onPress={() => handleDeleteCustomStory(story.id)}
                      testID={`delete-custom-${story.id}`}
                    >
                      <Ionicons name="trash-outline" size={14} color={GLOBAL_THEME.textMuted} />
                      <Text style={styles.deleteCustomText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBAL_THEME.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: GLOBAL_THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    fontSize: 32,
    color: GLOBAL_THEME.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GLOBAL_THEME.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  createButtonText: {
    color: '#0A0A0A',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  abandonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderColor: 'rgba(220, 38, 38, 0.4)',
    borderWidth: 1,
    marginHorizontal: 24,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  abandonText: {
    color: '#fca5a5',
    fontSize: 12,
    flex: 1,
  },
  abandonHighlight: {
    fontWeight: '700',
    color: '#fecaca',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  storyCardWrap: {
    marginBottom: 16,
  },
  storyCard: {
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: GLOBAL_THEME.surface,
  },
  storyBg: {
    ...StyleSheet.absoluteFillObject,
  },
  storyTint: {
    ...StyleSheet.absoluteFillObject,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  cardTopRight: {
    flexDirection: 'row',
    gap: 8,
  },
  themeTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  themeTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  customTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: GLOBAL_THEME.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  customTagText: {
    color: '#0A0A0A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0A0A0A',
  },
  activeTagText: {
    color: '#0A0A0A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardBody: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
  },
  cardIcon: {
    fontSize: 30,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 26,
    color: '#fff',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  cardDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginBottom: 14,
  },
  cardStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 999,
  },
  activeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  actionTextPrimary: {
    color: '#0A0A0A',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  actionText: {
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  deleteCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
    paddingVertical: 6,
  },
  deleteCustomText: {
    color: GLOBAL_THEME.textMuted,
    fontSize: 11,
  },
});
