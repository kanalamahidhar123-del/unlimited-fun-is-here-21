/*
# Create bookings and birthday enquiries tables

## Purpose
Stores booking slot requests and birthday party enquiries submitted from the
Unlimited Fun website. Both tables are single-tenant (no sign-in) — the public
website writes rows and the park staff reads them from the Supabase dashboard.

## New Tables

### bookings
- id (uuid, primary key)
- full_name (text, not null) — visitor's name
- mobile_number (text, not null) — contact phone
- email (text, nullable) — optional email
- visit_date (date, not null) — requested visit date
- preferred_time (text, not null) — requested time slot
- number_of_people (integer, not null) — party size
- category (text, not null) — "Adult" or "Children"
- duration (text, not null) — "1 Hour" or "2 Hours"
- special_request (text, nullable) — optional message
- agreed_to_terms (boolean, not null default false)
- status (text, not null default 'pending')
- created_at (timestamptz, default now())

### birthday_enquiries
- id (uuid, primary key)
- name (text, not null)
- phone (text, not null)
- email (text, nullable)
- preferred_date (date, nullable)
- number_of_guests (integer, nullable)
- message (text, nullable)
- status (text, not null default 'pending')
- created_at (timestamptz, default now())

## Security
- RLS enabled on both tables.
- Anon + authenticated can INSERT (public form submissions).
- No SELECT/UPDATE/DELETE for anon — only staff via dashboard/service role.
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  mobile_number text NOT NULL,
  email text,
  visit_date date NOT NULL,
  preferred_time text NOT NULL,
  number_of_people integer NOT NULL,
  category text NOT NULL CHECK (category IN ('Adult', 'Children')),
  duration text NOT NULL CHECK (duration IN ('1 Hour', '2 Hours')),
  special_request text,
  agreed_to_terms boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS birthday_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  preferred_date date,
  number_of_guests integer,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE birthday_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_birthday_enquiries" ON birthday_enquiries;
CREATE POLICY "anon_insert_birthday_enquiries" ON birthday_enquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);
