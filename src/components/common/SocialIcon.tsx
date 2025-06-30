import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { FontAwesome6, FontAwesome } from '@expo/vector-icons';
import { type SocialPlatform, getPlatformIconName } from '../../utils/socialMediaUtils';

interface SocialIconProps {
  platform: SocialPlatform;
  size?: number;
  color?: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({ 
  platform, 
  size = 16, 
  color = '#374151' 
}) => {
  // Custom colors for each platform (official brand colors)
  const brandColors: Record<SocialPlatform, string> = {
    instagram: '#E4405F',
    x: '#000000', // X's black color
    linkedin: '#0077B5',
  };

  const iconColor = color === '#374151' ? brandColors[platform] : color;

  // Handle platform-specific icon rendering
  switch (platform) {
    case 'instagram':
      return (
        <FontAwesome
          name="instagram"
          size={size}
          color={iconColor}
          style={styles.icon}
        />
      );
    
    case 'x':
      // For X, we'll use the Unicode character since FontAwesome might not have x-twitter yet
      return (
        <Text style={[styles.icon, { fontSize: size * 0.9, color: iconColor, fontWeight: 'bold' }]}>
          𝕏
        </Text>
      );
    
    case 'linkedin':
      return (
        <FontAwesome
          name="linkedin"
          size={size}
          color={iconColor}
          style={styles.icon}
        />
      );
    
    default:
      return (
        <FontAwesome
          name="link"
          size={size}
          color={iconColor}
          style={styles.icon}
        />
      );
  }
};

const styles = StyleSheet.create({
  icon: {
    marginRight: 8,
    width: 20, // Fixed width for consistent alignment
    textAlign: 'center',
  },
});

export default SocialIcon; 