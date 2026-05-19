import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

interface VictoryModalProps {
  visible: boolean;
  victoryText: string;
  pointsEarned: number;
  badgeEarned?: string;
  onClose: () => void;
}

const VictoryModal: React.FC<VictoryModalProps> = ({
  visible,
  victoryText,
  pointsEarned,
  badgeEarned,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
      
      // Trigger confetti
      setTimeout(() => {
        confettiRef.current?.start();
      }, 100);
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>VICTORY!</Text>
          
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>+{pointsEarned}</Text>
            <Text style={styles.pointsLabel}>POINTS</Text>
          </View>

          {badgeEarned && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeEmoji}>🎖️</Text>
              <Text style={styles.badgeText}>{badgeEarned}</Text>
            </View>
          )}

          <Text style={styles.victoryText}>{victoryText}</Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Continue Your Journey</Text>
          </TouchableOpacity>
        </Animated.View>

        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: Dimensions.get('window').width / 2, y: -10 }}
          autoStart={false}
          fadeOut
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 24,
    textAlign: 'center',
  },
  pointsContainer: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
  },
  pointsText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  badgeEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbbf24',
  },
  victoryText: {
    fontSize: 16,
    color: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#ffd700',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
  },
  buttonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default VictoryModal;