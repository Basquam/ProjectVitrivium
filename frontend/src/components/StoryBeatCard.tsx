import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { StoryBeat, BeatType } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { getVillainImage, generateVillainImage } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

interface StoryBeatCardProps {
  beat: StoryBeat;
  enableAIImage?: boolean;
}

const StoryBeatCard: React.FC<StoryBeatCardProps> = ({ beat, enableAIImage = false }) => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    // Load cached image if villain exists
    if (beat.villain_name) {
      loadCachedImage();
    } else {
      setImageData(null);
    }
  }, [beat.villain_name]);

  const loadCachedImage = async () => {
    try {
      const data = await getVillainImage(beat.villain_name);
      if (data.image_data) {
        setImageData(data.image_data);
      }
    } catch (error) {
      console.error('Failed to load villain image:', error);
    }
  };

  const handleGenerateImage = async () => {
    if (!beat.villain_name || !beat.image_prompt) return;
    setLoadingImage(true);
    try {
      const data = await generateVillainImage(beat.villain_name, beat.image_prompt);
      if (data.image_data) {
        setImageData(data.image_data);
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setLoadingImage(false);
    }
  };

  const getBeatColor = (type: BeatType): [string, string] => {
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

      {/* AI Image or Emoji */}
      {imageData ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageData }} style={styles.villainImage} />
        </View>
      ) : beat.image_url ? (
        <View style={styles.emojiContainer}>
          <Text style={styles.imageEmoji}>{beat.image_url}</Text>
          {enableAIImage && beat.villain_name && beat.image_prompt && (
            <TouchableOpacity 
              style={styles.aiButton} 
              onPress={handleGenerateImage}
              disabled={loadingImage}
              testID="generate-villain-image-btn"
            >
              {loadingImage ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={14} color="#fff" />
                  <Text style={styles.aiButtonText}>Generate AI Image</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      <Text style={styles.title}>{beat.title}</Text>
      <Text style={styles.text}>{beat.text}</Text>

      {beat.reward_points > 0 && (
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardText}>+{beat.reward_points} points</Text>
          {beat.reward_badge ? (
            <Text style={styles.badgeReward}>🎖️ {beat.reward_badge}</Text>
          ) : null}
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
  imageContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  villainImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  emojiContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  imageEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
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
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  rewardText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeReward: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default StoryBeatCard;
