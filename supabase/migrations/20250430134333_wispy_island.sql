/*
  # Add dark mode preference to profiles

  1. Changes
    - Add `dark_mode` boolean column to `profiles` table with default false
    - Add RLS policy for users to update their own dark mode preference
*/

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dark_mode boolean DEFAULT false;

-- Update RLS policy to allow users to update their dark mode preference
CREATE POLICY "Users can update own dark mode preference" 
ON profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);