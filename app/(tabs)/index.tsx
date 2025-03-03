import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { Link, router } from 'expo-router';
import { Button, Card, Icon } from '@rneui/themed';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our theme and services
import { COLORS, SIZES, SHADOWS } from '../../src/styles/theme';
import { getAllBeans, getAllRatings } from '../../src/services/storageService';

export default function HomeScreen() {
  const [recentBeans, setRecentBeans] = useState([]);
  const [topRatedBeans, setTopRatedBeans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data when the component mounts
    loadData();
  }, []);

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
      onPress={() => router.push({
        pathname: '/bean-detail',
        params: { beanId: bean.id }
      })}
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
        onPress={() => router.push('/scan')}
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
            onPress={() => router.push('/profile')}
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
            onPress={() => router.push('/scan')}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingVertical: SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: SIZES.base,
  },
  profileButton: {
    padding: SIZES.base,
  },
  scanContainer: {
    padding: SIZES.padding,
  },
  mainScanButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
  },
  mainScanButtonText: {
    fontSize: SIZES.h3,
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: SIZES.padding,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: SIZES.body4,
    color: COLORS.text,
  },
  horizontalList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  beanCard: {
    margin: SIZES.base,
    width: SIZES.width * 0.4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
  },
  cardContent: {
    padding: SIZES.base,
  },
  beanImageContainer: {
    width: '100%',
    height: SIZES.width * 0.4,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
  },
  beanImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  beanImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  beanInfo: {
    padding: SIZES.base,
  },
  beanName: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  roasterName: {
    fontSize: SIZES.body4,
    color: COLORS.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SIZES.base,
  },
  beanDetails: {
    fontSize: SIZES.body4,
    color: COLORS.text,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  emptyStateText: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyStateSubtext: {
    fontSize: SIZES.body4,
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: SIZES.base,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
  },
});
