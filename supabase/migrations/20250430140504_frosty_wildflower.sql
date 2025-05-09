/*
  # Update profile defaults

  1. Changes
    - Set default values for new users:
      - metric_system: true
      - temperature_unit: '°C'

  2. Security
    - No changes to RLS policies needed
*/

-- Update default values for new users
ALTER TABLE profiles
ALTER COLUMN metric_system SET DEFAULT true,
ALTER COLUMN temperature_unit SET DEFAULT '°C';

-- Ensure existing users have the correct defaults
UPDATE profiles 
SET metric_system = true,
    temperature_unit = '°C'
WHERE metric_system IS NULL
   OR temperature_unit IS NULL;