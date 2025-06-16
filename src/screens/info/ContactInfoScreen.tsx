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

type NavigationProp = StackNavigationProp<MainStackParamList>;

const ContactInfoScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

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

  const ContactCard: React.FC<{
    icon: string;
    title: string;
    value: string;
    onPress?: () => void;
    isClickable?: boolean;
  }> = ({ icon, title, value, onPress, isClickable = false }) => (
    <TouchableOpacity
      style={[styles.contactCard, !isClickable && styles.nonClickable]}
      onPress={isClickable ? onPress : undefined}
      activeOpacity={isClickable ? 0.7 : 1}
      disabled={!isClickable}
    >
      <View style={styles.contactIcon}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={[styles.contactValue, isClickable && styles.clickableText]}>
          {value}
        </Text>
        {isClickable && (
          <Text style={styles.tapHint}>Tap to open</Text>
        )}
      </View>
      {isClickable && (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <TopNavbar title="Contact Info" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>📞</Text>
          <Text style={styles.title}>Contact Information</Text>
          <Text style={styles.subtitle}>Get in touch with Seattle Chinatown Book Club</Text>
        </View>

        {/* Contact Cards */}
        <View style={styles.contactSection}>
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
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Connect With Us</Text>
          <Text style={styles.infoText}>
            We'd love to hear from you! Whether you have questions about upcoming events, book recommendations, or want to get involved with our community, don't hesitate to reach out.
          </Text>
          
          <View style={styles.responseInfo}>
            <Text style={styles.responseText}>
              📬 We typically respond within 24-48 hours
            </Text>
            <Text style={styles.responseText}>
              🌟 Follow us on Instagram for the latest updates
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  contactSection: {
    marginBottom: 24,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nonClickable: {
    // No special styling for non-clickable cards
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3f2',
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
    color: '#374151',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 18,
    color: '#1f2937',
    fontWeight: '500',
  },
  clickableText: {
    color: '#ec4899',
  },
  tapHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: '#d1d5db',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 20,
  },
  responseInfo: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  responseText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default ContactInfoScreen; 