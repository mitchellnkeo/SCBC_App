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
import { Button } from './Button';

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
              <Button
                title="Google Maps"
                onPress={handleGoogleMaps}
                variant="outline"
                size="large"
                fullWidth
                style={{ marginBottom: 8 }}
              />

              <Button
                title="Apple Maps"
                onPress={handleAppleMaps}
                variant="outline"
                size="large"
                fullWidth
                style={{ marginBottom: 8 }}
              />

              <Button
                title="Copy Address"
                onPress={handleCopyAddress}
                variant="outline"
                size="large"
                fullWidth
              />
            </View>

            <Button
              title="Cancel"
              onPress={() => setShowModal(false)}
              variant="secondary"
              size="large"
              fullWidth
            />
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

});

export default AddressAction; 