import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Icon, Button } from '@rneui/themed';
import { COLORS, SIZES, SHADOWS } from '../styles/theme';
import { getBeanInfo, getRating, saveRating } from '../services/storageService';

const RatingScreen = ({ route, navigation }) => {
  const { beanId } = route.params;
  const [beanInfo, setBeanInfo] = useState(null);
  const [stars, setStars] = useState(0);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadBeanAndRating();
  }, [beanId]);

  const loadBeanAndRating = async () => {
    setIsLoading(true);
    try {
      // Get bean information
      const bean = await getBeanInfo(beanId);
      if (!bean) {
        console.error('Bean not found:', beanId);
        navigation.goBack();
        return;
      }
      
      setBeanInfo(bean);
      
      // Get user's existing rating for this bean
      const rating = await getRating(beanId);
      if (rating) {
        setStars(rating.stars || 0);
        setNotes(rating.notes || '');
      }
    } catch (error) {
      console.error('Error loading bean and rating:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarPress = (rating) => {
    setStars(rating);
  };

  const handleSaveRating = async () => {
    if (stars === 0) {
      Alert.alert('Rating Required', 'Please select at least 1 star to rate this coffee bean.');
      return;
    }
    
    setIsSaving(true);
    try {
      // Create rating object
      const ratingData = {
        stars,
        notes,
        timestamp: new Date().toISOString(),
      };
      
      // Save rating
      await saveRating(beanId, ratingData);
      
      // Navigate back to bean detail
      navigation.goBack();
    } catch (error) {
      console.error('Error saving rating:', error);
      Alert.alert('Error', 'Failed to save your rating. Please try again.');
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
            onPress={() => handleStarPress(star)}
            style={styles.starButton}
          >
            <Icon
              name="star"
              type="font-awesome"
              size={40}
              color={star <= stars ? COLORS.starActive : COLORS.starInactive}
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Bean Info Header */}
          <View style={styles.beanInfoHeader}>
            <Text style={styles.beanName}>{beanInfo.beanName || 'Unknown Bean'}</Text>
            <Text style={styles.roasterName}>{beanInfo.roaster || 'Unknown Roaster'}</Text>
            
            {beanInfo.origin && (
              <Text style={styles.beanOrigin}>{beanInfo.origin}</Text>
            )}
          </View>
          
          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>How would you rate this coffee?</Text>
            {renderStars()}
            <Text style={styles.ratingDescription}>
              {stars === 0 && 'Tap to rate'}
              {stars === 1 && 'Not good'}
              {stars === 2 && 'Okay'}
              {stars === 3 && 'Good'}
              {stars === 4 && 'Very good'}
              {stars === 5 && 'Excellent!'}
            </Text>
          </View>
          
          {/* Notes Section */}
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Your Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add your tasting notes, brewing method, or any other thoughts about this coffee..."
              placeholderTextColor={COLORS.textLight}
              multiline
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>
          
          {/* Flavor Tags Section (for future implementation) */}
          <View style={styles.flavorTagsSection}>
            <Text style={styles.flavorTagsTitle}>Flavor Tags (Coming Soon)</Text>
            <Text style={styles.flavorTagsDescription}>
              In a future update, you'll be able to select flavor tags to help categorize your coffee beans.
            </Text>
          </View>
          
          {/* Save Button */}
          <View style={styles.saveButtonContainer}>
            <Button
              title="Save Rating"
              loading={isSaving}
              buttonStyle={styles.saveButton}
              onPress={handleSaveRating}
              disabled={isSaving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.spacingLarge,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.spacingMedium,
    color: COLORS.text,
    fontSize: SIZES.medium,
  },
  beanInfoHeader: {
    marginBottom: SIZES.spacingXLarge,
    alignItems: 'center',
  },
  beanName: {
    fontSize: SIZES.xLarge,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.spacingSmall,
  },
  roasterName: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SIZES.spacingSmall,
  },
  beanOrigin: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: SIZES.spacingXLarge,
  },
  ratingTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacingLarge,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SIZES.spacingMedium,
  },
  starButton: {
    padding: SIZES.spacingSmall,
  },
  ratingDescription: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: '500',
  },
  notesSection: {
    marginBottom: SIZES.spacingXLarge,
  },
  notesTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacingMedium,
  },
  notesInput: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.spacingMedium,
    minHeight: 150,
    color: COLORS.text,
    fontSize: SIZES.medium,
    ...SHADOWS.small,
  },
  flavorTagsSection: {
    marginBottom: SIZES.spacingXLarge,
  },
  flavorTagsTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacingMedium,
  },
  flavorTagsDescription: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  saveButtonContainer: {
    marginBottom: SIZES.spacingXLarge,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    paddingVertical: SIZES.spacingMedium,
    ...SHADOWS.medium,
  },
});

export default RatingScreen;
