/*
  # Add recipe count function
  
  1. New Functions
    - `get_user_recipe_count`: Returns the number of recipes created by a user
  
  2. Security
    - Function is accessible to authenticated users
*/

-- Create function to get recipe count for a user
CREATE OR REPLACE FUNCTION get_user_recipe_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM recipes
    WHERE creator_id = user_id
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;