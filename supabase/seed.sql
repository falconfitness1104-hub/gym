-- Seed Trainers
INSERT INTO trainers (name, specialty, bio, avatar_url)
VALUES 
  ('Alex Rivers', 'Bodybuilding & Strength', '10+ years of experience in competitive bodybuilding and powerlifting.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),
  ('Sarah Chen', 'Yoga & Flexibility', 'Certified Yoga instructor focused on mobility and mental wellness.', 'https://images.unsplash.com/photo-1518611012118-2969c6370048?w=400'),
  ('Marcus Johnson', 'HIIT & Weight Loss', 'High-energy coach specialized in fat loss and functional fitness.', 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400');

-- Seed Slots for Alex (Trainer 1)
-- Generating slots for the next 7 days at 9 AM and 2 PM
INSERT INTO slots (trainer_id, start_time, end_time)
SELECT 
  id, 
  generate_series(
    CURRENT_DATE + INTERVAL '1 day' + INTERVAL '9 hours', 
    CURRENT_DATE + INTERVAL '7 days' + INTERVAL '9 hours', 
    INTERVAL '1 day'
  ),
  generate_series(
    CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours', 
    CURRENT_DATE + INTERVAL '7 days' + INTERVAL '10 hours', 
    INTERVAL '1 day'
  )
FROM trainers WHERE name = 'Alex Rivers';

-- Seed Slots for Sarah (Trainer 2)
INSERT INTO slots (trainer_id, start_time, end_time)
SELECT 
  id, 
  generate_series(
    CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours', 
    CURRENT_DATE + INTERVAL '7 days' + INTERVAL '10 hours', 
    INTERVAL '1 day'
  ),
  generate_series(
    CURRENT_DATE + INTERVAL '1 day' + INTERVAL '11 hours', 
    CURRENT_DATE + INTERVAL '7 days' + INTERVAL '11 hours', 
    INTERVAL '1 day'
  )
FROM trainers WHERE name = 'Sarah Chen';

-- Add a welcome notification for all future users (Triggering manually for now)
-- Note: Notifications usually require a user_id, so we'll leave this as a template
-- INSERT INTO notifications (user_id, title, message) VALUES ('YOUR_USER_ID', 'Welcome!', 'Welcome to Falcon Fitness. Let us reach your goals together!');
