-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Create trainers table
CREATE TABLE trainers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create slots table
CREATE TABLE slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES slots(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmed', -- confirmed, cancelled, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create body measurements table
CREATE TABLE measurements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL,
  body_fat DECIMAL,
  muscle_mass DECIMAL,
  waist DECIMAL,
  chest DECIMAL,
  arms DECIMAL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food logs table (for identifier)
CREATE TABLE food_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  description TEXT,
  identified_food TEXT,
  calories INTEGER,
  macros JSONB, -- {protein: X, carbs: Y, fat: Z}
  ingredients TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create personal photos table
CREATE TABLE personal_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments feedback table
CREATE TABLE payments_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  status TEXT NOT NULL, -- success, pending, failed
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Trainers are viewable by everyone." ON trainers FOR SELECT USING (true);

CREATE POLICY "Slots are viewable by everyone." ON slots FOR SELECT USING (true);

CREATE POLICY "Users can view own bookings." ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookings." ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own measurements." ON measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own measurements." ON measurements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own food logs." ON food_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food logs." ON food_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own photos." ON personal_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own photos." ON personal_photos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications." ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments feedback." ON payments_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments feedback." ON payments_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
