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

const FeedbackScreen: React.FC = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      <TopNavbar />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>💬</Text>
          <Text style={styles.title}>Community Feedback</Text>
          <Text style={styles.subtitle}>
            Help us make SCBC even better!
          </Text>
        </View>

        {/* Call to Action - Moved to Top */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={handleOpenForm}
            activeOpacity={0.8}
          >
            <Text style={styles.feedbackButtonText}>📝 Share Your Feedback</Text>
          </TouchableOpacity>
          
          <Text style={styles.formNote}>
            Opens in your browser • Takes 2-3 minutes • Anonymous option available
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.description}>
            Your voice matters to us! The Seattle Chinatown Book Club thrives on community input and feedback. 
            Whether you have suggestions for book selections, event improvements, new features for our app, 
            or general thoughts about your experience with SCBC, we want to hear from you.
          </Text>

          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Your feedback helps us:</Text>
            <View style={styles.benefitsList}>
              <Text style={styles.benefitItem}>📚 Choose better books for our monthly selections</Text>
              <Text style={styles.benefitItem}>🎉 Plan more engaging events and discussions</Text>
              <Text style={styles.benefitItem}>📱 Improve our app features and user experience</Text>
              <Text style={styles.benefitItem}>🤝 Build a stronger, more inclusive community</Text>
              <Text style={styles.benefitItem}>✨ Create new opportunities for connection</Text>
            </View>
          </View>

          <View style={styles.encouragement}>
            <Text style={styles.encouragementText}>
              Every piece of feedback is valuable - from quick suggestions to detailed thoughts. 
              Your input directly shapes the future of our book club community.
            </Text>
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <Text style={styles.infoTitle}>Other ways to reach us:</Text>
          <Text style={styles.infoText}>
            • Speak with any board member at events{'\n'}
            • Email us directly through the Contact Info page{'\n'}
            • Share thoughts during our monthly discussions
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
  mainContent: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  benefitsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  encouragement: {
    backgroundColor: '#fef3f2',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ec4899',
  },
  encouragementText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ctaSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  feedbackButton: {
    backgroundColor: '#ec4899',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
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
    color: '#6b7280',
    textAlign: 'center',
  },
  additionalInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default FeedbackScreen; 