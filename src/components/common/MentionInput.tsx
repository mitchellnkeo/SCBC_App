import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { Mention, UserSuggestion, MentionInputProps } from '../../types/mentions';

const { width: screenWidth } = Dimensions.get('window');

const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChangeText,
  placeholder,
  maxLength,
  multiline = false,
  style,
  onSubmit,
  users,
}) => {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [currentMentionQuery, setCurrentMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const inputRef = useRef<TextInput>(null);

  // Parse mentions from text
  const parseMentions = (text: string): Mention[] => {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const foundMentions: Mention[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const userName = match[1];
      const user = users.find(u => u.displayName.toLowerCase() === userName.toLowerCase());
      
      if (user) {
        foundMentions.push({
          id: `${user.id}_${match.index}`,
          userId: user.id,
          userName: user.displayName,
          userProfilePicture: user.profilePicture,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          displayName: `@${user.displayName}`,
        });
      }
    }

    return foundMentions;
  };

  // Find current mention query
  const findCurrentMention = (text: string, position: number) => {
    // Look backwards from cursor to find @
    let start = position - 1;
    while (start >= 0 && text[start] !== '@' && text[start] !== ' ' && text[start] !== '\n') {
      start--;
    }

    if (start >= 0 && text[start] === '@') {
      const end = position;
      const query = text.substring(start + 1, end);
      
      // Only show suggestions if we're actively typing after @
      if (end === position && query.length >= 0) {
        return {
          start,
          query,
          isActive: true,
        };
      }
    }

    return {
      start: -1,
      query: '',
      isActive: false,
    };
  };

  // Filter users based on query
  const filterUsers = (query: string): UserSuggestion[] => {
    if (!query) return users.slice(0, 5); // Show first 5 users when query is empty
    
    return users
      .filter(user => 
        user.displayName.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => {
        // Prioritize exact matches at the beginning
        const aStartsWithQuery = a.displayName.toLowerCase().startsWith(query.toLowerCase());
        const bStartsWithQuery = b.displayName.toLowerCase().startsWith(query.toLowerCase());
        
        if (aStartsWithQuery && !bStartsWithQuery) return -1;
        if (!aStartsWithQuery && bStartsWithQuery) return 1;
        
        return a.displayName.localeCompare(b.displayName);
      })
      .slice(0, 5); // Limit to 5 suggestions
  };

  // Handle text change
  const handleTextChange = (text: string) => {
    const newMentions = parseMentions(text);
    setMentions(newMentions);
    onChangeText(text, newMentions);
  };

  // Handle selection change (cursor movement)
  const handleSelectionChange = (event: any) => {
    const position = event.nativeEvent.selection.start;
    setCursorPosition(position);

    const mentionInfo = findCurrentMention(value, position);
    
    if (mentionInfo.isActive) {
      setMentionStart(mentionInfo.start);
      setCurrentMentionQuery(mentionInfo.query);
      setSuggestions(filterUsers(mentionInfo.query));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setMentionStart(-1);
      setCurrentMentionQuery('');
    }
  };

  // Handle user selection from suggestions
  const handleUserSelect = (user: UserSuggestion) => {
    if (mentionStart === -1) return;

    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(cursorPosition);
    const newText = `${beforeMention}@${user.displayName} ${afterMention}`;
    
    handleTextChange(newText);
    setShowSuggestions(false);
    
    // Focus back to input and set cursor position
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPosition = mentionStart + user.displayName.length + 2; // +2 for @ and space
        inputRef.current.setNativeProps({
          selection: { start: newCursorPosition, end: newCursorPosition }
        });
      }
    }, 100);
  };

  // Render suggestion item
  const renderSuggestionItem = ({ item }: { item: UserSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleUserSelect(item)}
    >
      {item.profilePicture ? (
        <Image source={{ uri: item.profilePicture }} style={styles.suggestionAvatar} />
      ) : (
        <View style={styles.suggestionAvatarPlaceholder}>
          <Text style={styles.suggestionAvatarText}>
            {item.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <Text style={styles.suggestionName}>@{item.displayName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={[styles.input, style]}
        value={value}
        onChangeText={handleTextChange}
        onSelectionChange={handleSelectionChange}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        maxLength={maxLength}
        multiline={multiline}
        onSubmitEditing={onSubmit}
        blurOnSubmit={!multiline}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="always"
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 48,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  suggestionAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ec4899',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  suggestionName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
});

export default MentionInput; 