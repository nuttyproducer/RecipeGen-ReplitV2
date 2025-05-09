/*
  # Fix Profile RLS Policies

  1. Changes
    - Add INSERT policy for profiles table to allow users to create their own profile
    - Update SELECT policy to be more specific about conditions
    - Add explicit policy for authenticated users to insert their own profile

  2. Security
    - Ensures users can only create their own profile
    - Maintains existing read access for public profiles
    - Restricts profile creation to authenticated users only
*/

-- Drop existing policies to recreate them with proper conditions
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own dark mode preference" ON profiles;
DROP POLICY IF EXISTS "Users can update own preferences" ON profiles;

-- Create new policies with proper conditions
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);