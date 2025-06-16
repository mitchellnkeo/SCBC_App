import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import TopNavbar from '../../components/navigation/TopNavbar';

type NavigationProp = StackNavigationProp<MainStackParamList>;

const AboutSCBCScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <TopNavbar title="About SCBC" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>📚</Text>
          <Text style={styles.title}>About Seattle Chinatown Book Club</Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentCard}>
          <Text style={styles.description}>
            Seattle Chinatown Book Club is an AANHPI centered book club found in the heart of Seattle's Chinatown International-District at Mam's Bookstore.
          </Text>
          
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              🏮 Located in Seattle's Historic Chinatown International-District
            </Text>
            <Text style={styles.highlightText}>
              📖 Hosted at Mam's Bookstore
            </Text>
            <Text style={styles.highlightText}>
              🌏 AANHPI Centered Community
            </Text>
          </View>
        </View>

        {/* Mission Section */}
        <View style={styles.missionCard}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            We bring together readers to explore diverse voices, share stories, and build community through the power of literature. Our focus on AANHPI (Asian American, Native Hawaiian, and Pacific Islander) perspectives helps amplify underrepresented voices while creating meaningful connections in our neighborhood.
          </Text>
        </View>

        {/* Location Section */}
        <View style={styles.locationCard}>
          <Text style={styles.sectionTitle}>Find Us</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>Mam's Bookstore</Text>
            <Text style={styles.locationAddress}>
              Chinatown International-District{'\n'}
              Seattle, WA
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
    lineHeight: 36,
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  description: {
    fontSize: 18,
    color: '#374151',
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 24,
  },
  highlightBox: {
    backgroundColor: '#fef3f2',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ec4899',
  },
  highlightText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24,
  },
  missionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  missionText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 26,
    textAlign: 'center',
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  locationInfo: {
    alignItems: 'center',
  },
  locationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ec4899',
    marginBottom: 8,
  },
  locationAddress: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default AboutSCBCScreen; 