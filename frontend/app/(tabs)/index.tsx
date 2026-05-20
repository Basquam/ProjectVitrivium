import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeIn, FadeInUp } from 'react-native-reanimated';
import { useApp } from '../../src/contexts/AppContext';
import VictoryModal from '../../src/components/VictoryModal';
import QuestCard from '../../src/components/QuestCard';
import JourneyMap from '../../src/components/JourneyMap';
import GlassPanel from '../../src/components/GlassPanel';
import ParallaxHero from '../../src/components/ParallaxHero';
import { completeTask, deleteTask } from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { TaskStatus, BeatType } from '../../src/types';
import { getTheme, GLOBAL_THEME, DEFAULT_THEME } from '../../src/theme';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.45;

export default function HomeScreen() {
  const { activeStory, todayTasks, streak, loading, refreshAll } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [victoryModalVisible, setVictoryModalVisible] = useState(false);
  const [victoryData, setVictoryData] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      const response = await completeTask(taskId);
      if (response.victory) {
        setVictoryData(response.victory);
        setVictoryModalVisible(true);
      }
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GLOBAL_THEME.gold} />
      </View>
    );
  }

  const pendingTasks = todayTasks.filter(t => t.status === TaskStatus.PENDING);
  const completedToday = todayTasks.filter(t => t.status === TaskStatus.COMPLETED);
  const hasStory = activeStory?.has_active_story;
  const theme = hasStory ? getTheme(activeStory.story?.theme) : DEFAULT_THEME;
  const currentBeat = activeStory?.current_beat;

  return (
    <View style={styles.root} testID="home-screen">
      {/* CINEMATIC HERO with GYROSCOPE PARALLAX */}
      <ParallaxHero
        imageUrl={theme.imageUrl}
        tintColor={theme.tintOverlay}
        height={HERO_HEIGHT}
        intensity={28}
        fadeToBackground
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar: Streak badge */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <Text style={[styles.kicker, { color: theme.primary }]}>
                {hasStory ? `ACT ${activeStory.progress?.current_act} • ${theme.name.toUpperCase()}` : 'CHOOSE YOUR ADVENTURE'}
              </Text>
            </View>
            {streak && streak.current_streak > 0 && (
              <GlassPanel
                style={styles.streakBadge}
                borderColor="rgba(251, 146, 60, 0.5)"
                testID="streak-badge"
              >
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakNumber}>{streak.current_streak}</Text>
              </GlassPanel>
            )}
          </Animated.View>

          {hasStory ? (
            <>
              {/* STORY TITLE */}
              <Animated.View entering={FadeInDown.delay(100).duration(700)} style={styles.titleBlock}>
                <Text style={[styles.storyTitle, { fontFamily: theme.fontFamily }]}>
                  {activeStory.story?.title}
                </Text>
                <View style={styles.titleUnderline}>
                  <View style={[styles.titleUnderlineFill, { backgroundColor: theme.primary, width: `${activeStory.progress_percentage || 0}%` }]} />
                </View>
                <Text style={styles.progressLabel}>
                  {activeStory.progress_percentage?.toFixed(0)}% COMPLETE
                </Text>
              </Animated.View>

              {/* CURRENT BEAT - DRAMATIC REVEAL */}
              {currentBeat && (
                <Animated.View 
                  entering={FadeInUp.delay(300).duration(800).springify()} 
                  style={styles.beatSection}
                >
                  <GlassPanel
                    intensity={40}
                    borderColor={theme.primary}
                    style={styles.beatPanel}
                  >
                    {/* Beat type ribbon */}
                    <View style={[styles.beatRibbon, { backgroundColor: theme.primary }]}>
                      <Text style={styles.beatRibbonText}>
                        {getBeatLabel(currentBeat.type)}
                      </Text>
                      {currentBeat.villain_name ? (
                        <Text style={styles.villainTag}>
                          ⚔ {currentBeat.villain_name}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.beatBody}>
                      <Text style={styles.beatEmoji}>{currentBeat.image_url}</Text>
                      <Text style={[styles.beatTitle, { fontFamily: theme.fontFamily }]}>
                        {currentBeat.title}
                      </Text>
                      <Text style={styles.beatText}>{currentBeat.text}</Text>
                      
                      {currentBeat.reward_points > 0 && (
                        <View style={[styles.rewardChip, { borderColor: theme.primary }]}>
                          <Ionicons name="trophy" size={14} color={theme.primary} />
                          <Text style={[styles.rewardChipText, { color: theme.primary }]}>
                            +{currentBeat.reward_points} XP
                            {currentBeat.reward_badge ? ` • 🎖 ${currentBeat.reward_badge}` : ''}
                          </Text>
                        </View>
                      )}
                    </View>
                  </GlassPanel>
                </Animated.View>
              )}

              {/* HERO STATS */}
              <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: theme.primary }]}>
                    {activeStory.progress?.total_points || 0}
                  </Text>
                  <Text style={styles.statLabel}>XP EARNED</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: theme.primary }]}>
                    {activeStory.progress?.tasks_completed || 0}
                  </Text>
                  <Text style={styles.statLabel}>QUESTS DONE</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: theme.primary }]}>
                    {activeStory.progress?.rewards_earned.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>BADGES</Text>
                </View>
              </Animated.View>

              {/* JOURNEY MAP */}
              {activeStory.story && (
                <Animated.View entering={FadeInUp.delay(700).duration(600)} style={styles.section}>
                  <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily }]}>
                    Your Journey
                  </Text>
                  <JourneyMap 
                    story={activeStory.story} 
                    currentAct={activeStory.progress?.current_act || 1}
                    currentBeat={activeStory.progress?.current_beat || 0}
                    themeColor={theme.primary}
                  />
                </Animated.View>
              )}
            </>
          ) : (
            // NO STORY - CALL TO ADVENTURE
            <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.noStorySection}>
              <Text style={[styles.heroTitle, { fontFamily: theme.fontFamily }]}>
                QUEST HERO
              </Text>
              <Text style={styles.heroSubtitle}>
                Transform your tasks into legendary tales
              </Text>
              <TouchableOpacity
                style={[styles.ctaButton, { borderColor: theme.primary }]}
                onPress={() => router.push('/stories')}
                testID="browse-stories-btn"
              >
                <Text style={[styles.ctaText, { color: theme.primary }]}>
                  CHOOSE YOUR ADVENTURE
                </Text>
                <Ionicons name="arrow-forward" size={18} color={theme.primary} />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* TODAY'S QUESTS */}
          <Animated.View entering={FadeInUp.delay(800).duration(600)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontFamily: theme.fontFamily }]}>
                Today's Quests
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/tasks')}
                style={styles.addBtn}
                testID="add-task-shortcut"
              >
                <Ionicons name="add" size={20} color={theme.primary} />
                <Text style={[styles.addBtnText, { color: theme.primary }]}>NEW</Text>
              </TouchableOpacity>
            </View>

            {pendingTasks.length === 0 && completedToday.length === 0 ? (
              <GlassPanel style={styles.emptyState} borderColor={GLOBAL_THEME.border}>
                <Text style={styles.emptyEmoji}>📜</Text>
                <Text style={styles.emptyText}>
                  No quests for today. Forge new ones to continue your saga.
                </Text>
              </GlassPanel>
            ) : (
              <>
                {pendingTasks.map((task, idx) => (
                  <Animated.View key={task.id} entering={FadeInDown.delay(900 + idx * 80).duration(500)}>
                    <QuestCard
                      task={task}
                      onComplete={handleCompleteTask}
                      onDelete={handleDeleteTask}
                      themeColor={theme.primary}
                    />
                  </Animated.View>
                ))}
                {completedToday.length > 0 && (
                  <>
                    <Text style={styles.completedLabel}>✓ Conquered Today</Text>
                    {completedToday.map((task) => (
                      <QuestCard
                        key={task.id}
                        task={task}
                        onComplete={handleCompleteTask}
                        onDelete={handleDeleteTask}
                        themeColor={theme.primary}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

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
    </View>
  );
}

function getBeatLabel(type: BeatType | string) {
  switch (type) {
    case BeatType.INTRO: return 'CHAPTER OPENS';
    case BeatType.CHALLENGE: return 'CHALLENGE';
    case BeatType.VICTORY: return 'VICTORY';
    case BeatType.PLOT_TWIST: return 'PLOT TWIST';
    case BeatType.FINALE: return 'FINALE';
    default: return 'STORY';
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GLOBAL_THEME.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GLOBAL_THEME.background,
  },
  heroContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTint: {
    ...StyleSheet.absoluteFillObject,
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_HEIGHT,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  topBarLeft: {
    flex: 1,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    borderRadius: 999,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakNumber: {
    color: '#fb923c',
    fontWeight: 'bold',
    fontSize: 14,
  },
  titleBlock: {
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 16,
  },
  storyTitle: {
    fontSize: 38,
    color: GLOBAL_THEME.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  titleUnderline: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    marginTop: 12,
    overflow: 'hidden',
  },
  titleUnderlineFill: {
    height: '100%',
  },
  progressLabel: {
    fontSize: 10,
    color: GLOBAL_THEME.textSecondary,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 6,
  },
  beatSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  beatPanel: {
    overflow: 'hidden',
  },
  beatRibbon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  beatRibbonText: {
    color: '#0A0A0A',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 2,
  },
  villainTag: {
    color: '#0A0A0A',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  beatBody: {
    padding: 20,
  },
  beatEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  beatTitle: {
    fontSize: 24,
    color: GLOBAL_THEME.textPrimary,
    marginBottom: 8,
    lineHeight: 30,
  },
  beatText: {
    fontSize: 15,
    color: GLOBAL_THEME.textPrimary,
    lineHeight: 23,
    opacity: 0.92,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  rewardChipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: GLOBAL_THEME.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: GLOBAL_THEME.border,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 9,
    color: GLOBAL_THEME.textSecondary,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    color: GLOBAL_THEME.textPrimary,
    letterSpacing: -0.3,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(244, 196, 48, 0.4)',
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  noStorySection: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 56,
    color: GLOBAL_THEME.textPrimary,
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: GLOBAL_THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: GLOBAL_THEME.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  completedLabel: {
    fontSize: 11,
    color: GLOBAL_THEME.textMuted,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 16,
    marginBottom: 8,
  },
});
