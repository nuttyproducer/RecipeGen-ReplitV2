/*
  # Add favorites functionality to recipes

  1. Changes
    - Add `is_favorite` boolean column to recipes table
    - Add index for faster favorite queries
    - Update RLS policies to allow users to toggle favorites
*/

ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;

-- Add index for faster favorite queries
CREATE INDEX IF NOT EXISTS idx_recipes_favorites ON recipes (creator_id, is_favorite);

-- Update RLS policy to allow users to update their own recipes' favorite status
CREATE POLICY "Users can update favorite status of own recipes"
ON recipes
FOR UPDATE
TO authenticated
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);