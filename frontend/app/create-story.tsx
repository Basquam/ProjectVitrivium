import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createCustomStory } from '../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';

const THEMES = [
  { id: 'fantasy', label: 'Fantasy', icon: '🧙' },
  { id: 'sci-fi', label: 'Sci-Fi', icon: '🚀' },
  { id: 'horror', label: 'Horror', icon: '👻' },
  { id: 'adventure', label: 'Adventure', icon: '🗺️' },
  { id: 'mystery', label: 'Mystery', icon: '🔍' },
  { id: 'superhero', label: 'Superhero', icon: '🦸' },
];

export default function CreateStoryScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [numActs, setNumActs] = useState(3);
  const [villains, setVillains] = useState(['', '', '']);
  const [creating, setCreating] = useState(false);

  const updateVillain = (index: number, value: string) => {
    const newVillains = [...villains];
    newVillains[index] = value;
    setVillains(newVillains);
  };

  const updateNumActs = (newNum: number) => {
    setNumActs(newNum);
    const newVillains = [...villains];
    while (newVillains.length < newNum) {
      newVillains.push('');
    }
    while (newVillains.length > newNum) {
      newVillains.pop();
    }
    setVillains(newVillains);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a story title');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    const validVillains = villains.filter(v => v.trim());
    if (validVillains.length < numActs) {
      Alert.alert('Error', `Please enter at least ${numActs} villain names`);
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
      Alert.alert('Success!', 'Your custom story has been created!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error creating story:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create story');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#f3f4f6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Custom Story</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.field}>
            <Text style={styles.label}>Story Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., The Forgotten Kingdom"
              placeholderTextColor="#6b7280"
              value={title}
              onChangeText={setTitle}
              testID="story-title-input"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What is your story about?"
              placeholderTextColor="#6b7280"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              testID="story-description-input"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Theme</Text>
            <View style={styles.themeGrid}>
              {THEMES.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeOption,
                    selectedTheme.id === theme.id && styles.themeOptionSelected,
                  ]}
                  onPress={() => setSelectedTheme(theme)}
                >
                  <Text style={styles.themeIcon}>{theme.icon}</Text>
                  <Text style={styles.themeLabel}>{theme.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Number of Acts</Text>
            <View style={styles.actsRow}>
              {[3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.actOption,
                    numActs === n && styles.actOptionSelected,
                  ]}
                  onPress={() => updateNumActs(n)}
                >
                  <Text style={[
                    styles.actOptionText,
                    numActs === n && styles.actOptionTextSelected,
                  ]}>
                    {n} Acts
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Villains ({numActs} needed)</Text>
            <Text style={styles.hint}>
              Each villain represents an act's main challenge. Be creative!
            </Text>
            {villains.map((villain, index) => (
              <TextInput
                key={index}
                style={styles.input}
                placeholder={`Villain ${index + 1} (e.g., Dark Wizard Vorath)`}
                placeholderTextColor="#6b7280"
                value={villain}
                onChangeText={(text) => updateVillain(index, text)}
                testID={`villain-${index}-input`}
              />
            ))}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>
              Your custom story will use a smart template that fits any tasks you create. Each act will have an intro, challenge, and victory beat.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.createButton, creating && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={creating}
            testID="create-story-submit-btn"
          >
            {creating ? (
              <ActivityIndicator color="#0a0a0a" />
            ) : (
              <Text style={styles.createButtonText}>Create Story</Text>
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
    backgroundColor: '#0a0a0a',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#f3f4f6',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeOption: {
    width: '31%',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  themeOptionSelected: {
    borderColor: '#ffd700',
    backgroundColor: '#374151',
  },
  themeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  themeLabel: {
    fontSize: 12,
    color: '#f3f4f6',
    fontWeight: '600',
  },
  actsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actOption: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  actOptionSelected: {
    borderColor: '#ffd700',
    backgroundColor: '#ffd700',
  },
  actOptionText: {
    fontSize: 14,
    color: '#f3f4f6',
    fontWeight: '600',
  },
  actOptionTextSelected: {
    color: '#0a0a0a',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#93c5fd',
    lineHeight: 18,
  },
  createButton: {
    backgroundColor: '#ffd700',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
