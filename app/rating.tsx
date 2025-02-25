import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Icon, Button } from '@rneui/themed';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

import { COLORS, SIZES, SHADOWS } from '../src/styles/theme';
import { getBean, getRating, saveRating } from '../src/services/storageService';

// Common flavor notes for coffee
const FLAVOR_TAGS = [
  'Chocolate', 'Caramel', 'Nutty', 'Fruity', 'Berry', 'Citrus',
  'Floral', 'Spicy', 'Earthy', 'Smoky', 'Sweet', 'Vanilla',
  'Honey', 'Toffee', 'Almond', 'Cherry', 'Apple', 'Blueberry',
  'Orange', 'Lemon', 'Jasmine', 'Cinnamon', 'Cedar', 'Tobacco'
];

export default function RatingScreen() {
  const { beanId } = useLocalSearchParams();
  const [bean, setBean] = useState(null);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadBeanAndRating();
  }, [beanId]);

  const loadBeanAndRating = async () => {
    if (!beanId) {
      router.back();
      return;
    }

    setIsLoading(true);
    try {
      // Get bean details
      const beanData = await getBean(beanId);
      if (!beanData) {
        throw new Error('Bean not found');
      }
      setBean(beanData);

      // Get existing rating if available
      const existingRating = await getRating(beanId);
      if (existingRating) {
        setRating(existingRating.stars || 0);
        setNotes(existingRating.notes || '');
        setSelectedTags(existingRating.flavorTags || []);
      }
    } catch (error) {
      console.error('Error loading bean data:', error);
      Alert.alert('Error', 'Failed to load bean data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingChange = (value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRating(value);
  };

  const toggleFlavorTag = (tag) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSaveRating = async () => {
    if (!beanId) return;

    setIsSaving(true);
    try {
      const ratingData = {
        stars: rating,
        notes,
        flavorTags: selectedTags,
        updatedAt: new Date().toISOString(),
      };

      await saveRating(beanId, ratingData);
      
      // Navigate back to bean detail
      router.push({
        pathname: '/bean-detail',
        params: { beanId }
      });
    } catch (error) {
      console.error('Error saving rating:', error);
      Alert.alert('Error', 'Failed to save rating. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRatingChange(star)}
            style={styles.starButton}
          >
            <Icon
              name="star"
              type="font-awesome"
              size={40}
              color={star <= rating ? COLORS.starActive : COLORS.starInactive}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Icon name="arrow-left" type="font-awesome" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rate This Bean</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Bean Info */}
          <View style={styles.beanInfoContainer}>
            <Text style={styles.beanName}>{bean.beanName || 'Unknown Bean'}</Text>
            <Text style={styles.roasterName}>{bean.roaster || 'Unknown Roaster'}</Text>
          </View>
          
          {/* Rating Stars */}
          <View style={styles.ratingContainer}>
            <Text style={styles.sectionTitle}>Your Rating</Text>
            {renderStars()}
            <Text style={styles.ratingText}>
              {rating === 0 ? 'Tap to rate' : `${rating} out of 5 stars`}
            </Text>
          </View>
          
          {/* Flavor Tags */}
          <View style={styles.flavorTagsContainer}>
            <Text style={styles.sectionTitle}>Flavor Notes</Text>
            <Text style={styles.sectionSubtitle}>
              Select the flavor notes you detected in this coffee
            </Text>
            
            <View style={styles.tagsGrid}>
              {FLAVOR_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagButton,
                    selectedTags.includes(tag) && styles.tagButtonSelected,
                  ]}
                  onPress={() => toggleFlavorTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      selectedTags.includes(tag) && styles.tagTextSelected,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Notes */}
          <View style={styles.notesContainer}>
            <Text style={styles.sectionTitle}>Tasting Notes</Text>
            <Text style={styles.sectionSubtitle}>
              Add your personal notes about this coffee
            </Text>
            
            <TextInput
              style={styles.notesInput}
              placeholder="What did you think about this coffee? How did it taste? What brewing method did you use?"
              placeholderTextColor={COLORS.textLight}
              multiline
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
        
        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={isSaving ? "Saving..." : "Save Rating"}
            loading={isSaving}
            disabled={isSaving}
            icon={!isSaving && { name: 'check', type: 'font-awesome', color: 'white' }}
            buttonStyle={styles.saveButton}
            titleStyle={styles.saveButtonText}
            onPress={handleSaveRating}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.base,
    fontSize: SIZES.body3,
    color: COLORS.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    ...SHADOWS.small,
  },
  backButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  beanInfoContainer: {
    marginBottom: SIZES.padding,
  },
  beanName: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  roasterName: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  sectionSubtitle: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    marginBottom: SIZES.padding,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 2,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SIZES.padding,
  },
  starButton: {
    padding: SIZES.base,
  },
  ratingText: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    marginTop: SIZES.base,
  },
  flavorTagsContainer: {
    marginBottom: SIZES.padding * 2,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  tagButton: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    margin: SIZES.base / 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tagText: {
    fontSize: SIZES.body4,
    color: COLORS.text,
  },
  tagTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  notesContainer: {
    marginBottom: SIZES.padding * 2,
  },
  notesInput: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    minHeight: 150,
    color: COLORS.text,
    fontSize: SIZES.body3,
    ...SHADOWS.small,
  },
  buttonContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    ...SHADOWS.medium,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding,
  },
  saveButtonText: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
  },
});
