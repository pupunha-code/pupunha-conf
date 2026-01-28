import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePickerExpo from 'expo-image-picker';
import { useCallback } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import DragList, { DragListRenderItemInfo } from 'react-native-draglist';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, colors, spacing } from '@/lib/theme';
import { ImagePreview } from '@/types/feed';

interface ImagePickerProps {
  images: ImagePreview[];
  onImagesChange: (images: ImagePreview[]) => void;
  maxImages?: number;
}

export function ImagePicker({ images, onImagesChange, maxImages = 4 }: ImagePickerProps) {
  const { colorScheme, hapticEnabled } = useTheme();
  const themeColors = colors[colorScheme];

  const handleAddImage = async () => {
    try {
      if (images.length >= maxImages) {
        Alert.alert('Limite atingido', `Você pode adicionar no máximo ${maxImages} fotos.`);
        return;
      }

      const { status } = await ImagePickerExpo.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos da sua permissão para acessar a galeria de fotos'
        );
        return;
      }

      const result = await ImagePickerExpo.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: maxImages - images.length,
      });

      if (!result.canceled && result.assets) {
        const newImages: ImagePreview[] = result.assets.map((asset, index) => ({
          id: `${Date.now()}-${index}`,
          uri: asset.uri,
          order: images.length + index,
        }));

        onImagesChange([...images, ...newImages]);
        
        if (hapticEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    } catch (error) {
      console.error('Error selecting images:', error);
      Alert.alert('Erro', 'Não foi possível selecionar as imagens');
    }
  };

  const handleRemoveImage = useCallback((imageId: string) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const updatedImages = images
      .filter(img => img.id !== imageId)
      .map((img, index) => ({ ...img, order: index }));
    
    onImagesChange(updatedImages);
  }, [images, onImagesChange, hapticEnabled]);

  const handleReorderImages = useCallback((data: ImagePreview[] | undefined) => {
    // Guard against undefined data
    if (!data || !Array.isArray(data)) {
      console.warn('handleReorderImages: Invalid data received', data);
      return;
    }
    
    const reorderedImages = data.map((img, index) => ({ ...img, order: index }));
    onImagesChange(reorderedImages);
    
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [onImagesChange, hapticEnabled]);

  const keyExtractor = useCallback((item: ImagePreview) => item.id, []);

  const renderImageItem = useCallback(({ item, onDragStart, onDragEnd }: DragListRenderItemInfo<ImagePreview>) => (
    <View style={[styles.imageContainer, { borderColor: themeColors.border }]}>
      <Image 
        source={{ uri: item.uri }}
        style={styles.previewImage}
        contentFit="cover"
      />
      
      <Pressable
        style={[styles.removeButton, { backgroundColor: themeColors.background }]}
        onPress={() => handleRemoveImage(item.id)}
        hitSlop={8}
      >
        <Ionicons name="close" size={14} color={themeColors.text} />
      </Pressable>
      
      <Pressable
        style={[styles.dragHandle, { backgroundColor: themeColors.background }]}
        onPressIn={onDragStart}
        onPressOut={onDragEnd}
        hitSlop={8}
      >
        <Ionicons name="reorder-three" size={16} color={themeColors.textSecondary} />
      </Pressable>
    </View>
  ), [themeColors, handleRemoveImage]);

  return (
    <View style={styles.container}>
      {images.length > 0 && (
        <View style={styles.previewSection}>
          <Text variant="label" color="text" style={styles.sectionTitle}>
            Suas fotos ({images.length}/{maxImages})
          </Text>
          <Text variant="caption" color="textTertiary" style={styles.hint}>
            Arraste para reordenar as fotos
          </Text>
          
          <DragList
            data={images}
            keyExtractor={keyExtractor}
            onReordered={handleReorderImages}
            renderItem={renderImageItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageList}
          />
        </View>
      )}
      
      <Pressable
        style={[styles.addButton, { borderColor: themeColors.border }]}
        onPress={handleAddImage}
      >
        <Ionicons name="camera" size={20} color={themeColors.tint} />
        <Text variant="label" color="tint" style={styles.addButtonText}>
          {images.length === 0 ? 'Adicionar Fotos' : `Adicionar Mais (${maxImages - images.length} restantes)`}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  previewSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  hint: {
    marginBottom: spacing.md,
  },
  imageList: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  dragHandle: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  addButtonText: {
    marginLeft: spacing.sm,
  },
});