/**
 * Feed-related type definitions.
 */

export interface FeedPost {
  id: string;
  user_id: string;
  event_id: string;
  content: string;
  image_urls?: string[]; // Array of image URLs (max 4)
  created_at: string;
  // Derived data from joins
  user_profile?: {
    name?: string;
    avatar_url?: string;
  };
  // Additional fields can be added as needed
  info: string;
}

export interface CreateFeedPostInput {
  event_id: string;
  content: string;
  image_urls?: string[];
}

export interface ImagePreview {
  id: string;
  uri: string;
  order: number;
}

export interface FeedState {
  posts: FeedPost[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

export interface AuthState {
  user: any | null; // Supabase user
  isLoading: boolean;
  isAuthenticated: boolean;
}
