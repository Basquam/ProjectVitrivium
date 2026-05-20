import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { getStats, getAchievements } from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useApp } from '../../src/contexts/AppContext';
import { getTheme, GLOBAL_THEME, DEFAULT_THEME } from '../../src/theme';
import ParallaxHero from '../../src/components/ParallaxHero';

export default function ProfileScreen() {
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { activeStory } = useApp();

  const theme = activeStory?.has_active_story ? getTheme(activeStory.story?.theme) : DEFAULT_THEME;

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    try {
      const [statsData, achData] = await Promise.all([getStats(), getAchievements()]);
      setStats(statsData);
      setAchievements(achData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GLOBAL_THEME.gold} />
      </View>
    );
  }

  const heroTitle = stats?.total_stories_completed > 0 ? 'LEGEND' : 
                    stats?.total_badges > 5 ? 'CHAMPION' :
                    stats?.total_badges > 2 ? 'WARRIOR' :
                    stats?.total_tasks_completed > 0 ? 'SEEKER' : 'NOVICE';

  return (
    <View style={styles.root} testID="profile-screen">
      {/* Cinematic hero background with parallax */}
      <ParallaxHero
        imageUrl={theme.imageUrl}
        tintColor={theme.tintOverlay}
        height={320}
        intensity={Math.max(12, theme.motionIntensity - 8)}
        fadeToBackground
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
        >
          {/* Hero Banner */}
          <Animated.View entering={FadeIn.duration(500)} style={styles.heroBanner}>
            <View style={[styles.avatarRing, { borderColor: theme.primary }]}>
              <View style={[styles.avatar, { backgroundColor: theme.tintOverlay }]}>
                <Text style={styles.avatarEmoji}>{theme.emoji}</Text>
              </View>
            </View>
            <Text style={[styles.heroLabel, { color: theme.primary }]}>YOUR TITLE</Text>
            <Text style={[styles.heroName, { fontFamily: theme.fontFamily }]}>{heroTitle}</Text>
            <View style={styles.heroLine} />
            <Text style={styles.heroSubtitle}>
              {stats?.total_points || 0} XP • {stats?.total_badges || 0} BADGES
            </Text>
          </Animated.View>

          {/* Streak Card - Featured */}
          {stats?.current_streak > 0 && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
              <LinearGradient
                colors={['#fb923c', '#c2410c']}
                style={styles.streakCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.streakFire}>
                  <Text style={styles.streakFireEmoji}>🔥</Text>
                </View>
                <View style={styles.streakInfo}>
                  <Text style={styles.streakDays}>{stats.current_streak}</Text>
                  <Text style={styles.streakDaysLabel}>DAY STREAK</Text>
                  <Text style={styles.streakBest}>
                    Best: {stats.longest_streak} days
                  </Text>
                </View>
                <View style={styles.streakMeta}>
                  <Text style={styles.streakMetaText}>
                    {stats.current_streak >= 7 ? '+25 XP bonus active' :
                     stats.current_streak >= 3 ? '+10 XP bonus active' :
                     `${7 - stats.current_streak} days to mega bonus`}
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Stats Grid */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>📊 YOUR LEGEND</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { borderColor: theme.primary + '40' }]}>
                <Ionicons name="trophy" size={26} color={theme.primary} />
                <Text style={[styles.statValue, { color: theme.primary }]}>
                  {stats?.total_points || 0}
                </Text>
                <Text style={styles.statLabel}>TOTAL XP</Text>
              </View>
              <View style={[styles.statCard, { borderColor: theme.primary + '40' }]}>
                <Ionicons name="checkmark-done-circle" size={26} color="#10b981" />
                <Text style={[styles.statValue, { color: '#10b981' }]}>
                  {stats?.total_tasks_completed || 0}
                </Text>
                <Text style={styles.statLabel}>QUESTS DONE</Text>
              </View>
              <View style={[styles.statCard, { borderColor: theme.primary + '40' }]}>
                <Ionicons name="book" size={26} color="#3b82f6" />
                <Text style={[styles.statValue, { color: '#3b82f6' }]}>
                  {stats?.total_stories_completed || 0}
                </Text>
                <Text style={styles.statLabel}>SAGAS WON</Text>
              </View>
              <View style={[styles.statCard, { borderColor: theme.primary + '40' }]}>
                <Ionicons name="ribbon" size={26} color="#8b5cf6" />
                <Text style={[styles.statValue, { color: '#8b5cf6' }]}>
                  {stats?.total_badges || 0}
                </Text>
                <Text style={styles.statLabel}>BADGES</Text>
              </View>
            </View>
          </Animated.View>

          {/* Achievements */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>🎖 BADGES EARNED</Text>
            {achievements?.achievements && achievements.achievements.length > 0 ? (
              <View style={styles.badgesGrid}>
                {achievements.achievements.map((badge: string, index: number) => (
                  <Animated.View 
                    key={index} 
                    entering={FadeIn.delay(500 + index * 100).duration(400)}
                    style={[styles.badgeCard, { borderColor: theme.primary }]}
                  >
                    <Text style={styles.badgeEmoji}>🎖️</Text>
                    <Text style={styles.badgeName}>{badge}</Text>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  Complete quests to earn legendary badges.
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Motivation */}
          <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.motivationCard}>
            <Text style={styles.motivationEmoji}>⚔️</Text>
            <Text style={[styles.motivationTitle, { color: theme.primary, fontFamily: theme.fontFamily }]}>
              The Path of Legend
            </Text>
            <Text style={styles.motivationText}>
              Every quest conquered is a chapter written.{'\n'}
              Every streak is a sword sharpened.{'\n'}
              Your story is far from over, hero.
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GLOBAL_THEME.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: GLOBAL_THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    overflow: 'hidden',
  },
  heroBgImg: {
    width: '100%',
    height: '100%',
  },
  heroBgTint: {
    ...StyleSheet.absoluteFillObject,
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
  heroBanner: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    padding: 4,
    marginBottom: 16,
  },
  avatar: {
    flex: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 4,
  },
  heroName: {
    fontSize: 42,
    color: GLOBAL_THEME.textPrimary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  heroLine: {
    width: 40,
    height: 2,
    backgroundColor: GLOBAL_THEME.border,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 11,
    color: GLOBAL_THEME.textSecondary,
    fontWeight: '700',
    letterSpacing: 2,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    color: GLOBAL_THEME.textSecondary,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  streakFire: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakFireEmoji: {
    fontSize: 36,
  },
  streakInfo: {
    flex: 1,
  },
  streakDays: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 38,
  },
  streakDaysLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 2,
    opacity: 0.9,
  },
  streakBest: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.7,
    marginTop: 4,
  },
  streakMeta: {
    alignItems: 'flex-end',
  },
  streakMetaText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'right',
    opacity: 0.85,
    maxWidth: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: GLOBAL_THEME.surface,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 9,
    color: GLOBAL_THEME.textSecondary,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeCard: {
    width: '31%',
    backgroundColor: GLOBAL_THEME.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 11,
    color: GLOBAL_THEME.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  emptyCard: {
    backgroundColor: GLOBAL_THEME.surface,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLOBAL_THEME.border,
  },
  emptyText: {
    fontSize: 13,
    color: GLOBAL_THEME.textSecondary,
    textAlign: 'center',
  },
  motivationCard: {
    marginHorizontal: 24,
    backgroundColor: GLOBAL_THEME.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLOBAL_THEME.border,
  },
  motivationEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  motivationTitle: {
    fontSize: 22,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  motivationText: {
    fontSize: 13,
    color: GLOBAL_THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
