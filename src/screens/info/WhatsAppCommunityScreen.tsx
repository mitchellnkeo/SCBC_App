import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import TopNavbar from '../../components/navigation/TopNavbar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { whatsappService } from '../../services/whatsappService';

const WhatsAppCommunityScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [whatsappLink, setWhatsappLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editLink, setEditLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadWhatsAppLink = async () => {
    try {
      setIsLoading(true);
      await whatsappService.initializeWhatsAppCommunity();
      const community = await whatsappService.getWhatsAppCommunity();
      const link = community?.isActive && community?.inviteLink ? community.inviteLink : '';
      setWhatsappLink(link);
      setEditLink(link);
    } catch (error) {
      console.error('Error loading WhatsApp link:', error);
      setWhatsappLink('');
      setEditLink('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinWhatsApp = async () => {
    if (!whatsappLink) {
      Alert.alert('Not Available', 'The WhatsApp community link is not available at the moment. Please check back later.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(whatsappLink);
      if (supported) {
        await Linking.openURL(whatsappLink);
      } else {
        Alert.alert('Error', 'Unable to open WhatsApp. Please make sure WhatsApp is installed on your device.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open WhatsApp link. Please try again later.');
    }
  };

  const handleEditPress = () => {
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      
      await whatsappService.updateWhatsAppCommunity({
        inviteLink: editLink,
        isActive: !!editLink,
        description: 'Join our WhatsApp community to stay connected with fellow book club members!',
        updatedBy: user.id,
      });

      setWhatsappLink(editLink);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'WhatsApp community link updated successfully');
    } catch (error) {
      console.error('Error updating WhatsApp link:', error);
      Alert.alert('Error', 'Failed to update WhatsApp community link');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditLink(whatsappLink);
    setIsEditModalVisible(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadWhatsAppLink();
    }, [])
  );

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
    ctaSection: {
      alignItems: 'center',
      marginBottom: 32,
    },
    whatsappButton: {
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
    whatsappButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    buttonNote: {
      fontSize: 14,
      color: theme.textTertiary,
      textAlign: 'center',
    },
    unavailableCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    unavailableTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textSecondary,
      marginBottom: 8,
    },
    unavailableText: {
      fontSize: 16,
      color: theme.textTertiary,
      textAlign: 'center',
      lineHeight: 24,
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
      backgroundColor: theme.primary + '20',
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
    adminSection: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      marginTop: 24,
      borderWidth: 1,
      borderColor: theme.border,
    },
    adminTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    editButton: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
    },
    editButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 24,
      marginHorizontal: 20,
      width: '90%',
      maxWidth: 400,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    saveButton: {
      backgroundColor: theme.primary,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <TopNavbar title="WhatsApp Community Chat" />
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={dynamicStyles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <TopNavbar title="WhatsApp Community Chat" />
      <ScrollView 
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>WhatsApp Community</Text>
          <Text style={dynamicStyles.subtitle}>
            Connect with fellow book lovers!
          </Text>
        </View>

        {whatsappLink ? (
          <View style={dynamicStyles.ctaSection}>
            <TouchableOpacity
              style={dynamicStyles.whatsappButton}
              onPress={handleJoinWhatsApp}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.whatsappButtonText}>Join WhatsApp Community</Text>
            </TouchableOpacity>
            
            <Text style={dynamicStyles.buttonNote}>
              Opens WhatsApp • Join our community chat • Stay connected
            </Text>
          </View>
        ) : (
          <View style={dynamicStyles.ctaSection}>
            <View style={dynamicStyles.unavailableCard}>
              <Text style={dynamicStyles.unavailableTitle}>Community Not Available</Text>
              <Text style={dynamicStyles.unavailableText}>
                The WhatsApp community is not currently available. Please check back later.
              </Text>
            </View>
          </View>
        )}

        <View style={dynamicStyles.mainContent}>
          <Text style={dynamicStyles.description}>
            Join our WhatsApp community to stay connected with fellow book club members between meetings! 
            Share thoughts, get updates, and be part of our growing literary community.
          </Text>

          <View style={dynamicStyles.benefitsSection}>
            <Text style={dynamicStyles.benefitsTitle}>In our WhatsApp community:</Text>
            <View style={dynamicStyles.benefitsList}>
              <Text style={dynamicStyles.benefitItem}>Get quick updates about upcoming events and meetings</Text>
              <Text style={dynamicStyles.benefitItem}>Share book recommendations and reading thoughts</Text>
              <Text style={dynamicStyles.benefitItem}>Connect with other members between meetings</Text>
              <Text style={dynamicStyles.benefitItem}>Ask questions and get quick responses</Text>
              <Text style={dynamicStyles.benefitItem}>Stay in the loop with community news</Text>
            </View>
          </View>

          <View style={dynamicStyles.encouragement}>
            <Text style={dynamicStyles.encouragementText}>
              Our WhatsApp community is a welcoming space for all book lovers. 
              Join us for casual conversations, book discussions, and community updates!
            </Text>
          </View>
        </View>

        {isAdmin && (
          <View style={dynamicStyles.adminSection}>
            <Text style={dynamicStyles.adminTitle}>Admin Controls</Text>
            <TouchableOpacity
              style={dynamicStyles.editButton}
              onPress={handleEditPress}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.editButtonText}>
                {whatsappLink ? 'Edit WhatsApp Link' : 'Setup WhatsApp Link'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContainer}>
            <Text style={dynamicStyles.modalTitle}>Edit WhatsApp Community Link</Text>
            
            <Text style={dynamicStyles.label}>WhatsApp Invite Link</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={editLink}
              onChangeText={setEditLink}
              placeholder="https://chat.whatsapp.com/..."
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="none"
              keyboardType="url"
            />

            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.cancelButton]}
                onPress={handleCancelEdit}
                disabled={isSaving}
              >
                <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.saveButton]}
                onPress={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={dynamicStyles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default WhatsAppCommunityScreen; 