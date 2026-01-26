import { create } from 'zustand';

import { feedService } from '@/services/feed.service';
import { CreateFeedPostInput, FeedPost, FeedState } from '@/types/feed';

interface FeedStoreState extends FeedState {
  // Actions
  fetchPosts: (eventId: string) => Promise<void>;
  createPost: (input: CreateFeedPostInput) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  uploadImage: (uri: string, fileName: string) => Promise<string>;
  clearFeed: () => void;
  setError: (error: string | null) => void;
  
  // Real-time subscription
  subscribeToUpdates: (eventId: string) => () => void;
}

export const useFeedStore = create<FeedStoreState>((set, get) => ({
  posts: [],
  isLoading: false,
  isCreating: false,
  error: null,

  fetchPosts: async (eventId: string) => {
    try {
      set({ isLoading: true, error: null });
      const posts = await feedService.getFeedPosts(eventId);
      set({ posts, isLoading: false });
    } catch (error) {
      console.error('Error fetching posts:', error);
      set({ 
        error: 'Erro ao carregar o feed', 
        isLoading: false 
      });
    }
  },

  createPost: async (input: CreateFeedPostInput) => {
    try {
      set({ isCreating: true, error: null });
      const newPost = await feedService.createPost(input);
      
      // Add the new post to the beginning of the list
      set(state => ({ 
        posts: [newPost, ...state.posts],
        isCreating: false 
      }));
    } catch (error) {
      console.error('Error creating post:', error);
      set({ 
        error: 'Erro ao criar post', 
        isCreating: false 
      });
      throw error;
    }
  },

  deletePost: async (postId: string) => {
    try {
      await feedService.deletePost(postId);
      
      // Remove the post from the list
      set(state => ({ 
        posts: state.posts.filter(post => post.id !== postId)
      }));
    } catch (error) {
      console.error('Error deleting post:', error);
      set({ error: 'Erro ao excluir post' });
      throw error;
    }
  },

  uploadImage: async (uri: string, fileName: string) => {
    try {
      return await feedService.uploadImage(uri, fileName);
    } catch (error) {
      console.error('Error uploading image:', error);
      set({ error: 'Erro ao fazer upload da imagem' });
      throw error;
    }
  },

  subscribeToUpdates: (eventId: string) => {
    const subscription = feedService.subscribeToFeedUpdates(eventId, (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      set(state => {
        switch (eventType) {
          case 'INSERT':
            // Add new post if not already in the list
            if (!state.posts.some(post => post.id === newRecord.id)) {
              return { posts: [newRecord, ...state.posts] };
            }
            return state;
            
          case 'DELETE':
            return { 
              posts: state.posts.filter(post => post.id !== oldRecord.id) 
            };
            
          case 'UPDATE':
            return {
              posts: state.posts.map(post => 
                post.id === newRecord.id ? newRecord : post
              )
            };
            
          default:
            return state;
        }
      });
    });

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  },

  clearFeed: () => set({ posts: [], error: null }),
  setError: (error) => set({ error }),
}));