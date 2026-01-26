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

    const { data, error } = await supabase
      .from('feed_posts')
      .insert({
        ...input,
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
      // Convert URI to blob for upload
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const fileExt = fileName.split('.').pop();
      const filePath = `feed-images/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('feed-images')
        .upload(filePath, blob);

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from('feed-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
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