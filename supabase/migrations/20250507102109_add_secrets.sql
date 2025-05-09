
CREATE TABLE IF NOT EXISTS secrets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users"
ON secrets FOR SELECT
TO authenticated
USING (true);
