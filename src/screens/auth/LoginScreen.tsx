import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import FirebaseTest from '../../components/common/FirebaseTest';
import AuthTest from '../../components/common/AuthTest';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>SCBC Login</Text>
        
        <Text style={styles.subtitle}>
          Seattle Chinatown Book Club
        </Text>

        {/* Firebase Connection Test */}
        <FirebaseTest />

        {/* Authentication Test - Remove this after testing */}
        <AuthTest />

        {/* TODO: Add actual login form with React Hook Form */}
        <View style={styles.form}>
          <View style={styles.inputPlaceholder}>
            <Text style={styles.placeholderText}>Email input placeholder</Text>
          </View>
          
          <View style={styles.inputPlaceholder}>
            <Text style={styles.placeholderText}>Password input placeholder</Text>
          </View>

          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>
            Don't have an account? Register
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 32,
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 16,
  },
  inputPlaceholder: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
  },
  placeholderText: {
    color: '#6b7280',
  },
  primaryButton: {
    backgroundColor: '#ec4899',
    padding: 16,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 24,
  },
  linkText: {
    color: '#ec4899',
  },
});

export default LoginScreen; 