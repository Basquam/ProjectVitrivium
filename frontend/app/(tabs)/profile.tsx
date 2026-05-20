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
import { getStats, getAchievements } from '../../src/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

export default function ProfileScreen() {
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [statsData, achievementsData] = await Promise.all([
        getStats(),
        getAchievements(),
      ]);
      setStats(statsData);
      setAchievements(achievementsData);
    } catch (error) {
      console.error('Error loading profile data:', error);
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
        <ActivityIndicator size="large" color="#ffd700" />
      </View>
    );
  }

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
        <LinearGradient
          colors={['#1e40af', '#3b82f6']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={48} color="#fff" />
          </View>
          <Text style={styles.username}>Quest Hero</Text>
          <Text style={styles.title}>Task Warrior</Text>
        </LinearGradient>

        {/* Streak Card */}
        {stats?.current_streak > 0 && (
          <View style={styles.section}>
            <LinearGradient
              colors={['#fb923c', '#c2410c']}
              style={styles.streakCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.streakEmoji}>🔥</Text>
              <View style={styles.streakContent}>
                <Text style={styles.streakValue}>{stats.current_streak} Days</Text>
                <Text style={styles.streakLabel}>Current Streak</Text>
                <Text style={styles.streakLongest}>
                  Longest: {stats.longest_streak} days
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={32} color="#ffd700" />
              <Text style={styles.statValue}>{stats?.total_points || 0}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-done" size={32} color="#10b981" />
              <Text style={styles.statValue}>{stats?.total_tasks_completed || 0}</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="book" size={32} color="#3b82f6" />
              <Text style={styles.statValue}>{stats?.total_stories_completed || 0}</Text>
              <Text style={styles.statLabel}>Stories</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="ribbon" size={32} color="#8b5cf6" />
              <Text style={styles.statValue}>{stats?.total_badges || 0}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Achievements</Text>
          {achievements?.achievements && achievements.achievements.length > 0 ? (
            <View style={styles.badgesContainer}>
              {achievements.achievements.map((badge: string, index: number) => (
                <View key={index} style={styles.badgeCard}>
                  <Text style={styles.badgeEmoji}>🎖️</Text>
                  <Text style={styles.badgeName}>{badge}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Complete tasks to earn your first badge!
              </Text>
            </View>
          )}
        </View>

        {/* Motivational Section */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>💪</Text>
          <Text style={styles.motivationTitle}>Keep Going, Hero!</Text>
          <Text style={styles.motivationText}>
            Every task you complete brings you closer to becoming a legend. Your journey has just begun!
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
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#fff',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    color: '#f3f4f6',
    textAlign: 'center',
    fontWeight: '600',
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
    textAlign: 'center',
  },
  motivationCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  motivationEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  streakEmoji: {
    fontSize: 48,
  },
  streakContent: {
    flex: 1,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  streakLongest: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
    marginTop: 4,
  },
});