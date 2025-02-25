import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Icon, Divider } from '@rneui/themed';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { COLORS, SIZES, SHADOWS } from '../src/styles/theme';
import { getAllRatings, getAllBeans } from '../src/services/storageService';

export default function ProfileScreen() {
  const [userStats, setUserStats] = useState({
    totalBeans: 0,
    totalRatings: 0,
    averageRating: 0,
    favoriteRoaster: '',
    favoriteOrigin: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Get all beans and ratings
      const beansObj = await getAllBeans();
      const ratingsObj = await getAllRatings();
      
      const beans = Object.values(beansObj);
      const ratings = Object.values(ratingsObj);
      
      // Calculate stats
      const totalBeans = beans.length;
      const totalRatings = ratings.length;
      
      // Calculate average rating
      const sumRatings = ratings.reduce((sum, rating) => sum + (rating.stars || 0), 0);
      const averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 0;
      
      // Find favorite roaster (most scanned)
      const roasterCounts = {};
      beans.forEach(bean => {
        if (bean.roaster) {
          roasterCounts[bean.roaster] = (roasterCounts[bean.roaster] || 0) + 1;
        }
      });
      
      // Find favorite origin (most scanned)
      const originCounts = {};
      beans.forEach(bean => {
        if (bean.origin) {
          originCounts[bean.origin] = (originCounts[bean.origin] || 0) + 1;
        }
      });
      
      // Get the roaster and origin with the highest count
      const favoriteRoaster = Object.entries(roasterCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      const favoriteOrigin = Object.entries(originCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      
      setUserStats({
        totalBeans,
        totalRatings,
        averageRating,
        favoriteRoaster,
        favoriteOrigin,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, this would update the app's theme
    Alert.alert('Coming Soon', 'Dark mode will be available in a future update.');
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // In a real app, this would update notification settings
  };

  const handleLogout = () => {
    Alert.alert('Coming Soon', 'User authentication will be available in a future update.');
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'Are you sure you want to delete all your coffee bean data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would clear all user data
            Alert.alert('Coming Soon', 'This feature will be available in a future update.');
          }
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
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
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Icon
              name="user-circle"
              type="font-awesome"
              size={80}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.profileName}>Coffee Enthusiast</Text>
          <Text style={styles.profileSubtitle}>Bean Explorer</Text>
        </View>
        
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Coffee Journey</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.totalBeans}</Text>
              <Text style={styles.statLabel}>Beans Scanned</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.totalRatings}</Text>
              <Text style={styles.statLabel}>Beans Rated</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.averageRating}</Text>
              <Text style={styles.statLabel}>Avg. Rating</Text>
            </View>
          </View>
          
          {/* Favorites */}
          <View style={styles.favoritesContainer}>
            {userStats.favoriteRoaster && (
              <View style={styles.favoriteItem}>
                <Icon name="heart" type="font-awesome" size={16} color={COLORS.accent} />
                <Text style={styles.favoriteLabel}>Favorite Roaster:</Text>
                <Text style={styles.favoriteValue}>{userStats.favoriteRoaster}</Text>
              </View>
            )}
            
            {userStats.favoriteOrigin && (
              <View style={styles.favoriteItem}>
                <Icon name="map-marker" type="font-awesome" size={16} color={COLORS.accent} />
                <Text style={styles.favoriteLabel}>Favorite Origin:</Text>
                <Text style={styles.favoriteValue}>{userStats.favoriteOrigin}</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Settings Section */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Icon name="moon-o" type="font-awesome" size={20} color={COLORS.text} />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: COLORS.backgroundDark, true: COLORS.primaryLight }}
              thumbColor={darkMode ? COLORS.primary : COLORS.card}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Icon name="bell" type="font-awesome" size={20} color={COLORS.text} />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: COLORS.backgroundDark, true: COLORS.primaryLight }}
              thumbColor={notificationsEnabled ? COLORS.primary : COLORS.card}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Account Actions */}
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Coming Soon', 'This feature will be available in a future update.')}>
            <Icon name="cog" type="font-awesome" size={20} color={COLORS.text} />
            <Text style={styles.actionButtonText}>Account Settings</Text>
            <Icon name="chevron-right" type="font-awesome" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Coming Soon', 'This feature will be available in a future update.')}>
            <Icon name="question-circle" type="font-awesome" size={20} color={COLORS.text} />
            <Text style={styles.actionButtonText}>Help & Support</Text>
            <Icon name="chevron-right" type="font-awesome" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Coming Soon', 'This feature will be available in a future update.')}>
            <Icon name="star" type="font-awesome" size={20} color={COLORS.text} />
            <Text style={styles.actionButtonText}>Rate the App</Text>
            <Icon name="chevron-right" type="font-awesome" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <Icon name="sign-out" type="font-awesome" size={20} color={COLORS.text} />
            <Text style={styles.actionButtonText}>Log Out</Text>
            <Icon name="chevron-right" type="font-awesome" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleDeleteData}>
            <Icon name="trash" type="font-awesome" size={20} color={COLORS.error} />
            <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Delete All Data</Text>
            <Icon name="chevron-right" type="font-awesome" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
        
        {/* App Info */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.appVersion}>Beanio v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2025 Beanio</Text>
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
    paddingBottom: SIZES.padding * 2,
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 2,
  },
  avatarContainer: {
    marginBottom: SIZES.padding,
  },
  profileName: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  profileSubtitle: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  statsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding * 2,
    ...SHADOWS.small,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  statLabel: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  favoritesContainer: {
    marginTop: SIZES.padding,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  favoriteLabel: {
    fontSize: SIZES.body3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SIZES.padding,
    marginRight: SIZES.base,
  },
  favoriteValue: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    flex: 1,
  },
  settingsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding * 2,
    ...SHADOWS.small,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    marginLeft: SIZES.padding,
  },
  divider: {
    marginVertical: SIZES.padding,
    backgroundColor: COLORS.backgroundDark,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
  },
  actionButtonText: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    marginLeft: SIZES.padding,
    flex: 1,
  },
  appInfoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 2,
  },
  appVersion: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    marginBottom: SIZES.base,
  },
  appCopyright: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
});
