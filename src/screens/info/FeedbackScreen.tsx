import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopNavbar from '../../components/navigation/TopNavbar';
import { useTheme } from '../../contexts/ThemeContext';

const FeedbackScreen: React.FC = () => {
  const { theme } = useTheme();
  const googleFormUrl = 'https://forms.gle/HaEBssqiNL6eMq9LA'; // Replace with your actual Google Form URL

  const handleOpenForm = async () => {
    try {
      const supported = await Linking.canOpenURL(googleFormUrl);
      if (supported) {
        await Linking.openURL(googleFormUrl);
      } else {
        Alert.alert('Error', 'Unable to open the feedback form. Please try again later.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open the feedback form. Please try again later.');
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
    content: {
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
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
      fontSize: 18,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    mainContent: {
      marginBottom: 32,
    },
    description: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 24,
      marginBottom: 24,
      textAlign: 'center',
    },
    benefitsSection: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    benefitsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    benefitsList: {
      gap: 12,
    },
    benefitItem: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 22,
    },
    encouragement: {
      backgroundColor: theme.primaryLight + '20', // Light primary background
      borderRadius: 12,
      padding: 20,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    encouragementText: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 24,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    ctaSection: {
      alignItems: 'center',
      marginBottom: 32,
    },
    feedbackButton: {
      backgroundColor: theme.primary,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
      marginBottom: 12,
    },
    feedbackButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    formNote: {
      fontSize: 14,
      color: theme.textTertiary,
      textAlign: 'center',
    },
    additionalInfo: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    infoText: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <TopNavbar />
      <ScrollView 
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>Community Feedback</Text>
          <Text style={dynamicStyles.subtitle}>
            Help us make SCBC even better!
          </Text>
        </View>

        {/* Call to Action - Moved to Top */}
        <View style={dynamicStyles.ctaSection}>
          <TouchableOpacity
            style={dynamicStyles.feedbackButton}
            onPress={handleOpenForm}
            activeOpacity={0.8}
          >
            <Text style={dynamicStyles.feedbackButtonText}>Share Your Feedback</Text>
          </TouchableOpacity>
          
          <Text style={dynamicStyles.formNote}>
            Opens in your browser • Takes 2-3 minutes • Anonymous option available
          </Text>
        </View>

        {/* Main Content */}
        <View style={dynamicStyles.mainContent}>
          <Text style={dynamicStyles.description}>
            Your voice matters to us! 
            Whether you have suggestions for book selections, event improvements, new features for our app, 
            or general thoughts about your experience with SCBC, we want to hear from you.
          </Text>

          <View style={dynamicStyles.benefitsSection}>
            <Text style={dynamicStyles.benefitsTitle}>Your feedback helps us:</Text>
            <View style={dynamicStyles.benefitsList}>
              <Text style={dynamicStyles.benefitItem}>Choose better books for our monthly selections.</Text>
              <Text style={dynamicStyles.benefitItem}>Plan more engaging events and discussions.</Text>
              <Text style={dynamicStyles.benefitItem}>Improve our app features and user experience.</Text>
              <Text style={dynamicStyles.benefitItem}>Build a stronger, more inclusive community.</Text>
              <Text style={dynamicStyles.benefitItem}>Create new opportunities for connection.</Text>
            </View>
          </View>

          <View style={dynamicStyles.encouragement}>
            <Text style={dynamicStyles.encouragementText}>
              Every piece of feedback is valuable - from quick suggestions to detailed thoughts. 
              Your input directly shapes the future of our book club community.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FeedbackScreen; 