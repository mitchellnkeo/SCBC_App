import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface ProfilePictureProps {
  imageUrl?: string | null;
  displayName: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  onPress?: () => void;
  showBorder?: boolean;
  style?: any;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  imageUrl,
  displayName,
  size = 'medium',
  onPress,
  showBorder = false,
  style,
}) => {
  // Get size dimensions
  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, borderRadius: 16 };
      case 'medium':
        return { width: 48, height: 48, borderRadius: 24 };
      case 'large':
        return { width: 80, height: 80, borderRadius: 40 };
      case 'xlarge':
        return { width: 120, height: 120, borderRadius: 60 };
      default:
        return { width: 48, height: 48, borderRadius: 24 };
    }
  };

  // Get font size based on container size
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'medium':
        return 18;
      case 'large':
        return 28;
      case 'xlarge':
        return 40;
      default:
        return 18;
    }
  };

  // Generate initials from display name
  const getInitials = (name: string) => {
    if (!name) return '?';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Generate consistent background color based on name
  const getBackgroundColor = (name: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  const dimensions = getDimensions();
  const fontSize = getFontSize();
  const initials = getInitials(displayName);
  const backgroundColor = getBackgroundColor(displayName);

  const containerStyle = [
    styles.container,
    dimensions,
    showBorder && styles.border,
    { backgroundColor: imageUrl ? 'transparent' : backgroundColor },
    style,
  ];

  const content = (
    <View style={containerStyle}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, dimensions]}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.initials, { fontSize, color: 'white' }]}>
          {initials}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontWeight: '600',
    textAlign: 'center',
  },
  border: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
});

export default ProfilePicture; 