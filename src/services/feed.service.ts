import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '@/lib/supabase';
import { CreateFeedPostInput, FeedPost } from '@/types/feed';

class FeedService {
  async getFeedPosts(eventId: string): Promise<FeedPost[]> {
    // No authentication required - anyone can view the feed
    const { data, error } = await supabase
      .from('feed_posts')
      .select(`
        *,
        user_profile:profiles!user_id (
          name,
          avatar_url
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feed posts:', error);
      throw error;
    }

    return data || [];
  }

  async createPost(input: CreateFeedPostInput): Promise<FeedPost> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Ensure profile exists before creating post
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create it
    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        }, { onConflict: 'id' });

      if (profileError) {
        console.error('Error creating/updating profile:', profileError);
        throw profileError;
      }
    }

    const { data, error } = await supabase
      .from('feed_posts')
      .insert({
        event_id: input.event_id,
        content: input.content,
        image_urls: input.image_urls || [],
        user_id: user.id,
      })
      .select(`
        *,
        user_profile:profiles!user_id (
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating feed post:', error);
      throw error;
    }

    return data;
  }

  async deletePost(postId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('feed_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id); // Only allow deleting own posts

    if (error) {
      console.error('Error deleting feed post:', error);
      throw error;
    }
  }

  async uploadImage(uri: string, fileName: string): Promise<string> {
    try {
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      
      // Determine file extension and MIME type
      const fileExt = uri.split('.').pop()?.toLowerCase() || fileName.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = fileExt === 'png' ? 'image/png' : 
                       fileExt === 'gif' ? 'image/gif' : 
                       'image/jpeg';
      
      // Convert base64 to Uint8Array directly (more reliable than fetch)
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `feed-images/${uniqueFileName}`;

      const { data, error } = await supabase.storage
        .from('feed-images')
        .upload(filePath, bytes, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('feed-images')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Subscribe to real-time updates for a specific event
  subscribeToFeedUpdates(eventId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`feed-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feed_posts',
          filter: `event_id=eq.${eventId}`,
        },
        callback
      )
      .subscribe();
  }
}

export const feedService = new FeedService();