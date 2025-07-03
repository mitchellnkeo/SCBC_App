import React, { useState } from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageViewerProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

interface ImageItemProps {
  imageUrl: string;
  isActive: boolean;
}

const ImageItem: React.FC<ImageItemProps> = ({ imageUrl, isActive }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={styles.imageContainer}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="image-outline" size={64} color="rgba(255,255,255,0.5)" />
          <Text style={styles.errorText}>Failed to load image</Text>
        </View>
      ) : (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}
    </View>
  );
};

const ImageViewer: React.FC<ImageViewerProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = React.useRef<FlatList>(null);

  React.useEffect(() => {
    if (visible && initialIndex !== currentIndex) {
      setCurrentIndex(initialIndex);
      // Small delay to ensure FlatList is rendered
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }, 100);
    }
  }, [visible, initialIndex]);

  const handleMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
      });
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
      });
    }
  };

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <ImageItem imageUrl={item} isActive={index === currentIndex} />
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <View style={styles.container}>
        {/* Background overlay */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Image carousel */}
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => `${item}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItemLayout={(data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          initialScrollIndex={initialIndex}
        />

        {/* Top overlay with close button */}
        <SafeAreaView style={styles.topOverlay}>
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            {/* Image counter */}
            {images.length > 1 && (
              <View style={styles.counter}>
                <Text style={styles.counterText}>
                  {currentIndex + 1} of {images.length}
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>

        {/* Navigation arrows for multiple images */}
        {images.length > 1 && (
          <>
            {/* Left arrow */}
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonLeft]}
                onPress={goToPrevious}
              >
                <Ionicons name="chevron-back" size={32} color="white" />
              </TouchableOpacity>
            )}

            {/* Right arrow */}
            {currentIndex < images.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonRight]}
                onPress={goToNext}
              >
                <Ionicons name="chevron-forward" size={32} color="white" />
              </TouchableOpacity>
            )}

            {/* Dot indicators */}
            <View style={styles.dotContainer}>
              {images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dot,
                    index === currentIndex && styles.activeDot,
                  ]}
                  onPress={() => {
                    setCurrentIndex(index);
                    flatListRef.current?.scrollToIndex({
                      index,
                      animated: true,
                    });
                  }}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth,
    height: screenHeight,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 16,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    zIndex: 10,
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
  dotContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default ImageViewer; 