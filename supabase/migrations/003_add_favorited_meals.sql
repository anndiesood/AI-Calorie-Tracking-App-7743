-- Create favorited_meals table for meal ideas feature
CREATE TABLE IF NOT EXISTS favorited_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  meal_description TEXT,
  calories INTEGER DEFAULT 0,
  protein DECIMAL(5,2) DEFAULT 0,
  carbs DECIMAL(5,2) DEFAULT 0,
  fat DECIMAL(5,2) DEFAULT 0,
  time TEXT,
  servings INTEGER DEFAULT 1,
  image TEXT,
  ingredients TEXT[],
  instructions TEXT[],
  meal_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create policies for favorited_meals
ALTER TABLE favorited_meals ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own favorites
CREATE POLICY "Users can manage own favorites" ON favorited_meals 
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorited_meals_user_id ON favorited_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_favorited_meals_meal_type ON favorited_meals(meal_type);
CREATE INDEX IF NOT EXISTS idx_favorited_meals_created_at ON favorited_meals(created_at);

-- Update users table to ensure all snake_case columns exist
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'suspended')),
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'none' CHECK (payment_status IN ('none', 'paid', 'overdue')),
  ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS profile_photo TEXT;

-- Update role constraint to include superadmin
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('superadmin', 'admin', 'moderator', 'user'));

-- Insert or update system settings
INSERT INTO system_settings (key, value, description) VALUES 
  ('superadmin_exists', 'false', 'Whether a superadmin account has been created'),
  ('demo_accounts_enabled', 'true', 'Whether demo accounts are enabled for testing'),
  ('app_version', '1.0.0', 'Current application version'),
  ('maintenance_mode', 'false', 'Whether the app is in maintenance mode')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description;