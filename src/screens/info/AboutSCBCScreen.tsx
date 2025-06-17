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
import { useTheme } from '../../contexts/ThemeContext';

type NavigationProp = StackNavigationProp<MainStackParamList>;

const AboutSCBCScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

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
      lineHeight: 36,
    },
    contentCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    description: {
      fontSize: 18,
      color: theme.textSecondary,
      lineHeight: 28,
      textAlign: 'center',
      marginBottom: 24,
    },
    highlightBox: {
      backgroundColor: theme.primaryLight + '20', // Light primary background
      borderRadius: 12,
      padding: 20,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    highlightText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 8,
      lineHeight: 24,
    },
    missionCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    missionText: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 26,
      textAlign: 'center',
    },
    locationCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    locationInfo: {
      alignItems: 'center',
    },
    locationName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 8,
    },
    locationAddress: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    bottomSpacer: {
      height: 32,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Top Navigation */}
      <TopNavbar title="About SCBC" />
      
      <ScrollView 
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.emoji}>📚</Text>
          <Text style={dynamicStyles.title}>About Seattle Chinatown Book Club</Text>
        </View>

        {/* Main Content */}
        <View style={dynamicStyles.contentCard}>
          <Text style={dynamicStyles.description}>
            Seattle Chinatown Book Club is an AANHPI centered book club found in the heart of Seattle's Chinatown International-District at Mam's Bookstore.
          </Text>
          
          <View style={dynamicStyles.highlightBox}>
            <Text style={dynamicStyles.highlightText}>
              🏮 Located in Seattle's Historic Chinatown International-District
            </Text>
            <Text style={dynamicStyles.highlightText}>
              📖 Hosted at Mam's Bookstore
            </Text>
            <Text style={dynamicStyles.highlightText}>
              🌏 AANHPI Centered Community
            </Text>
          </View>
        </View>

        {/* Mission Section */}
        <View style={dynamicStyles.missionCard}>
          <Text style={dynamicStyles.sectionTitle}>Our Mission</Text>
          <Text style={dynamicStyles.missionText}>
            We bring together readers to explore diverse voices, share stories, and build community through the power of literature. Our focus on AANHPI (Asian American, Native Hawaiian, and Pacific Islander) perspectives helps amplify underrepresented voices while creating meaningful connections in our neighborhood.
          </Text>
        </View>

        {/* Location Section */}
        <View style={dynamicStyles.locationCard}>
          <Text style={dynamicStyles.sectionTitle}>Find Us</Text>
          <View style={dynamicStyles.locationInfo}>
            <Text style={dynamicStyles.locationName}>Mam's Bookstore</Text>
            <Text style={dynamicStyles.locationAddress}>
              Chinatown International-District{'\n'}
              Seattle, WA
            </Text>
          </View>
        </View>

        <View style={dynamicStyles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

export default AboutSCBCScreen; 