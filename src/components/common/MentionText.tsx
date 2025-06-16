import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Mention } from '../../types/mentions';

interface MentionTextProps {
  text: string;
  mentions: Mention[];
  style?: any;
  onMentionPress?: (mention: Mention) => void;
  numberOfLines?: number;
}

const MentionText: React.FC<MentionTextProps> = ({
  text,
  mentions,
  style,
  onMentionPress,
  numberOfLines,
}) => {
  if (mentions.length === 0) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }

  // Sort mentions by start index to process them in order
  const sortedMentions = [...mentions].sort((a, b) => a.startIndex - b.startIndex);

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedMentions.forEach((mention, index) => {
    // Add text before the mention
    if (mention.startIndex > lastIndex) {
      const beforeText = text.substring(lastIndex, mention.startIndex);
      elements.push(
        <Text key={`text-${index}-before`} style={style}>
          {beforeText}
        </Text>
      );
    }

    // Add the mention as a highlighted, pressable text
    const mentionText = text.substring(mention.startIndex, mention.endIndex);
    elements.push(
      <TouchableOpacity
        key={`mention-${mention.id}`}
        onPress={() => onMentionPress?.(mention)}
        activeOpacity={0.7}
      >
        <Text style={[style, styles.mentionText]}>
          {mentionText}
        </Text>
      </TouchableOpacity>
    );

    lastIndex = mention.endIndex;
  });

  // Add remaining text after the last mention
  if (lastIndex < text.length) {
    const afterText = text.substring(lastIndex);
    elements.push(
      <Text key="text-after" style={style}>
        {afterText}
      </Text>
    );
  }

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {elements}
    </Text>
  );
};

const styles = StyleSheet.create({
  mentionText: {
    color: '#ec4899',
    fontWeight: '600',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    paddingHorizontal: 2,
    borderRadius: 4,
  },
});

export default MentionText; 