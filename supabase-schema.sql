-- Supabase Database Schema for Feed Functionality
-- Run these commands in your Supabase SQL editor

-- Note: auth.users table is managed by Supabase, we don't need to modify it

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view profiles (for feed display)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Policy: Users can update own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create feed_posts table
CREATE TABLE public.feed_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  event_id TEXT NOT NULL,
  content TEXT NOT NULL,
  image_urls TEXT[], -- Array of image URLs (max 4)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for feed_posts
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view feed posts (unauthenticated access)
CREATE POLICY "Feed posts are viewable by everyone"
  ON public.feed_posts FOR SELECT
  USING (true);

-- Policy: Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON public.feed_posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Policy: Users can update own posts
CREATE POLICY "Users can update own posts"
  ON public.feed_posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete own posts
CREATE POLICY "Users can delete own posts"
  ON public.feed_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for feed images
INSERT INTO storage.buckets (id, name, public) VALUES ('feed-images', 'feed-images', true);

-- Policy: Anyone can view feed images
CREATE POLICY "Feed images are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'feed-images');

-- Policy: Authenticated users can upload feed images  
CREATE POLICY "Authenticated users can upload feed images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'feed-images' AND auth.role() = 'authenticated');

-- Policy: Users can update own uploaded images
CREATE POLICY "Users can update own uploaded images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'feed-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Users can delete own uploaded images
CREATE POLICY "Users can delete own uploaded images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'feed-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_feed_posts_updated_at
  BEFORE UPDATE ON public.feed_posts
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();