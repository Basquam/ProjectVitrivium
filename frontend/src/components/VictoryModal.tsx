import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { GLOBAL_THEME } from '../theme';

interface VictoryModalProps {
  visible: boolean;
  victoryText: string;
  pointsEarned: number;
  streakBonus?: number;
  badgeEarned?: string;
  villainName?: string;
  themeColor?: string;
  themeFont?: string;
  onClose: () => void;
}

const VictoryModal: React.FC<VictoryModalProps> = ({
  visible,
  victoryText,
  pointsEarned,
  streakBonus = 0,
  badgeEarned,
  villainName,
  themeColor = GLOBAL_THEME.gold,
  themeFont,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      setTimeout(() => {
        confettiRef.current?.start();
      }, 200);
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const totalPoints = pointsEarned + streakBonus;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.modalContent,
            { 
              transform: [{ scale: scaleAnim }],
              borderColor: themeColor,
            },
          ]}
        >
          {/* Glow effect */}
          <View style={[styles.glow, { backgroundColor: themeColor, opacity: 0.15 }]} />
          
          <Text style={styles.emoji}>⚔️</Text>
          <Text style={[styles.title, themeFont ? { fontFamily: themeFont } : null, { color: themeColor }]}>
            VICTORY
          </Text>
          
          {villainName && (
            <View style={[styles.villainBox, { borderColor: themeColor }]}>
              <Text style={styles.villainLabel}>DEFEATED</Text>
              <Text style={styles.villainName}>{villainName}</Text>
            </View>
          )}
          
          <View style={styles.pointsRow}>
            <Text style={[styles.pointsText, { color: themeColor }]}>+{totalPoints}</Text>
            <Text style={styles.pointsLabel}>XP</Text>
          </View>
          
          {streakBonus > 0 && (
            <View style={styles.streakBonusBox}>
              <Text style={styles.streakBonusText}>
                🔥 +{streakBonus} streak bonus
              </Text>
            </View>
          )}

          {badgeEarned && (
            <View style={[styles.badgeContainer, { borderColor: themeColor }]}>
              <Text style={styles.badgeEmoji}>🎖️</Text>
              <View>
                <Text style={styles.badgeLabel}>BADGE UNLOCKED</Text>
                <Text style={[styles.badgeName, { color: themeColor }]}>{badgeEarned}</Text>
              </View>
            </View>
          )}

          <Text style={styles.victoryText}>{victoryText}</Text>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: themeColor }]}
            onPress={onClose}
            testID="victory-continue-btn"
          >
            <Text style={styles.buttonText}>CONTINUE THE STORY</Text>
          </TouchableOpacity>
        </Animated.View>

        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: Dimensions.get('window').width / 2, y: -10 }}
          autoStart={false}
          fadeOut
          colors={[themeColor, '#fff', GLOBAL_THEME.gold]}
        />
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#101010',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 4,
  },
  villainBox: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  villainLabel: {
    fontSize: 10,
    color: GLOBAL_THEME.textSecondary,
    fontWeight: '800',
    letterSpacing: 2,
  },
  villainName: {
    fontSize: 16,
    color: GLOBAL_THEME.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 8,
  },
  pointsText: {
    fontSize: 56,
    fontWeight: '900',
  },
  pointsLabel: {
    fontSize: 14,
    color: GLOBAL_THEME.textSecondary,
    fontWeight: '700',
    letterSpacing: 2,
  },
  streakBonusBox: {
    marginBottom: 16,
  },
  streakBonusText: {
    color: '#fb923c',
    fontWeight: '700',
    fontSize: 13,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  badgeEmoji: {
    fontSize: 32,
  },
  badgeLabel: {
    fontSize: 9,
    color: GLOBAL_THEME.textSecondary,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '800',
  },
  victoryText: {
    fontSize: 14,
    color: GLOBAL_THEME.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    opacity: 0.9,
    fontStyle: 'italic',
  },
  button: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
  },
  buttonText: {
    color: '#0A0A0A',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
  },
});

export default VictoryModal;
