/*
  # Add subscription status to profiles

  1. Changes
    - Add subscription_status column to profiles table
    - Add check constraint for valid subscription statuses
    - Add index for faster subscription queries
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'free'
CHECK (subscription_status IN ('free', 'active', 'cancelled'));

-- Add index for faster subscription queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles (subscription_status);