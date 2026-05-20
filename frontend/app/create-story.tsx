import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { createCustomStory } from '../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { GLOBAL_THEME, STORY_THEMES, getThemeForCustomStory } from '../src/theme';
import { notify } from '../src/utils/confirm';

const THEMES = [
  { id: 'fantasy', label: 'Fantasy', icon: '🧙', preview: STORY_THEMES.medieval },
  { id: 'sci-fi', label: 'Sci-Fi', icon: '🚀', preview: STORY_THEMES['sci-fi'] },
  { id: 'horror', label: 'Horror', icon: '👻', preview: STORY_THEMES.horror },
  { id: 'adventure', label: 'Adventure', icon: '🗺️', preview: STORY_THEMES.pirate },
  { id: 'mystery', label: 'Mystery', icon: '🔍', preview: STORY_THEMES.noir },
  { id: 'superhero', label: 'Hero', icon: '🦸', preview: STORY_THEMES['sci-fi'] },
];

export default function CreateStoryScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [numActs, setNumActs] = useState(3);
  const [villains, setVillains] = useState(['', '', '']);
  const [creating, setCreating] = useState(false);

  const themeColors = getThemeForCustomStory(selectedTheme.id);

  const updateVillain = (index: number, value: string) => {
    const newVillains = [...villains];
    newVillains[index] = value;
    setVillains(newVillains);
  };

  const updateNumActs = (newNum: number) => {
    setNumActs(newNum);
    const newVillains = [...villains];
    while (newVillains.length < newNum) newVillains.push('');
    while (newVillains.length > newNum) newVillains.pop();
    setVillains(newVillains);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      notify('Title needed', 'Please name your story');
      return;
    }
    if (!description.trim()) {
      notify('Description needed', 'Tell us about your story');
      return;
    }
    const validVillains = villains.filter(v => v.trim());
    if (validVillains.length < numActs) {
      notify('Villains needed', `Please name all ${numActs} villains`);
      return;
    }

    setCreating(true);
    try {
      await createCustomStory({
        title: title.trim(),
        description: description.trim(),
        theme: selectedTheme.id,
        icon: selectedTheme.icon,
        villains: validVillains,
        num_acts: numActs,
      });
      router.back();
    } catch (error: any) {
      notify('Error', error.response?.data?.detail || 'Failed to forge story');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="create-story-screen">
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="back-btn">
            <Ionicons name="chevron-back" size={28} color={GLOBAL_THEME.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.kicker}>FORGE</Text>
            <Text style={styles.headerTitle}>New Saga</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeIn.duration(400)}>
            <Text style={styles.label}>STORY TITLE</Text>
            <TextInput
              style={[styles.input, styles.bigInput, { fontFamily: themeColors.fontFamily }]}
              placeholder="The Forgotten Kingdom"
              placeholderTextColor={GLOBAL_THEME.textMuted}
              value={title}
              onChangeText={setTitle}
              testID="story-title-input"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text style={styles.label}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What is your story about? Set the scene..."
              placeholderTextColor={GLOBAL_THEME.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              testID="story-description-input"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text style={styles.label}>CHOOSE A THEME</Text>
            <View style={styles.themeGrid}>
              {THEMES.map((theme) => {
                const isSelected = selectedTheme.id === theme.id;
                return (
                  <TouchableOpacity
                    key={theme.id}
                    style={[
                      styles.themeOption,
                      isSelected && { 
                        borderColor: theme.preview.primary,
                        backgroundColor: theme.preview.tintOverlay,
                      },
                    ]}
                    onPress={() => setSelectedTheme(theme)}
                    testID={`theme-${theme.id}`}
                  >
                    <Text style={styles.themeIcon}>{theme.icon}</Text>
                    <Text style={[
                      styles.themeLabel,
                      isSelected && { color: theme.preview.primary, fontWeight: '800' },
                    ]}>
                      {theme.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text style={styles.label}>NUMBER OF ACTS</Text>
            <View style={styles.actsRow}>
              {[3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.actOption,
                    numActs === n && [styles.actOptionSelected, { backgroundColor: themeColors.primary }],
                  ]}
                  onPress={() => updateNumActs(n)}
                >
                  <Text style={[
                    styles.actOptionText,
                    numActs === n && styles.actOptionTextSelected,
                  ]}>
                    {n}
                  </Text>
                  <Text style={[
                    styles.actOptionLabel,
                    numActs === n && styles.actOptionLabelSelected,
                  ]}>
                    ACTS
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <Text style={styles.label}>YOUR {numActs} VILLAINS</Text>
            <Text style={styles.hint}>Each villain leads one act — the more dramatic, the better.</Text>
            {villains.map((villain, index) => (
              <View key={index} style={styles.villainRow}>
                <View style={[styles.villainBadge, { backgroundColor: themeColors.primary }]}>
                  <Text style={styles.villainBadgeText}>{index + 1}</Text>
                </View>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder={`Villain ${index + 1} (e.g., Lord Malachar)`}
                  placeholderTextColor={GLOBAL_THEME.textMuted}
                  value={villain}
                  onChangeText={(text) => updateVillain(index, text)}
                  testID={`villain-${index}-input`}
                />
              </View>
            ))}
          </Animated.View>

          <View style={[styles.infoBox, { borderColor: themeColors.primary + '40' }]}>
            <Ionicons name="information-circle" size={18} color={themeColors.primary} />
            <Text style={[styles.infoText, { color: themeColors.primary }]}>
              Your story will use a smart narrative template — any tasks you complete will advance it dramatically.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: themeColors.primary }, creating && { opacity: 0.6 }]}
            onPress={handleCreate}
            disabled={creating}
            testID="create-story-submit-btn"
          >
            {creating ? (
              <ActivityIndicator color="#0A0A0A" />
            ) : (
              <>
                <Text style={styles.createButtonText}>FORGE THE SAGA</Text>
                <Ionicons name="hammer" size={16} color="#0A0A0A" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBAL_THEME.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  kicker: {
    fontSize: 10,
    color: GLOBAL_THEME.gold,
    fontWeight: '900',
    letterSpacing: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GLOBAL_THEME.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: GLOBAL_THEME.textSecondary,
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: GLOBAL_THEME.textMuted,
    marginBottom: 12,
    marginTop: -4,
  },
  input: {
    backgroundColor: GLOBAL_THEME.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: GLOBAL_THEME.textPrimary,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: GLOBAL_THEME.border,
  },
  bigInput: {
    fontSize: 20,
    paddingVertical: 18,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeOption: {
    width: '31%',
    backgroundColor: GLOBAL_THEME.surface,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  themeLabel: {
    fontSize: 12,
    color: GLOBAL_THEME.textSecondary,
    fontWeight: '600',
  },
  actsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actOption: {
    flex: 1,
    backgroundColor: GLOBAL_THEME.surface,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLOBAL_THEME.border,
  },
  actOptionSelected: {
    borderColor: 'transparent',
  },
  actOptionText: {
    fontSize: 28,
    fontWeight: '900',
    color: GLOBAL_THEME.textPrimary,
  },
  actOptionTextSelected: {
    color: '#0A0A0A',
  },
  actOptionLabel: {
    fontSize: 9,
    color: GLOBAL_THEME.textMuted,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  actOptionLabelSelected: {
    color: '#0A0A0A',
  },
  villainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  villainBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  villainBadgeText: {
    color: '#0A0A0A',
    fontWeight: '900',
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    marginBottom: 24,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  createButton: {
    borderRadius: 999,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonText: {
    color: '#0A0A0A',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
