import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as ImagePickerExpo from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface ImagePickerProps {
  value?: string;
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
  label?: string;
  placeholder?: string;
}

const ImagePicker: React.FC<ImagePickerProps> = ({
  value,
  onImageSelected,
  onImageRemoved,
  label = "Event Header Photo",
  placeholder = "Add a photo to make your event stand out"
}) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePickerExpo.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Sorry, we need camera roll permissions to make this work!'
      );
      return false;
    }
    return true;
  };

  const showImageOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose how you\'d like to add a photo',
      [
        {
          text: 'Camera',
          onPress: openCamera,
        },
        {
          text: 'Photo Library',
          onPress: openImagePicker,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const cameraPermission = await ImagePickerExpo.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Sorry, we need camera permissions to take photos!'
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await ImagePickerExpo.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera');
    } finally {
      setIsLoading(false);
    }
  };

  const openImagePicker = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePickerExpo.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening image picker:', error);
      Alert.alert('Error', 'Failed to open image picker');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: onImageRemoved, style: 'destructive' },
      ]
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    imageContainer: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.surface,
      borderWidth: 2,
      borderColor: value ? theme.border : theme.borderLight,
      borderStyle: value ? 'solid' : 'dashed',
    },
    selectedImage: {
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlayButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    overlayButton: {
      backgroundColor: 'rgba(255,255,255,0.9)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    overlayButtonText: {
      color: theme.text,
      fontWeight: '600',
      fontSize: 14,
    },
    placeholderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    placeholderIcon: {
      marginBottom: 12,
    },
    placeholderTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    placeholderSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    selectButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    selectButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 14,
    },
    loadingText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.label}>{label}</Text>
      
      <View style={dynamicStyles.imageContainer}>
        {value ? (
          <View style={dynamicStyles.selectedImage}>
            <Image source={{ uri: value }} style={dynamicStyles.image} />
            <TouchableOpacity 
              style={dynamicStyles.imageOverlay}
              onPress={showImageOptions}
              activeOpacity={0.8}
            >
              <View style={dynamicStyles.overlayButtons}>
                <View style={dynamicStyles.overlayButton}>
                  <MaterialCommunityIcons 
                    name="camera" 
                    size={16} 
                    color={theme.text} 
                  />
                  <Text style={dynamicStyles.overlayButtonText}>Change</Text>
                </View>
                <TouchableOpacity 
                  style={dynamicStyles.overlayButton}
                  onPress={handleRemoveImage}
                >
                  <MaterialCommunityIcons 
                    name="delete" 
                    size={16} 
                    color={theme.text} 
                  />
                  <Text style={dynamicStyles.overlayButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={dynamicStyles.placeholderContainer}
            onPress={showImageOptions}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="camera-plus" 
              size={48} 
              color={theme.textTertiary} 
              style={dynamicStyles.placeholderIcon}
            />
            <Text style={dynamicStyles.placeholderTitle}>Add Photo</Text>
            <Text style={dynamicStyles.placeholderSubtitle}>{placeholder}</Text>
            <View style={dynamicStyles.selectButton}>
              <MaterialCommunityIcons 
                name="image-plus" 
                size={16} 
                color="white" 
              />
              <Text style={dynamicStyles.selectButtonText}>Select Photo</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
      
      {isLoading && (
        <Text style={dynamicStyles.loadingText}>Processing image...</Text>
      )}
    </View>
  );
};

export default ImagePicker; 