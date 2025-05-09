/*
  # Add notify function for profile updates

  1. New Functions
    - notify_profile_update: Broadcasts profile updates through Postgres NOTIFY/LISTEN
*/

-- Create function to notify profile updates
CREATE OR REPLACE FUNCTION notify_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'profile_updates',
    json_build_object(
      'id', NEW.id,
      'event', TG_OP,
      'record', row_to_json(NEW)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call notify function on profile updates
CREATE TRIGGER profile_update_notify
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_profile_update();