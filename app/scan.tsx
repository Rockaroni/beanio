import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Button, Icon } from '@rneui/themed';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { COLORS, SIZES, SHADOWS } from '../src/styles/theme';
import { analyzeCoffeeBeanImage } from '../src/services/geminiService';
import { saveBean } from '../src/services/storageService';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const cameraRef = useRef(null);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Simulate progress for better UX during analysis
  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setAnalyzeProgress((prev) => {
          const newProgress = prev + 0.05;
          return newProgress > 0.9 ? 0.9 : newProgress;
        });
      }, 300);
    } else {
      setAnalyzeProgress(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        setCapturedImage(photo);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setCapturedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    try {
      // Get base64 image data
      let base64Image = capturedImage.base64;
      
      // If base64 is not available, read the file
      if (!base64Image && capturedImage.uri) {
        const fileInfo = await FileSystem.getInfoAsync(capturedImage.uri);
        if (fileInfo.exists) {
          base64Image = await FileSystem.readAsStringAsync(capturedImage.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
      }

      if (!base64Image) {
        throw new Error('Could not get image data');
      }

      // Analyze the image
      const analysisResult = await analyzeCoffeeBeanImage(base64Image);
      
      if (!analysisResult) {
        throw new Error('Analysis failed');
      }

      // Save the bean with image URI
      const beanId = Date.now().toString();
      const bean = {
        id: beanId,
        imageUri: capturedImage.uri,
        scannedAt: new Date().toISOString(),
        ...analysisResult,
      };

      await saveBean(beanId, bean);
      
      // Navigate to bean detail screen
      router.push({
        pathname: '/bean-detail',
        params: { beanId }
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert(
        'Analysis Failed',
        'Could not analyze the coffee bean. Please try again or take a clearer picture.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const toggleFlash = () => {
    setFlash(
      flash === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <Text style={styles.instructionText}>
          Please enable camera permissions in your device settings to use this feature.
        </Text>
        <Button
          title="Pick from Gallery Instead"
          icon={{ name: 'image', type: 'font-awesome', color: 'white' }}
          buttonStyle={styles.galleryButton}
          onPress={pickImage}
        />
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
        <Text style={styles.headerTitle}>Scan Coffee Bean</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Camera or Image Preview */}
      <View style={styles.cameraContainer}>
        {!capturedImage ? (
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={cameraType}
            flashMode={flash}
            ratio="4:3"
          >
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
                <Icon name="refresh" type="font-awesome" size={20} color={COLORS.white} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
                <Icon 
                  name={flash === Camera.Constants.FlashMode.on ? "flash" : "flash-off"} 
                  type="material" 
                  size={20} 
                  color={COLORS.white} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.scanOverlay}>
              <View style={styles.scanFrame} />
            </View>
          </Camera>
        ) : (
          <View style={styles.previewContainer}>
            <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {!capturedImage ? (
          <>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <Icon name="image" type="font-awesome" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <View style={styles.placeholder} />
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={resetCamera}>
              <Icon name="refresh" type="font-awesome" size={24} color={COLORS.error} />
              <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, isAnalyzing && styles.disabledButton]} 
              onPress={analyzeImage}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <ActivityIndicator size="small" color={COLORS.white} />
                  <Text style={styles.actionButtonText}>
                    Analyzing... {Math.round(analyzeProgress * 100)}%
                  </Text>
                </>
              ) : (
                <>
                  <Icon name="check" type="font-awesome" size={24} color={COLORS.success} />
                  <Text style={[styles.actionButtonText, { color: COLORS.success }]}>Analyze</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
      
      {/* Instructions */}
      {!capturedImage && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to scan:</Text>
          <Text style={styles.instructionText}>
            1. Position the coffee bean bag within the frame
          </Text>
          <Text style={styles.instructionText}>
            2. Make sure the label is clearly visible
          </Text>
          <Text style={styles.instructionText}>
            3. Hold steady and tap the capture button
          </Text>
        </View>
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
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: SIZES.radius,
    margin: SIZES.padding,
    ...SHADOWS.medium,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SIZES.padding,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: '80%',
    height: '60%',
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: SIZES.radius,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    margin: SIZES.base,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
  },
  actionButtonText: {
    marginLeft: SIZES.base,
    fontSize: SIZES.body3,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  instructionsContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.card,
    margin: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
  },
  instructionsTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  instructionText: {
    fontSize: SIZES.body4,
    color: COLORS.text,
    marginBottom: SIZES.base / 2,
  },
  errorText: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: SIZES.base,
  },
});
