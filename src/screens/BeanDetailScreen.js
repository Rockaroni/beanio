import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Button, Icon, Divider } from '@rneui/themed';
import { COLORS, SIZES, SHADOWS, FONTS } from '../styles/theme';
import { getBeanInfo, getRating } from '../services/storageService';
import { getSimilarBeans } from '../services/geminiService';

const BeanDetailScreen = ({ route, navigation }) => {
  const { beanId } = route.params;
  const [beanInfo, setBeanInfo] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [similarBeans, setSimilarBeans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);

  useEffect(() => {
    loadBeanInfo();
  }, [beanId]);

  const loadBeanInfo = async () => {
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
      
      // Get user's rating for this bean
      const rating = await getRating(beanId);
      setUserRating(rating);
      
      // Load similar beans
      loadSimilarBeans(bean);
    } catch (error) {
      console.error('Error loading bean details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSimilarBeans = async (bean) => {
    setIsLoadingSimilar(true);
    try {
      const similar = await getSimilarBeans(bean);
      setSimilarBeans(similar);
    } catch (error) {
      console.error('Error loading similar beans:', error);
      setSimilarBeans([]);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  const renderRatingStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="star"
            type="font-awesome"
            size={24}
            color={rating && star <= rating.stars ? COLORS.starActive : COLORS.starInactive}
          />
        ))}
      </View>
    );
  };

  const renderSimilarBeanCard = (bean, index) => (
    <TouchableOpacity
      key={index}
      style={styles.similarBeanCard}
      // In a real app, you would navigate to that bean's details
      // For now, we'll just show an alert
      onPress={() => alert(`This would navigate to ${bean.beanName} details`)}
    >
      <View style={styles.similarBeanContent}>
        <View style={styles.similarBeanImageContainer}>
          <View style={styles.similarBeanImagePlaceholder}>
            <Icon name="coffee" type="font-awesome" color={COLORS.primaryLight} size={24} />
          </View>
        </View>
        
        <View style={styles.similarBeanInfo}>
          <Text style={styles.similarBeanName} numberOfLines={1}>{bean.beanName}</Text>
          <Text style={styles.similarBeanRoaster} numberOfLines={1}>{bean.roaster}</Text>
          <Text style={styles.similarBeanDetails} numberOfLines={1}>
            {[bean.origin, bean.roastLevel].filter(Boolean).join(' • ')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Bean Image */}
        <View style={styles.imageContainer}>
          {beanInfo.imageUri ? (
            <Image source={{ uri: beanInfo.imageUri }} style={styles.beanImage} />
          ) : (
            <View style={[styles.beanImage, styles.beanImagePlaceholder]}>
              <Icon name="coffee" type="font-awesome" color={COLORS.primaryLight} size={50} />
            </View>
          )}
        </View>
        
        {/* Bean Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.beanName}>{beanInfo.beanName || 'Unknown Bean'}</Text>
          <Text style={styles.roasterName}>{beanInfo.roaster || 'Unknown Roaster'}</Text>
          
          {/* Rating Section */}
          <View style={styles.ratingSection}>
            {renderRatingStars(userRating)}
            
            {userRating ? (
              <TouchableOpacity
                style={styles.editRatingButton}
                onPress={() => navigation.navigate('Rating', { beanId })}
              >
                <Text style={styles.editRatingText}>Edit Rating</Text>
              </TouchableOpacity>
            ) : (
              <Button
                title="Rate This Bean"
                buttonStyle={styles.rateButton}
                titleStyle={styles.rateButtonText}
                onPress={() => navigation.navigate('Rating', { beanId })}
              />
            )}
          </View>
          
          {/* Bean Details */}
          <View style={styles.detailsContainer}>
            {/* Origin */}
            {beanInfo.origin && (
              <View style={styles.detailItem}>
                <Icon name="map-marker" type="font-awesome" size={20} color={COLORS.primary} />
                <Text style={styles.detailLabel}>Origin:</Text>
                <Text style={styles.detailValue}>{beanInfo.origin}</Text>
              </View>
            )}
            
            {/* Roast Level */}
            {beanInfo.roastLevel && (
              <View style={styles.detailItem}>
                <Icon name="fire" type="font-awesome" size={18} color={COLORS.primary} />
                <Text style={styles.detailLabel}>Roast:</Text>
                <Text style={styles.detailValue}>{beanInfo.roastLevel}</Text>
              </View>
            )}
            
            {/* Price */}
            {beanInfo.price && (
              <View style={styles.detailItem}>
                <Icon name="tag" type="font-awesome" size={18} color={COLORS.primary} />
                <Text style={styles.detailLabel}>Price:</Text>
                <Text style={styles.detailValue}>{beanInfo.price}</Text>
              </View>
            )}
            
            {/* Seller */}
            {beanInfo.seller && beanInfo.seller !== beanInfo.roaster && (
              <View style={styles.detailItem}>
                <Icon name="shopping-cart" type="font-awesome" size={18} color={COLORS.primary} />
                <Text style={styles.detailLabel}>Seller:</Text>
                <Text style={styles.detailValue}>{beanInfo.seller}</Text>
              </View>
            )}
            
            {/* Processing Method */}
            {beanInfo.processingMethod && (
              <View style={styles.detailItem}>
                <Icon name="cogs" type="font-awesome" size={18} color={COLORS.primary} />
                <Text style={styles.detailLabel}>Process:</Text>
                <Text style={styles.detailValue}>{beanInfo.processingMethod}</Text>
              </View>
            )}
            
            {/* Certifications */}
            {beanInfo.certifications && (
              <View style={styles.detailItem}>
                <Icon name="certificate" type="font-awesome" size={18} color={COLORS.primary} />
                <Text style={styles.detailLabel}>Certifications:</Text>
                <Text style={styles.detailValue}>{beanInfo.certifications}</Text>
              </View>
            )}
          </View>
          
          {/* Flavor Notes */}
          {beanInfo.flavorNotes && (
            <View style={styles.flavorSection}>
              <Text style={styles.sectionTitle}>Flavor Notes</Text>
              <View style={styles.flavorTags}>
                {beanInfo.flavorNotes.split(',').map((flavor, index) => (
                  <View key={index} style={styles.flavorTag}>
                    <Text style={styles.flavorTagText}>{flavor.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* User Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Your Notes</Text>
            {userRating && userRating.notes ? (
              <Text style={styles.notesText}>{userRating.notes}</Text>
            ) : (
              <Text style={styles.noNotesText}>
                You haven't added any notes yet. Rate this bean to add notes.
              </Text>
            )}
          </View>
          
          {/* Similar Beans */}
          <View style={styles.similarBeansSection}>
            <Text style={styles.sectionTitle}>Similar Beans You Might Like</Text>
            
            {isLoadingSimilar ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.similarLoading} />
            ) : similarBeans.length > 0 ? (
              <View style={styles.similarBeansList}>
                {similarBeans.map(renderSimilarBeanCard)}
              </View>
            ) : (
              <Text style={styles.noSimilarText}>
                No similar beans found. We're still learning your preferences.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SIZES.spacingXXLarge,
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
  imageContainer: {
    height: 250,
    width: '100%',
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  beanImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  beanImagePlaceholder: {
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: SIZES.spacingLarge,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    ...SHADOWS.medium,
  },
  beanName: {
    fontSize: SIZES.xxLarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacingSmall,
  },
  roasterName: {
    fontSize: SIZES.large,
    color: COLORS.textLight,
    marginBottom: SIZES.spacingLarge,
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingLarge,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  rateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadius,
  },
  rateButtonText: {
    fontSize: SIZES.small,
  },
  editRatingButton: {
    padding: SIZES.spacingSmall,
  },
  editRatingText: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginBottom: SIZES.spacingLarge,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingMedium,
  },
  detailLabel: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SIZES.spacingMedium,
    width: 70,
  },
  detailValue: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    flex: 1,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacingMedium,
  },
  flavorSection: {
    marginBottom: SIZES.spacingLarge,
  },
  flavorTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  flavorTag: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: SIZES.spacingMedium,
    paddingVertical: SIZES.spacingSmall,
    borderRadius: 20,
    marginRight: SIZES.spacingSmall,
    marginBottom: SIZES.spacingSmall,
  },
  flavorTagText: {
    color: COLORS.primaryDark,
    fontSize: SIZES.small,
  },
  notesSection: {
    marginBottom: SIZES.spacingLarge,
  },
  notesText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    lineHeight: 22,
  },
  noNotesText: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  similarBeansSection: {
    marginBottom: SIZES.spacingLarge,
  },
  similarLoading: {
    marginVertical: SIZES.spacingLarge,
  },
  similarBeansList: {
    marginTop: SIZES.spacingMedium,
  },
  similarBeanCard: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.spacingMedium,
    padding: SIZES.spacingMedium,
    ...SHADOWS.small,
  },
  similarBeanContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  similarBeanImageContainer: {
    marginRight: SIZES.spacingMedium,
  },
  similarBeanImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: SIZES.borderRadiusSmall,
    backgroundColor: COLORS.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  similarBeanInfo: {
    flex: 1,
  },
  similarBeanName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  similarBeanRoaster: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  similarBeanDetails: {
    fontSize: SIZES.xSmall,
    color: COLORS.textLight,
    marginTop: 2,
  },
  noSimilarText: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});

export default BeanDetailScreen;
