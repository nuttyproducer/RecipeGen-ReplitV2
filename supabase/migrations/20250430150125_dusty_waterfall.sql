-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_profiles_medical_preferences ON profiles USING GIN (medical_health_preferences);
CREATE INDEX IF NOT EXISTS idx_profiles_lifestyle_preferences ON profiles USING GIN (lifestyle_dietary_preferences);
CREATE INDEX IF NOT EXISTS idx_profiles_religious_preferences ON profiles USING GIN (religious_preferences);
CREATE INDEX IF NOT EXISTS idx_profiles_pantry_items ON profiles USING GIN (pantry_items);

-- Add index for metric system and temperature unit since they're used in recipe conversions
CREATE INDEX IF NOT EXISTS idx_profiles_measurement_prefs ON profiles (metric_system, temperature_unit);