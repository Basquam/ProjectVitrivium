import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Story, BeatType } from '../types';
import { GLOBAL_THEME } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface JourneyMapProps {
  story: Story;
  currentAct: number;
  currentBeat: number;
  themeColor: string;
}

const beatTypeIcon: Record<string, string> = {
  intro: 'flag',
  challenge: 'flash',
  victory: 'trophy',
  plot_twist: 'sparkles',
  finale: 'crown',
};

const JourneyMap: React.FC<JourneyMapProps> = ({ story, currentAct, currentBeat, themeColor }) => {
  let beatIdx = 0;

  return (
    <View style={styles.container}>
      {story.acts.map((act, actIdx) => {
        const isPastAct = actIdx + 1 < currentAct;
        const isCurrentAct = actIdx + 1 === currentAct;
        
        return (
          <View key={act.act_number} style={styles.act}>
            <Text style={[styles.actLabel, { color: isPastAct || isCurrentAct ? themeColor : GLOBAL_THEME.textMuted }]}>
              {act.title}
            </Text>
            {act.beats.map((beat, bIdx) => {
              const completed = isPastAct || (isCurrentAct && bIdx < currentBeat);
              const isCurrent = isCurrentAct && bIdx === currentBeat;
              const upcoming = !completed && !isCurrent;
              const iconName = (beatTypeIcon[beat.type] || 'ellipse') as any;
              beatIdx++;
              
              return (
                <View key={bIdx} style={styles.beatRow}>
                  {/* Timeline line */}
                  <View style={styles.timelineCol}>
                    <View 
                      style={[
                        styles.timelineDot,
                        completed && { backgroundColor: themeColor, borderColor: themeColor },
                        isCurrent && { borderColor: themeColor, backgroundColor: GLOBAL_THEME.background },
                      ]}
                    >
                      {completed && (
                        <Ionicons name="checkmark" size={12} color={GLOBAL_THEME.background} />
                      )}
                      {isCurrent && (
                        <View style={[styles.currentInner, { backgroundColor: themeColor }]} />
                      )}
                    </View>
                    {/* Vertical line to next item (unless last) */}
                    {!(actIdx === story.acts.length - 1 && bIdx === act.beats.length - 1) && (
                      <View 
                        style={[
                          styles.timelineLine,
                          completed && { backgroundColor: themeColor },
                        ]} 
                      />
                    )}
                  </View>

                  {/* Beat info */}
                  <View style={[styles.beatInfo, upcoming && styles.beatInfoDim]}>
                    <View style={styles.beatHeader}>
                      <Ionicons 
                        name={iconName} 
                        size={12} 
                        color={completed || isCurrent ? themeColor : GLOBAL_THEME.textMuted} 
                      />
                      <Text 
                        style={[
                          styles.beatType,
                          { color: completed || isCurrent ? themeColor : GLOBAL_THEME.textMuted }
                        ]}
                      >
                        {beat.type.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                    <Text 
                      style={[
                        styles.beatTitle,
                        upcoming && styles.beatTitleDim,
                        isCurrent && styles.beatTitleCurrent,
                      ]}
                      numberOfLines={1}
                    >
                      {upcoming ? '???' : beat.title}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  act: {
    marginBottom: 16,
  },
  actLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  beatRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineCol: {
    alignItems: 'center',
    width: 20,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: GLOBAL_THEME.textMuted,
    backgroundColor: GLOBAL_THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: GLOBAL_THEME.border,
    minHeight: 24,
  },
  beatInfo: {
    flex: 1,
    paddingBottom: 16,
  },
  beatInfoDim: {
    opacity: 0.4,
  },
  beatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  beatType: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  beatTitle: {
    fontSize: 13,
    color: GLOBAL_THEME.textPrimary,
    fontWeight: '500',
  },
  beatTitleDim: {
    color: GLOBAL_THEME.textMuted,
    fontStyle: 'italic',
  },
  beatTitleCurrent: {
    fontWeight: '700',
  },
});

export default JourneyMap;
