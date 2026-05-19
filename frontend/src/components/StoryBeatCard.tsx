import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StoryBeat, BeatType } from '../types';
import { LinearGradient } from 'expo-linear-gradient';

interface StoryBeatCardProps {
  beat: StoryBeat;
}

const StoryBeatCard: React.FC<StoryBeatCardProps> = ({ beat }) => {
  const getBeatColor = (type: BeatType) => {
    switch (type) {
      case BeatType.INTRO:
        return ['#3b82f6', '#1e40af'];
      case BeatType.CHALLENGE:
        return ['#ef4444', '#991b1b'];
      case BeatType.VICTORY:
        return ['#10b981', '#047857'];
      case BeatType.PLOT_TWIST:
        return ['#8b5cf6', '#5b21b6'];
      case BeatType.FINALE:
        return ['#fbbf24', '#b45309'];
      default:
        return ['#6b7280', '#374151'];
    }
  };

  const getBeatLabel = (type: BeatType) => {
    switch (type) {
      case BeatType.INTRO:
        return 'INTRODUCTION';
      case BeatType.CHALLENGE:
        return '⚔️ CHALLENGE';
      case BeatType.VICTORY:
        return '✨ VICTORY';
      case BeatType.PLOT_TWIST:
        return '🌀 PLOT TWIST';
      case BeatType.FINALE:
        return '👑 FINALE';
      default:
        return 'STORY';
    }
  };

  return (
    <LinearGradient
      colors={getBeatColor(beat.type)}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.beatLabel}>{getBeatLabel(beat.type)}</Text>
        {beat.villain_name && (
          <Text style={styles.villainName}>VS {beat.villain_name}</Text>
        )}
      </View>

      {beat.image_url && (
        <Text style={styles.imageEmoji}>{beat.image_url}</Text>
      )}

      <Text style={styles.title}>{beat.title}</Text>
      <Text style={styles.text}>{beat.text}</Text>

      {beat.reward_points > 0 && (
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardText}>+{beat.reward_points} points</Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  beatLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    opacity: 0.9,
  },
  villainName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imageEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
    opacity: 0.95,
  },
  rewardContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  rewardText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default StoryBeatCard;