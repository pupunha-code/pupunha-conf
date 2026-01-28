import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ImagePicker } from '@/components/feed/ImagePicker';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, colors, spacing } from '@/lib/theme';
import { useFeedStore } from '@/store/feed.store';
import { ImagePreview } from '@/types/feed';

export default function CreatePostModal() {
  const router = useRouter();
  const { colorScheme, hapticEnabled } = useTheme();
  const themeColors = colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { createPost, uploadImage, isCreating } = useFeedStore();
  const { activeEvent } = useActiveEvent();

  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && selectedImages.length === 0) {
      Alert.alert('Erro', 'Adicione um texto ou uma imagem para publicar');
      return;
    }

    if (!activeEvent) {
      Alert.alert('Erro', 'Nenhum evento selecionado');
      return;
    }

    // Set immediate loading state
    setIsSubmitting(true);

    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      let imageUrls: string[] = [];

      if (selectedImages.length > 0) {
        // Sort images by order before uploading
        const sortedImages = [...selectedImages].sort((a, b) => a.order - b.order);

        // Upload all images in parallel
        const uploadPromises = sortedImages.map((img, index) =>
          uploadImage(img.uri, `post_${Date.now()}_${index}.jpg`),
        );

        imageUrls = await Promise.all(uploadPromises);
      }

      await createPost({
        event_id: activeEvent.id,
        content: content.trim(),
        image_urls: imageUrls,
      });

      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.back();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Erro', 'Não foi possível publicar o post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={[styles.header, { paddingTop: insets.top, borderBottomColor: themeColors.border }]}
      >
        <Pressable style={styles.cancelButton} onPress={handleClose}>
          <Text variant="button" color="textSecondary">
            Cancelar
          </Text>
        </Pressable>

        <Text variant="h2" color="text">
          Novo Post
        </Text>

        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: themeColors.surfaceSecondary,
              borderColor: themeColors.border,
              color: themeColors.text,
            },
          ]}
          placeholder="O que você está pensando sobre o evento?"
          placeholderTextColor={themeColors.textTertiary}
          multiline
          numberOfLines={4}
          value={content}
          onChangeText={setContent}
          maxLength={500}
        />

        <Text variant="caption" color="textTertiary" style={styles.charCount}>
          {content.length}/500
        </Text>

        <ImagePicker images={selectedImages} onImagesChange={setSelectedImages} maxImages={4} />
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom, borderTopColor: themeColors.border },
        ]}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleSubmit}
          loading={isSubmitting || isCreating}
          disabled={isSubmitting || isCreating || (!content.trim() && selectedImages.length === 0)}
        >
          {isSubmitting || isCreating ? 'Publicando...' : 'Publicar'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cancelButton: {
    padding: spacing.sm,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: spacing.xs,
  },
  charCount: {
    textAlign: 'right',
    marginBottom: spacing.lg,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
