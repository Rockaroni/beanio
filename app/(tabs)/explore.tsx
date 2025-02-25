import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Icon, Card, Divider } from '@rneui/themed';
import { StatusBar } from 'expo-status-bar';

import { COLORS, SIZES, SHADOWS } from '../../src/styles/theme';
import { getAllBeans } from '../../src/services/storageService';

// Sample coffee bean categories
const CATEGORIES = [
  { id: '1', name: 'Light Roast', icon: 'sun-o' },
  { id: '2', name: 'Medium Roast', icon: 'adjust' },
  { id: '3', name: 'Dark Roast', icon: 'moon-o' },
  { id: '4', name: 'Single Origin', icon: 'map-marker' },
  { id: '5', name: 'Blends', icon: 'random' },
  { id: '6', name: 'Espresso', icon: 'coffee' },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [beans, setBeans] = useState([]);
  const [filteredBeans, setFilteredBeans] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBeans();
  }, []);

  useEffect(() => {
    filterBeans();
  }, [searchQuery, selectedCategory, beans]);

  const loadBeans = async () => {
    setIsLoading(true);
    try {
      const beansObj = await getAllBeans();
      const beansArray = Object.values(beansObj);
      setBeans(beansArray);
    } catch (error) {
      console.error('Error loading beans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBeans = () => {
    let filtered = [...beans];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(bean => 
        bean.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bean.roaster?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bean.origin?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      switch(selectedCategory) {
        case '1': // Light Roast
          filtered = filtered.filter(bean => 
            bean.roastLevel?.toLowerCase().includes('light'));
          break;
        case '2': // Medium Roast
          filtered = filtered.filter(bean => 
            bean.roastLevel?.toLowerCase().includes('medium'));
          break;
        case '3': // Dark Roast
          filtered = filtered.filter(bean => 
            bean.roastLevel?.toLowerCase().includes('dark'));
          break;
        case '4': // Single Origin
          filtered = filtered.filter(bean => 
            !bean.blend && bean.origin);
          break;
        case '5': // Blends
          filtered = filtered.filter(bean => 
            bean.blend === true);
          break;
        case '6': // Espresso
          filtered = filtered.filter(bean => 
            bean.recommendedBrewMethods?.toLowerCase().includes('espresso'));
          break;
      }
    }
    
    setFilteredBeans(filtered);
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const renderBeanItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.beanCard}
      onPress={() => router.push({
        pathname: '/bean-detail',
        params: { beanId: item.id }
      })}
    >
      <View style={styles.beanCardContent}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.beanImage} />
        ) : (
          <View style={styles.beanImagePlaceholder}>
            <Icon name="coffee" type="font-awesome" size={30} color={COLORS.primaryLight} />
          </View>
        )}
        <View style={styles.beanInfo}>
          <Text style={styles.beanName} numberOfLines={1}>{item.name || 'Unknown Bean'}</Text>
          <Text style={styles.beanRoaster} numberOfLines={1}>{item.roaster || 'Unknown Roaster'}</Text>
          <View style={styles.beanDetails}>
            <Text style={styles.beanOrigin} numberOfLines={1}>{item.origin || 'Unknown Origin'}</Text>
            {item.averageRating > 0 && (
              <View style={styles.ratingContainer}>
                <Icon name="star" type="font-awesome" size={12} color={COLORS.starActive} />
                <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search" type="font-awesome" size={50} color={COLORS.textLight} />
      <Text style={styles.emptyText}>No coffee beans found</Text>
      <Text style={styles.emptySubtext}>
        {searchQuery || selectedCategory 
          ? 'Try adjusting your filters'
          : 'Scan some coffee beans to get started!'}
      </Text>
      {(!searchQuery && !selectedCategory) && (
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => router.push('/scan')}
        >
          <Text style={styles.scanButtonText}>Scan a Bean</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Beans</Text>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" type="font-awesome" size={18} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search beans, roasters, origins..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="times-circle" type="font-awesome" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Icon 
                name={category.icon} 
                type="font-awesome" 
                size={16} 
                color={selectedCategory === category.id ? COLORS.white : COLORS.primary} 
              />
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Bean List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading beans...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBeans}
          renderItem={renderBeanItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.beanList}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding / 2,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    ...SHADOWS.small,
  },
  searchIcon: {
    marginRight: SIZES.base,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.body3,
    color: COLORS.text,
  },
  categoriesContainer: {
    marginBottom: SIZES.padding,
  },
  categoriesScrollContent: {
    paddingHorizontal: SIZES.padding,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    marginRight: SIZES.base,
    ...SHADOWS.small,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: SIZES.body4,
    color: COLORS.text,
    marginLeft: SIZES.base,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.padding,
    color: COLORS.text,
    fontSize: SIZES.body3,
  },
  beanList: {
    padding: SIZES.padding,
    paddingTop: 0,
  },
  beanCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  beanCardContent: {
    flexDirection: 'row',
    padding: SIZES.padding,
  },
  beanImage: {
    width: 70,
    height: 70,
    borderRadius: SIZES.radius / 2,
  },
  beanImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: SIZES.radius / 2,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  beanInfo: {
    flex: 1,
    marginLeft: SIZES.padding,
    justifyContent: 'center',
  },
  beanName: {
    fontSize: SIZES.body2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  beanRoaster: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
    marginBottom: 4,
  },
  beanDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  beanOrigin: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: SIZES.caption,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2,
    height: 300,
  },
  emptyText: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.padding,
  },
  emptySubtext: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SIZES.base,
    marginBottom: SIZES.padding,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
  },
  scanButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body3,
    fontWeight: 'bold',
  },
});
