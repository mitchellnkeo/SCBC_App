import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

interface AddressActionProps {
  address: string;
  children: React.ReactNode;
  style?: any;
}

const AddressAction: React.FC<AddressActionProps> = ({ 
  address, 
  children, 
  style 
}) => {
  const [showModal, setShowModal] = useState(false);

  const handlePress = () => {
    if (!address || address.trim() === '') {
      Alert.alert('No Address', 'Address information is not available.');
      return;
    }
    setShowModal(true);
  };

  const handleGoogleMaps = async () => {
    setShowModal(false);
    const encodedAddress = encodeURIComponent(address);
    const url = Platform.select({
      ios: `comgooglemaps://?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
    }) || `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    try {
      // First try to open the native app
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to web version
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open Google Maps.');
    }
  };

  const handleAppleMaps = async () => {
    setShowModal(false);
    const encodedAddress = encodeURIComponent(address);
    const url = `http://maps.apple.com/?q=${encodedAddress}`;

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Could not open Apple Maps.');
    }
  };

  const handleCopyAddress = async () => {
    setShowModal(false);
    try {
      await Clipboard.setStringAsync(address);
      Alert.alert('Copied!', 'Address copied to clipboard.');
    } catch (error) {
      Alert.alert('Error', 'Could not copy address to clipboard.');
    }
  };

  return (
    <>
      <TouchableOpacity onPress={handlePress} style={style}>
        {children}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Open Address</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {address}
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.optionButton, styles.googleButton]}
                onPress={handleGoogleMaps}
              >
                <Text style={styles.optionText}>Google Maps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, styles.appleButton]}
                onPress={handleAppleMaps}
              >
                <Text style={styles.optionText}>Apple Maps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, styles.copyButton]}
                onPress={handleCopyAddress}
              >
                <Text style={styles.optionText}>Copy Address</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  appleButton: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  copyButton: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default AddressAction; 