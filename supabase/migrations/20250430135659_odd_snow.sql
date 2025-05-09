/*
  # Add user preferences and settings

  1. New Columns
    - medical_health_preferences (TEXT[]) - Health-related dietary restrictions
    - lifestyle_dietary_preferences (TEXT[]) - Personal dietary choices
    - religious_preferences (TEXT[]) - Religious dietary requirements
    - pantry_items (TEXT[]) - Available ingredients
    - metric_system (BOOLEAN) - Measurement system preference
    - temperature_unit (TEXT) - Cooking temperature unit preference

  2. Validation
    - Add check constraints for valid preference values
    - Add validation functions for each preference type
    - Ensure temperature unit is either °C or °F

  3. Security
    - Add RLS policy for users to update their preferences
*/

-- Add new columns with constraints
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS medical_health_preferences TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS lifestyle_dietary_preferences TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS religious_preferences TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pantry_items TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS metric_system BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS temperature_unit TEXT NOT NULL DEFAULT '°C'
CHECK (temperature_unit IN ('°C', '°F'));

-- Add table comments for clarity
COMMENT ON COLUMN profiles.medical_health_preferences IS 'Health-related dietary restrictions (e.g., Low Salt, Diabetic-Friendly)';
COMMENT ON COLUMN profiles.lifestyle_dietary_preferences IS 'Personal dietary choices (e.g., Vegan, Vegetarian, Keto)';
COMMENT ON COLUMN profiles.religious_preferences IS 'Religious dietary requirements (e.g., Halal, Kosher)';
COMMENT ON COLUMN profiles.pantry_items IS 'List of ingredients available in user''s pantry';
COMMENT ON COLUMN profiles.metric_system IS 'TRUE = metric (g/ml), FALSE = imperial (oz/cups)';
COMMENT ON COLUMN profiles.temperature_unit IS 'Preferred temperature unit for recipes (°C or °F)';

-- Create type for valid preferences
-- Medical health preferences validation
CREATE OR REPLACE FUNCTION validate_medical_preferences(prefs TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN prefs <@ ARRAY['Low Salt', 'Diabetic-Friendly']::TEXT[];
END;
$$ LANGUAGE plpgsql;

-- Lifestyle preferences validation
CREATE OR REPLACE FUNCTION validate_lifestyle_preferences(prefs TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN prefs <@ ARRAY['Vegan', 'Vegetarian', 'Flexitarian', 'Keto', 'Gluten-Free', 'Nut-Free', 'Dairy-Free']::TEXT[];
END;
$$ LANGUAGE plpgsql;

-- Religious preferences validation
CREATE OR REPLACE FUNCTION validate_religious_preferences(prefs TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN prefs <@ ARRAY['Halal', 'Kosher']::TEXT[];
END;
$$ LANGUAGE plpgsql;

-- Add constraints for preference validation
ALTER TABLE profiles
ADD CONSTRAINT valid_medical_preferences 
  CHECK (validate_medical_preferences(medical_health_preferences));
ALTER TABLE profiles
ADD CONSTRAINT valid_lifestyle_preferences 
  CHECK (validate_lifestyle_preferences(lifestyle_dietary_preferences));
ALTER TABLE profiles
ADD CONSTRAINT valid_religious_preferences 
  CHECK (validate_religious_preferences(religious_preferences));

-- Update RLS policies to allow users to update their preferences
CREATE POLICY "Users can update own preferences"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);