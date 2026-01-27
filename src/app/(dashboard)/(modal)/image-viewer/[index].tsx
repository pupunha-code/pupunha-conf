import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { colors, spacing } from '@/lib/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ImageViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ index: string; images: string }>();
  const { colorScheme } = useTheme();
  const themeColors = colors[colorScheme];
  const insets = useSafeAreaInsets();

  const initialIndex = parseInt(params.index || '0', 10);
  const imageUrls = params.images ? JSON.parse(decodeURIComponent(params.images)) : [];
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleClose = () => {
    router.back();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < imageUrls.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  useEffect(() => {
    // Scroll to initial index when component mounts
    if (scrollViewRef.current && initialIndex > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: initialIndex * SCREEN_WIDTH,
          animated: false,
        });
      }, 100);
    }
  }, [initialIndex]);

  if (imageUrls.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Pressable style={[styles.closeButton, { top: insets.top + spacing.md }]} onPress={handleClose}>
          <Ionicons name="close" size={24} color={themeColors.text} />
        </Pressable>
        <View style={styles.errorContainer}>
          <Text variant="body" color="textSecondary">
            Nenhuma imagem encontrada
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Header with close button and image counter */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
        
        {imageUrls.length > 1 && (
          <View style={styles.counter}>
            <Text variant="label" style={styles.counterText}>
              {currentIndex + 1} / {imageUrls.length}
            </Text>
          </View>
        )}
        
        <View style={styles.placeholder} />
      </View>

      {/* Image carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {imageUrls.map((url, index) => (
          <ScrollView
            key={index}
            style={styles.imageContainer}
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            bouncesZoom
          >
            <Image
              source={{ uri: url }}
              style={styles.image}
              contentFit="contain"
              transition={200}
            />
          </ScrollView>
        ))}
      </ScrollView>

      {/* Navigation arrows (only show if more than 1 image) */}
      {imageUrls.length > 1 && (
        <>
          {currentIndex > 0 && (
            <Pressable
              style={[styles.navButton, styles.prevButton]}
              onPress={handlePrevious}
            >
              <Ionicons name="chevron-back" size={32} color="#fff" />
            </Pressable>
          )}
          
          {currentIndex < imageUrls.length - 1 && (
            <Pressable
              style={[styles.navButton, styles.nextButton]}
              onPress={handleNext}
            >
              <Ionicons name="chevron-forward" size={32} color="#fff" />
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  counter: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  counterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  prevButton: {
    left: spacing.md,
  },
  nextButton: {
    right: spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
