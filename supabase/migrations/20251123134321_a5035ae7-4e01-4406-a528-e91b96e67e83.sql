-- Add outlet_id to team_members for outlet-specific invitations
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_team_members_outlet_id ON team_members(outlet_id);

-- Add a flag to track if member needs to set their own access code
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS needs_password_setup BOOLEAN DEFAULT false;

COMMENT ON COLUMN team_members.outlet_id IS 'The outlet this team member is invited to';
COMMENT ON COLUMN team_members.needs_password_setup IS 'True if the member needs to set their own access code on first login';