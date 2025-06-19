import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import KeyboardToolbar from '../components/common/KeyboardToolbar';

const KeyboardTestScreen: React.FC = () => {
  const { theme } = useTheme();
  const [singleLineText, setSingleLineText] = useState('');
  const [multiLineText, setMultiLineText] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const singleLineRef = useRef<TextInput>(null);
  const multiLineRef = useRef<TextInput>(null);
  
  const singleLineToolbarID = 'singleLineToolbar';
  const multiLineToolbarID = 'multiLineToolbar';

  const addTestResult = (result: string) => {
    setTestResults(prev => [`${new Date().toLocaleTimeString()}: ${result}`, ...prev.slice(0, 9)]);
  };

  const handleSingleLineDone = () => {
    addTestResult('Single-line toolbar Done pressed');
    singleLineRef.current?.blur();
  };

  const handleMultiLineDone = () => {
    addTestResult('Multi-line toolbar Done pressed');
    multiLineRef.current?.blur();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 24,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    input: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      marginBottom: 8,
    },
    multilineInput: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    description: {
      fontSize: 14,
      color: theme.textTertiary,
      marginBottom: 16,
    },
    platformInfo: {
      backgroundColor: theme.card,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    platformText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    testResults: {
      backgroundColor: theme.card,
      padding: 12,
      borderRadius: 8,
      marginTop: 16,
    },
    testResultsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    testResult: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 4,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Keyboard Toolbar Test</Text>
        <Text style={styles.subtitle}>
          Debug iOS keyboard "Done" button functionality
        </Text>

        <View style={styles.platformInfo}>
          <Text style={styles.platformText}>
            Platform: {Platform.OS} {Platform.Version}
          </Text>
          <Text style={styles.platformText}>
            Toolbar Support: {Platform.OS === 'ios' ? 'Enabled' : 'Not Available'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Single Line Input</Text>
          <Text style={styles.description}>
            Should show "Done" button on iOS keyboard toolbar
          </Text>
          <TextInput
            ref={singleLineRef}
            style={styles.input}
            value={singleLineText}
            onChangeText={setSingleLineText}
            placeholder="Type here (single line)..."
            placeholderTextColor={theme.textTertiary}
            returnKeyType="done"
            onSubmitEditing={() => addTestResult('Single-line onSubmitEditing called')}
            inputAccessoryViewID={Platform.OS === 'ios' ? singleLineToolbarID : undefined}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Multi Line Input</Text>
          <Text style={styles.description}>
            Should show "Done" button on iOS keyboard toolbar (multiline)
          </Text>
          <TextInput
            ref={multiLineRef}
            style={[styles.input, styles.multilineInput]}
            value={multiLineText}
            onChangeText={setMultiLineText}
            placeholder="Type here (multi line)..."
            placeholderTextColor={theme.textTertiary}
            multiline
            returnKeyType="default"
            inputAccessoryViewID={Platform.OS === 'ios' ? multiLineToolbarID : undefined}
          />
        </View>

        {testResults.length > 0 && (
          <View style={styles.testResults}>
            <Text style={styles.testResultsTitle}>Test Results</Text>
            {testResults.map((result, index) => (
              <Text key={index} style={styles.testResult}>
                {result}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>

      {Platform.OS === 'ios' && (
        <>
          <KeyboardToolbar 
            nativeID={singleLineToolbarID}
            onDone={handleSingleLineDone}
          />
          <KeyboardToolbar 
            nativeID={multiLineToolbarID}
            onDone={handleMultiLineDone}
            doneText="Finish"
          />
        </>
      )}
    </View>
  );
};

export default KeyboardTestScreen; 