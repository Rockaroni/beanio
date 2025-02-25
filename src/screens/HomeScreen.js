import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Button, Card, Icon } from '@rneui/themed';
import { COLORS, SIZES, SHADOWS } from '../styles/theme';
import { getAllBeans, getAllRatings } from '../services/storageService';

const HomeScreen = ({ navigation }) => {
  const [recentBeans, setRecentBeans] = useState([]);
  const [topRatedBeans, setTopRatedBeans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    // Initial data load
    loadData();

    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get all beans and ratings
      const beansObj = await getAllBeans();
      const ratingsObj = await getAllRatings();
      
      // Convert to arrays and add rating information
      const beansArray = Object.values(beansObj).map(bean => {
        const rating = ratingsObj[bean.id];
        return {
          ...bean,
          rating: rating ? rating.stars : null,
          notes: rating ? rating.notes : null,
        };
      });
      
      // Sort by scan date for recent beans (newest first)
      const sortedByDate = [...beansArray].sort((a, b) => 
        new Date(b.scannedAt) - new Date(a.scannedAt)
      );
      
      // Sort by rating for top rated beans (highest first)
      const sortedByRating = [...beansArray]
        .filter(bean => bean.rating !== null)
        .sort((a, b) => b.rating - a.rating);
      
      setRecentBeans(sortedByDate.slice(0, 5)); // Top 5 most recent
      setTopRatedBeans(sortedByRating.slice(0, 5)); // Top 5 highest rated
    } catch (error) {
      console.error('Error loading home screen data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderBeanCard = (bean, index) => (
    <TouchableOpacity
      key={bean.id || index}
      style={styles.beanCard}
      onPress={() => navigation.navigate('BeanDetail', { beanId: bean.id })}
    >
      <Card containerStyle={styles.card}>
        <View style={styles.cardContent}>
          {/* Bean image or placeholder */}
          <View style={styles.beanImageContainer}>
            {bean.imageUri ? (
              <Image source={{ uri: bean.imageUri }} style={styles.beanImage} />
            ) : (
              <View style={[styles.beanImage, styles.beanImagePlaceholder]}>
                <Icon name="coffee" type="font-awesome" color={COLORS.primaryLight} size={30} />
              </View>
            )}
          </View>
          
          <View style={styles.beanInfo}>
            <Text style={styles.beanName} numberOfLines={1}>{bean.beanName || 'Unknown Bean'}</Text>
            <Text style={styles.roasterName} numberOfLines={1}>{bean.roaster || 'Unknown Roaster'}</Text>
            
            {/* Rating stars */}
            {bean.rating && (
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Icon
                    key={star}
                    name="star"
                    type="font-awesome"
                    size={14}
                    color={star <= bean.rating ? COLORS.starActive : COLORS.starInactive}
                  />
                ))}
              </View>
            )}
            
            {/* Origin and roast level */}
            {(bean.origin || bean.roastLevel) && (
              <Text style={styles.beanDetails}>
                {[bean.origin, bean.roastLevel].filter(Boolean).join(' • ')}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="coffee" type="font-awesome" size={50} color={COLORS.primaryLight} />
      <Text style={styles.emptyStateText}>No coffee beans yet!</Text>
      <Text style={styles.emptyStateSubtext}>
        Scan your first coffee bean to start building your collection.
      </Text>
      <Button
        title="Scan Coffee Bean"
        icon={{ name: 'camera', type: 'font-awesome', color: 'white' }}
        buttonStyle={styles.scanButton}
        onPress={() => navigation.navigate('Scan')}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with logo and profile button */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="coffee" type="font-awesome" size={24} color={COLORS.primary} />
            <Text style={styles.logoText}>Beanio</Text>
          </View>
          
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="user-circle" type="font-awesome" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Main scan button */}
        <View style={styles.scanContainer}>
          <Button
            title="Scan Coffee Bean"
            icon={{ name: 'camera', type: 'font-awesome', color: 'white', size: 20 }}
            buttonStyle={styles.mainScanButton}
            titleStyle={styles.mainScanButtonText}
            onPress={() => navigation.navigate('Scan')}
          />
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading your coffee beans...</Text>
          </View>
        ) : recentBeans.length === 0 && topRatedBeans.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Recent beans section */}
            {recentBeans.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recently Scanned</Text>
                  <TouchableOpacity>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.horizontalList}>
                    {recentBeans.map(renderBeanCard)}
                  </View>
                </ScrollView>
              </View>
            )}
            
            {/* Top rated beans section */}
            {topRatedBeans.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Your Top Rated</Text>
                  <TouchableOpacity>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.horizontalList}>
                    {topRatedBeans.map(renderBeanCard)}
                  </View>
                </ScrollView>
              </View>
            )}
          </>
        )}
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
    padding: SIZES.spacing,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingLarge,
    paddingHorizontal: SIZES.spacing,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: SIZES.spacingSmall,
  },
  profileButton: {
    padding: SIZES.spacingSmall,
  },
  scanContainer: {
    marginBottom: SIZES.spacingXLarge,
  },
  mainScanButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    paddingVertical: SIZES.spacingMedium,
    ...SHADOWS.medium,
  },
  mainScanButtonText: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: SIZES.spacingXLarge,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingMedium,
    paddingHorizontal: SIZES.spacingSmall,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  horizontalList: {
    flexDirection: 'row',
    paddingLeft: SIZES.spacingSmall,
  },
  beanCard: {
    width: 160,
    marginRight: SIZES.spacingMedium,
  },
  card: {
    margin: 0,
    padding: SIZES.spacingSmall,
    borderRadius: SIZES.borderRadius,
    ...SHADOWS.small,
  },
  cardContent: {
    alignItems: 'center',
  },
  beanImageContainer: {
    marginBottom: SIZES.spacingSmall,
  },
  beanImage: {
    width: 100,
    height: 100,
    borderRadius: SIZES.borderRadius,
  },
  beanImagePlaceholder: {
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  beanInfo: {
    width: '100%',
  },
  beanName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  roasterName: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  beanDetails: {
    fontSize: SIZES.xSmall,
    color: COLORS.textLight,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacingXLarge,
    marginTop: SIZES.spacingXLarge,
  },
  emptyStateText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.spacingMedium,
  },
  emptyStateSubtext: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: 'center',
    marginVertical: SIZES.spacingMedium,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.spacingLarge,
    marginTop: SIZES.spacingMedium,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacingXLarge,
  },
});

export default HomeScreen;
