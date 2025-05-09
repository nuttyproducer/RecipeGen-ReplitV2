/*
  # Initial Schema Setup for RecipeFusion

  1. New Tables
    - `profiles`
      - User profiles with dietary preferences
    - `recipes`
      - AI-generated fusion recipes
    - `ratings`
      - User ratings and reviews for recipes
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  dietary_restrictions text[],
  allergies text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  cuisines text[] NOT NULL,
  ingredients jsonb NOT NULL,
  instructions jsonb NOT NULL,
  dietary_tags text[],
  cooking_time interval,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(recipe_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Recipes policies
CREATE POLICY "Recipes are viewable by everyone"
  ON recipes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create recipes"
  ON recipes
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own recipes"
  ON recipes
  FOR UPDATE
  USING (auth.uid() = creator_id);

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone"
  ON ratings
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create ratings"
  ON ratings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own ratings"
  ON ratings
  FOR UPDATE
  USING (auth.uid() = user_id);