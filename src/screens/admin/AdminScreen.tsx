import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>
      <Text style={styles.subtitle}>
        Manage users and moderate content
      </Text>
      
      {/* TODO: Add admin functionality */}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          ⚙️ Admin tools coming soon...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 24,
    paddingTop: 60, // Account for status bar
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default AdminScreen; 