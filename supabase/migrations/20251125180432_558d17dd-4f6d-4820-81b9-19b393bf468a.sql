-- First, add unique constraint on user_id to prevent duplicate subscriptions
-- But first, clean up any existing duplicates
DELETE FROM subscribers s1
WHERE EXISTS (
  SELECT 1 FROM subscribers s2
  WHERE s2.user_id = s1.user_id
    AND s2.id < s1.id
);

-- Add unique constraint on user_id
ALTER TABLE subscribers
ADD CONSTRAINT subscribers_user_id_unique UNIQUE (user_id);

-- Create function to automatically create trial subscription for new users
CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a trial subscription for the new user (14 days trial)
  INSERT INTO subscribers (
    email,
    user_id,
    subscribed,
    subscription_tier,
    subscription_status,
    subscription_start,
    subscription_end
  ) VALUES (
    NEW.email,
    NEW.id,
    true,
    'starter', -- Default trial tier
    'trialing',
    now(),
    now() + interval '14 days'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_trial_subscription();

-- Create subscriptions for existing users who don't have one
INSERT INTO subscribers (
  email,
  user_id,
  subscribed,
  subscription_tier,
  subscription_status,
  subscription_start,
  subscription_end
)
SELECT 
  u.email,
  u.id,
  true,
  'starter',
  'trialing',
  now(),
  now() + interval '14 days'
FROM auth.users u
LEFT JOIN subscribers s ON u.id = s.user_id
WHERE s.id IS NULL 
  AND u.deleted_at IS NULL
ON CONFLICT (user_id) DO NOTHING;