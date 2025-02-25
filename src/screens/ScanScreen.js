import React, { useState, useEffect, useRef } from 'react';
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
import { COLORS, SIZES, SHADOWS } from '../styles/theme';
import { analyzeCoffeeBeanImage } from '../services/geminiService';
import { saveBeanInfo } from '../services/storageService';

const ScanScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      // Request camera permissions
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Request media library permissions for picking images
      if (Platform.OS !== 'web') {
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libraryStatus !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images!');
        }
      }
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          exif: true,
        });
        setCapturedImage(photo);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      } finally {
        setIsCapturing(false);
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
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
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
      let base64Data;
      if (capturedImage.base64) {
        base64Data = capturedImage.base64;
      } else {
        // If base64 is not available, read the file and convert to base64
        const fileContent = await FileSystem.readAsStringAsync(capturedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        base64Data = fileContent;
      }
      
      // Analyze the image using Gemini Vision AI
      const beanInfo = await analyzeCoffeeBeanImage(base64Data);
      
      // Add image URI to bean info
      const beanInfoWithImage = {
        ...beanInfo,
        imageUri: capturedImage.uri,
      };
      
      // Save the bean info to storage
      const beanId = await saveBeanInfo(beanInfoWithImage);
      
      // Navigate to bean detail screen
      navigation.navigate('BeanDetail', { beanId });
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert(
        'Analysis Failed',
        'We couldn\'t analyze this coffee bean image. Please try again with a clearer image of the coffee bag.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const toggleFlashMode = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <Text style={styles.permissionSubtext}>
          We need camera permission to scan coffee bean bags. Please enable camera access in your device settings.
        </Text>
        <Button
          title="Upload from Gallery Instead"
          icon={{ name: 'image', type: 'font-awesome', color: 'white' }}
          buttonStyle={styles.galleryButton}
          onPress={pickImage}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {capturedImage ? (
        // Preview captured image
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />
          
          <View style={styles.previewOverlay}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Coffee Bean Preview</Text>
            </View>
            
            <View style={styles.previewActions}>
              {isAnalyzing ? (
                <View style={styles.analyzingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.analyzingText}>Analyzing coffee bean...</Text>
                </View>
              ) : (
                <>
                  <Button
                    title="Retake"
                    icon={{ name: 'camera', type: 'font-awesome', color: COLORS.text }}
                    buttonStyle={[styles.previewButton, styles.retakeButton]}
                    titleStyle={{ color: COLORS.text }}
                    onPress={retakePhoto}
                  />
                  <Button
                    title="Analyze Bean"
                    icon={{ name: 'search', type: 'font-awesome', color: 'white' }}
                    buttonStyle={[styles.previewButton, styles.analyzeButton]}
                    onPress={analyzeImage}
                  />
                </>
              )}
            </View>
          </View>
        </View>
      ) : (
        // Camera view
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={cameraType}
            flashMode={flashMode}
            ratio="4:3"
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Icon name="arrow-left" type="font-awesome" color="white" size={20} />
                </TouchableOpacity>
                
                <Text style={styles.cameraTitle}>Scan Coffee Bean</Text>
                
                <TouchableOpacity
                  style={styles.flashButton}
                  onPress={toggleFlashMode}
                >
                  <Icon
                    name={flashMode === Camera.Constants.FlashMode.on ? 'flash' : 'flash-off'}
                    type="material-community"
                    color="white"
                    size={24}
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.scanFrame}>
                <View style={styles.scanCorner} />
                <View style={[styles.scanCorner, styles.topRight]} />
                <View style={[styles.scanCorner, styles.bottomLeft]} />
                <View style={[styles.scanCorner, styles.bottomRight]} />
              </View>
              
              <View style={styles.cameraFooter}>
                <TouchableOpacity
                  style={styles.galleryPickButton}
                  onPress={pickImage}
                >
                  <Icon name="image" type="font-awesome" color="white" size={24} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                  disabled={isCapturing}
                >
                  {isCapturing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <View style={styles.captureButtonInner} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.flipButton}
                  onPress={toggleCameraType}
                >
                  <Icon name="camera-party-mode" type="material-community" color="white" size={24} />
                </TouchableOpacity>
              </View>
            </View>
          </Camera>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  permissionText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SIZES.spacingXXLarge,
  },
  permissionSubtext: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: 'center',
    marginHorizontal: SIZES.spacingXLarge,
    marginTop: SIZES.spacingMedium,
  },
  galleryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    marginHorizontal: SIZES.spacingXLarge,
    marginTop: SIZES.spacingXLarge,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacingMedium,
  },
  backButton: {
    padding: SIZES.spacing,
  },
  cameraTitle: {
    color: 'white',
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  flashButton: {
    padding: SIZES.spacing,
  },
  scanFrame: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'white',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    top: 0,
    left: 0,
  },
  topRight: {
    right: 0,
    left: undefined,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    top: undefined,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: undefined,
    left: undefined,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  cameraFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SIZES.spacingXLarge,
  },
  galleryPickButton: {
    padding: SIZES.spacing,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  flipButton: {
    padding: SIZES.spacing,
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  previewHeader: {
    alignItems: 'center',
    padding: SIZES.spacingMedium,
  },
  previewTitle: {
    color: 'white',
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SIZES.spacingLarge,
  },
  previewButton: {
    paddingHorizontal: SIZES.spacingLarge,
    borderRadius: SIZES.borderRadius,
  },
  retakeButton: {
    backgroundColor: 'white',
  },
  analyzeButton: {
    backgroundColor: COLORS.primary,
  },
  analyzingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacingLarge,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: SIZES.borderRadius,
    width: '100%',
  },
  analyzingText: {
    marginTop: SIZES.spacingMedium,
    color: COLORS.text,
    fontSize: SIZES.medium,
  },
});

export default ScanScreen;
