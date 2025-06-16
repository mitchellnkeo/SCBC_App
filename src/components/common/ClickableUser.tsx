import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import ProfilePicture from './ProfilePicture';

type NavigationProp = StackNavigationProp<MainStackParamList>;

interface ClickableUserProps {
  userId: string;
  displayName: string;
  profilePicture?: string;
  showAvatar?: boolean;
  showName?: boolean;
  avatarSize?: 'small' | 'medium' | 'large';
  textStyle?: any;
  containerStyle?: any;
  disabled?: boolean;
}

const ClickableUser: React.FC<ClickableUserProps> = ({
  userId,
  displayName,
  profilePicture,
  showAvatar = true,
  showName = true,
  avatarSize = 'small',
  textStyle,
  containerStyle,
  disabled = false,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    if (disabled) return;
    navigation.navigate('UserProfile', { userId });
  };

  if (!showAvatar && !showName) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      {showAvatar && (
        <ProfilePicture
          imageUrl={profilePicture}
          displayName={displayName}
          size={avatarSize}
          showBorder={false}
        />
      )}
      {showName && (
        <Text style={[styles.name, textStyle]} numberOfLines={1}>
          {displayName}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
});

export default ClickableUser; 