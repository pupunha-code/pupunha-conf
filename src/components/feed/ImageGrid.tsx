import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { borderRadius, colors, spacing } from '@/lib/theme';

interface ImageGridProps {
  imageUrls: string[];
  onImagePress?: (index: number) => void;
}

export function ImageGrid({ imageUrls, onImagePress }: ImageGridProps) {
  const { colorScheme } = useTheme();
  const themeColors = colors[colorScheme];

  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  const renderSingleImage = () => (
    <Pressable
      style={[styles.singleImage, { borderColor: themeColors.border }]}
      onPress={() => onImagePress?.(0)}
    >
      <Image source={{ uri: imageUrls[0] }} style={styles.image} contentFit="cover" />
    </Pressable>
  );

  const renderTwoImages = () => (
    <View style={styles.twoImagesContainer}>
      {imageUrls.slice(0, 2).map((url, index) => (
        <Pressable
          key={index}
          style={[styles.halfImage, { borderColor: themeColors.border }]}
          onPress={() => onImagePress?.(index)}
        >
          <Image source={{ uri: url }} style={styles.image} contentFit="cover" />
        </Pressable>
      ))}
    </View>
  );

  const renderThreeImages = () => (
    <View style={styles.threeImagesContainer}>
      <Pressable
        style={[styles.leftLargeImage, { borderColor: themeColors.border }]}
        onPress={() => onImagePress?.(0)}
      >
        <Image source={{ uri: imageUrls[0] }} style={styles.image} contentFit="cover" />
      </Pressable>
      <View style={styles.rightColumn}>
        {imageUrls.slice(1, 3).map((url, index) => (
          <Pressable
            key={index + 1}
            style={[styles.smallImage, { borderColor: themeColors.border }]}
            onPress={() => onImagePress?.(index + 1)}
          >
            <Image source={{ uri: url }} style={styles.image} contentFit="cover" />
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderFourImages = () => (
    <View style={styles.fourImagesContainer}>
      <View style={styles.topRow}>
        {imageUrls.slice(0, 2).map((url, index) => (
          <Pressable
            key={index}
            style={[styles.quarterImage, { borderColor: themeColors.border }]}
            onPress={() => onImagePress?.(index)}
          >
            <Image source={{ uri: url }} style={styles.image} contentFit="cover" />
          </Pressable>
        ))}
      </View>
      <View style={styles.bottomRow}>
        {imageUrls.slice(2, 4).map((url, index) => (
          <Pressable
            key={index + 2}
            style={[styles.quarterImage, { borderColor: themeColors.border }]}
            onPress={() => onImagePress?.(index + 2)}
          >
            <Image source={{ uri: url }} style={styles.image} contentFit="cover" />
          </Pressable>
        ))}
      </View>
    </View>
  );

  switch (imageUrls.length) {
    case 1:
      return renderSingleImage();
    case 2:
      return renderTwoImages();
    case 3:
      return renderThreeImages();
    case 4:
    default:
      return renderFourImages();
  }
}

const styles = StyleSheet.create({
  // Single image
  singleImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  // Two images
  twoImagesContainer: {
    flexDirection: 'row',
    height: 200,
    gap: spacing.xs,
  },
  halfImage: {
    flex: 1,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  // Three images
  threeImagesContainer: {
    flexDirection: 'row',
    height: 200,
    gap: spacing.xs,
  },
  leftLargeImage: {
    flex: 2,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  rightColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  smallImage: {
    flex: 1,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  // Four images
  fourImagesContainer: {
    height: 200,
    gap: spacing.xs,
  },
  topRow: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  bottomRow: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  quarterImage: {
    flex: 1,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },
});
