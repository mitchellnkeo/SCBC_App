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
import { InfoCard } from '../../components/common/Card';

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
          <Text style={dynamicStyles.title}>About Seattle Chinatown Book Club</Text>
        </View>

        {/* Main Content */}
        <InfoCard>
          <Text style={dynamicStyles.description}>
            Seattle Chinatown Book Club is an AANHPI centered book club found in the heart of Seattle's Chinatown International-District at Mam's Bookstore. We are more than a book club -- we are a community.
          </Text>
        </InfoCard>

        {/* Mission Section */}
        <InfoCard>
          <Text style={dynamicStyles.sectionTitle}>Our Mission</Text>
          <Text style={dynamicStyles.missionText}>
            We bring together Seattle to explore diverse voices, share stories, and build community through the power of literature. Our focus on AANHPI (Asian American, Native Hawaiian, and Pacific Islander) perspectives helps amplify underrepresented voices while creating meaningful connections in our neighborhood and beyond the book club itself.
          </Text>
        </InfoCard>

        <View style={dynamicStyles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

export default AboutSCBCScreen; 