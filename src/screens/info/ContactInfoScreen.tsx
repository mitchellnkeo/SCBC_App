import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import TopNavbar from '../../components/navigation/TopNavbar';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../../components/common/Card';

type NavigationProp = StackNavigationProp<MainStackParamList>;

const ContactInfoScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const handleEmailPress = async () => {
    const email = 'seattlechinatownbookclub@gmail.com';
    const url = `mailto:${email}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Email not available', 'Please copy the email address manually.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open email client.');
    }
  };

  const handleInstagramPress = async () => {
    const username = 'seattlechinatownbookclub';
    const instagramUrl = `instagram://user?username=${username}`;
    const webUrl = `https://www.instagram.com/${username}`;
    
    try {
      const supported = await Linking.canOpenURL(instagramUrl);
      if (supported) {
        await Linking.openURL(instagramUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open Instagram.');
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
      paddingTop: 20,
    },
    emoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    contactSection: {
      marginBottom: 24,
    },
    contactCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    nonClickable: {
      // No special styling for non-clickable cards
    },
    contactIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.primaryLight + '20', // Light primary background
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    iconText: {
      fontSize: 24,
    },
    contactContent: {
      flex: 1,
    },
    contactTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 4,
    },
    contactValue: {
      fontSize: 18,
      color: theme.text,
      fontWeight: '500',
    },
    clickableText: {
      color: theme.primary,
    },
    tapHint: {
      fontSize: 12,
      color: theme.textTertiary,
      marginTop: 2,
    },
    chevron: {
      fontSize: 24,
      color: theme.textTertiary,
      marginLeft: 8,
    },
    infoCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    infoTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    infoText: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 26,
      textAlign: 'center',
      marginBottom: 20,
    },
    responseInfo: {
      backgroundColor: theme.success + '10', // Light success background
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: theme.success,
    },
    responseText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
      lineHeight: 20,
    },
    bottomSpacer: {
      height: 32,
    },
  });

  const ContactCard: React.FC<{
    icon: string;
    title: string;
    value: string;
    onPress?: () => void;
    isClickable?: boolean;
  }> = ({ icon, title, value, onPress, isClickable = false }) => (
    <TouchableOpacity
      style={[dynamicStyles.contactCard, !isClickable && dynamicStyles.nonClickable]}
      onPress={isClickable ? onPress : undefined}
      activeOpacity={isClickable ? 0.7 : 1}
      disabled={!isClickable}
    >
      <View style={dynamicStyles.contactIcon}>
        <Text style={dynamicStyles.iconText}>{icon}</Text>
      </View>
      <View style={dynamicStyles.contactContent}>
        <Text style={dynamicStyles.contactTitle}>{title}</Text>
        <Text style={[dynamicStyles.contactValue, isClickable && dynamicStyles.clickableText]}>
          {value}
        </Text>
        {isClickable && (
          <Text style={dynamicStyles.tapHint}>Tap to open</Text>
        )}
      </View>
      {isClickable && (
        <Text style={dynamicStyles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={dynamicStyles.container}>
      {/* Top Navigation */}
      <TopNavbar title="Contact Info" />
      
      <ScrollView 
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>Contact Information</Text>
          <Text style={dynamicStyles.subtitle}>Get in touch with Seattle Chinatown Book Club</Text>
        </View>

        {/* Contact Cards */}
        <View style={dynamicStyles.contactSection}>
          <ContactCard
            icon="👤"
            title="Founder"
            value="Mitchell Keo"
            isClickable={false}
          />

          <ContactCard
            icon="📧"
            title="Email"
            value="seattlechinatownbookclub@gmail.com"
            onPress={handleEmailPress}
            isClickable={true}
          />

          <ContactCard
            icon="📱"
            title="Instagram"
            value="@seattlechinatownbookclub"
            onPress={handleInstagramPress}
            isClickable={true}
          />
        </View>

        {/* Additional Info */}
        <View style={dynamicStyles.infoCard}>
          <Text style={dynamicStyles.infoTitle}>Connect With Us</Text>
          <Text style={dynamicStyles.infoText}>
            We'd love to hear from you! Whether you have questions about upcoming events, book recommendations, or want to get involved with our community, don't hesitate to reach out.
          </Text>
        </View>

        <View style={dynamicStyles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

export default ContactInfoScreen; 