import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Icon, Button, Divider } from '@rneui/themed';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { COLORS, SIZES, SHADOWS } from '../src/styles/theme';
import { getBean, getRating, getAllBeans } from '../src/services/storageService';
import { getSimilarBeans } from '../src/services/geminiService';

export default function BeanDetailScreen() {
  const { beanId } = useLocalSearchParams();
  const [bean, setBean] = useState(null);
  const [rating, setRating] = useState(null);
  const [similarBeans, setSimilarBeans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(true);

  useEffect(() => {
    loadBeanData();
  }, [beanId]);

  const loadBeanData = async () => {
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

      // Get user rating if available
      const ratingData = await getRating(beanId);
      setRating(ratingData);

      // Load similar beans
      loadSimilarBeans(beanData);
    } catch (error) {
      console.error('Error loading bean data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSimilarBeans = async (beanData) => {
    setIsLoadingSimilar(true);
    try {
      // Get all beans
      const allBeans = await getAllBeans();
      
      if (Object.keys(allBeans).length <= 1) {
        // Not enough beans for comparison
        setSimilarBeans([]);
        return;
      }

      // Get similar beans using the service
      const similarBeansIds = await getSimilarBeans(beanData, Object.values(allBeans));
      
      // Filter out the current bean and map to full bean objects
      const similarBeansData = similarBeansIds
        .filter(id => id !== beanId)
        .map(id => allBeans[id])
        .filter(Boolean)
        .slice(0, 3); // Limit to 3 similar beans
      
      setSimilarBeans(similarBeansData);
    } catch (error) {
      console.error('Error loading similar beans:', error);
      setSimilarBeans([]);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  const handleRateBean = () => {
    router.push({
      pathname: '/rating',
      params: { beanId }
    });
  };

  const renderRatingStars = (ratingValue) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="star"
            type="font-awesome"
            size={20}
            color={star <= ratingValue ? COLORS.starActive : COLORS.starInactive}
          />
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading bean details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="arrow-left" type="font-awesome" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bean Details</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Bean Image */}
        <View style={styles.imageContainer}>
          {bean.imageUri ? (
            <Image source={{ uri: bean.imageUri }} style={styles.beanImage} />
          ) : (
            <View style={[styles.beanImage, styles.beanImagePlaceholder]}>
              <Icon name="coffee" type="font-awesome" color={COLORS.primaryLight} size={60} />
            </View>
          )}
        </View>
        
        {/* Bean Name and Roaster */}
        <View style={styles.beanHeaderContainer}>
          <Text style={styles.beanName}>{bean.beanName || 'Unknown Bean'}</Text>
          <Text style={styles.roasterName}>{bean.roaster || 'Unknown Roaster'}</Text>
          
          {/* User Rating */}
          {rating ? (
            <View style={styles.userRatingContainer}>
              {renderRatingStars(rating.stars)}
              <TouchableOpacity onPress={handleRateBean}>
                <Text style={styles.editRatingText}>Edit Rating</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              title="Rate This Bean"
              icon={{ name: 'star', type: 'font-awesome', color: 'white', size: 16 }}
              buttonStyle={styles.rateButton}
              titleStyle={styles.rateButtonText}
              onPress={handleRateBean}
            />
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Bean Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Bean Details</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="map-marker" type="font-awesome" size={16} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Origin</Text>
              <Text style={styles.detailValue}>{bean.origin || 'Unknown'}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="fire" type="font-awesome" size={16} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Roast Level</Text>
              <Text style={styles.detailValue}>{bean.roastLevel || 'Unknown'}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="lemon-o" type="font-awesome" size={16} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Process</Text>
              <Text style={styles.detailValue}>{bean.process || 'Unknown'}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="leaf" type="font-awesome" size={16} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Variety</Text>
              <Text style={styles.detailValue}>{bean.variety || 'Unknown'}</Text>
            </View>
          </View>
          
          {/* Flavor Notes */}
          {bean.flavorNotes && bean.flavorNotes.length > 0 && (
            <View style={styles.flavorNotesContainer}>
              <Text style={styles.flavorNotesTitle}>Flavor Notes</Text>
              <View style={styles.flavorTagsContainer}>
                {bean.flavorNotes.map((note, index) => (
                  <View key={index} style={styles.flavorTag}>
                    <Text style={styles.flavorTagText}>{note}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Description */}
          {bean.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{bean.description}</Text>
            </View>
          )}
        </View>
        
        {/* User Notes */}
        {rating && rating.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.sectionTitle}>Your Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{rating.notes}</Text>
              <TouchableOpacity 
                style={styles.editNotesButton} 
                onPress={handleRateBean}
              >
                <Icon name="pencil" type="font-awesome" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Similar Beans */}
        <View style={styles.similarBeansContainer}>
          <Text style={styles.sectionTitle}>Similar Beans You Might Like</Text>
          
          {isLoadingSimilar ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : similarBeans.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {similarBeans.map((similarBean, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.similarBeanCard}
                  onPress={() => {
                    router.push({
                      pathname: '/bean-detail',
                      params: { beanId: similarBean.id }
                    });
                  }}
                >
                  <View style={styles.similarBeanImageContainer}>
                    {similarBean.imageUri ? (
                      <Image source={{ uri: similarBean.imageUri }} style={styles.similarBeanImage} />
                    ) : (
                      <View style={[styles.similarBeanImage, styles.beanImagePlaceholder]}>
                        <Icon name="coffee" type="font-awesome" color={COLORS.primaryLight} size={20} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.similarBeanName} numberOfLines={1}>
                    {similarBean.beanName || 'Unknown Bean'}
                  </Text>
                  <Text style={styles.similarBeanRoaster} numberOfLines={1}>
                    {similarBean.roaster || 'Unknown Roaster'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noSimilarBeansText}>
              No similar beans found. Scan more beans to get recommendations!
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    paddingBottom: SIZES.padding * 2,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.backgroundDark,
  },
  beanImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  beanImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
  },
  beanHeaderContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.card,
    ...SHADOWS.small,
  },
  beanName: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base / 2,
  },
  roasterName: {
    fontSize: SIZES.h4,
    color: COLORS.textLight,
    marginBottom: SIZES.base,
  },
  userRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SIZES.base,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  editRatingText: {
    fontSize: SIZES.body4,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  rateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.base,
    marginTop: SIZES.base,
  },
  rateButtonText: {
    fontSize: SIZES.body3,
  },
  divider: {
    marginVertical: SIZES.base,
    backgroundColor: COLORS.border,
  },
  detailsContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.card,
    marginTop: SIZES.base,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    marginVertical: SIZES.base / 2,
  },
  detailValue: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    fontWeight: '500',
  },
  flavorNotesContainer: {
    marginTop: SIZES.base,
  },
  flavorNotesTitle: {
    fontSize: SIZES.body2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  flavorTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  flavorTag: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    marginRight: SIZES.base,
    marginBottom: SIZES.base,
  },
  flavorTagText: {
    color: COLORS.white,
    fontSize: SIZES.body4,
  },
  descriptionContainer: {
    marginTop: SIZES.padding,
  },
  descriptionTitle: {
    fontSize: SIZES.body2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  descriptionText: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    lineHeight: 22,
  },
  notesContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.card,
    marginTop: SIZES.base,
    ...SHADOWS.small,
  },
  notesCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.small,
    position: 'relative',
  },
  notesText: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    lineHeight: 22,
  },
  editNotesButton: {
    position: 'absolute',
    top: SIZES.base,
    right: SIZES.base,
    padding: SIZES.base,
  },
  similarBeansContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.card,
    marginTop: SIZES.base,
    ...SHADOWS.small,
  },
  similarBeanCard: {
    width: 120,
    marginRight: SIZES.padding,
  },
  similarBeanImageContainer: {
    width: 120,
    height: 120,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    marginBottom: SIZES.base,
    ...SHADOWS.small,
  },
  similarBeanImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  similarBeanName: {
    fontSize: SIZES.body3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  similarBeanRoaster: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
  },
  noSimilarBeansText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: SIZES.padding,
  },
});
