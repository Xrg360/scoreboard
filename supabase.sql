-- Create houses table
CREATE TABLE houses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(255) NOT NULL,
  total_score INTEGER DEFAULT 0
);

-- Create events table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  first_place_points INTEGER NOT NULL,
  second_place_points INTEGER NOT NULL,
  third_place_points INTEGER NOT NULL
);

-- Create score history table
CREATE TABLE score_history (
  id SERIAL PRIMARY KEY,
  house_id INTEGER REFERENCES houses(id),
  event_id INTEGER REFERENCES events(id),
  points INTEGER NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now())
);

-- Function to update house score
CREATE OR REPLACE FUNCTION update_house_score(house_id INTEGER, points INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE houses
  SET total_score = total_score + points
  WHERE id = house_id;
END;
$$ LANGUAGE plpgsql;

-- Insert initial house data
INSERT INTO houses (name, color, total_score) VALUES
  ('Blue House', 'blue',0),
  ('Red House', 'red',0),
  ('Yellow House', 'yellow',0),
  ('Green House', 'green',0);

-- Insert events data
INSERT INTO events (name, first_place_points, second_place_points, third_place_points) VALUES
  ('Painting Competition', 50, 30, 20),
  ('Sculpture Exhibition', 45, 30, 15),
  ('Photography Contest', 50, 35, 20),
  ('Dance Performance', 60, 40, 25),
  ('Music Concert', 55, 35, 20),
  ('Drama Play', 45, 30, 15),
  ('Poetry Recital', 50, 35, 20),
  ('Craft Workshop', 55, 40, 25),
  ('Film Screening', 40, 25, 15),
  ('Literary Reading', 40, 25, 15);

-- Enable Row Level Security
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON houses
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON events
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON score_history
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON score_history
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create authenticated user for admin access
CREATE USER admin_user WITH PASSWORD 'your_password_here';
GRANT ALL ON houses, events, score_history TO admin_user;