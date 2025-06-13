-- Create test users and workers for local development
-- Run this in Supabase Studio SQL Editor (http://127.0.0.1:54323)

-- First, create auth users
-- Note: In local dev, we can insert directly into auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud
) VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'admin@zmf.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"full_name": "Admin User"}'::jsonb,
    'authenticated',
    'authenticated'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'tony@zmf.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"full_name": "Tony Martinez"}'::jsonb,
    'authenticated',
    'authenticated'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'jake@zmf.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"full_name": "Jake Thompson"}'::jsonb,
    'authenticated',
    'authenticated'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'sarah@zmf.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"full_name": "Sarah Chen"}'::jsonb,
    'authenticated',
    'authenticated'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'mike@zmf.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"full_name": "Mike Rodriguez"}'::jsonb,
    'authenticated',
    'authenticated'
  );

-- Create identities for the users (required for auth to work properly)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    '{"sub": "11111111-1111-1111-1111-111111111111", "email": "admin@zmf.com"}'::jsonb,
    'email',
    '11111111-1111-1111-1111-111111111111',
    now(),
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '22222222-2222-2222-2222-222222222222',
    '{"sub": "22222222-2222-2222-2222-222222222222", "email": "tony@zmf.com"}'::jsonb,
    'email',
    '22222222-2222-2222-2222-222222222222',
    now(),
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '33333333-3333-3333-3333-333333333333',
    '{"sub": "33333333-3333-3333-3333-333333333333", "email": "jake@zmf.com"}'::jsonb,
    'email',
    '33333333-3333-3333-3333-333333333333',
    now(),
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '44444444-4444-4444-4444-444444444444',
    '{"sub": "44444444-4444-4444-4444-444444444444", "email": "sarah@zmf.com"}'::jsonb,
    'email',
    '44444444-4444-4444-4444-444444444444',
    now(),
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555555',
    '{"sub": "55555555-5555-5555-5555-555555555555", "email": "mike@zmf.com"}'::jsonb,
    'email',
    '55555555-5555-5555-5555-555555555555',
    now(),
    now(),
    now()
  );

-- Now create worker records linked to these auth users
INSERT INTO workers (auth_user_id, name, email, role, specializations) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin@zmf.com', 'admin', '{}'),
  ('22222222-2222-2222-2222-222222222222', 'Tony Martinez', 'tony@zmf.com', 'manager', '{}'),
  ('33333333-3333-3333-3333-333333333333', 'Jake Thompson', 'jake@zmf.com', 'worker', ARRAY['Sanding', 'Finishing']::production_stage[]),
  ('44444444-4444-4444-4444-444444444444', 'Sarah Chen', 'sarah@zmf.com', 'worker', ARRAY['Final Assembly', 'Acoustic QC']::production_stage[]),
  ('55555555-5555-5555-5555-555555555555', 'Mike Rodriguez', 'mike@zmf.com', 'worker', ARRAY['Intake', 'Sub-Assembly']::production_stage[]);

-- Verify the users were created
SELECT 
  w.id,
  w.name,
  w.email,
  w.role,
  w.specializations,
  u.email as auth_email,
  u.email_confirmed_at
FROM workers w
JOIN auth.users u ON w.auth_user_id = u.id
ORDER BY w.role, w.name;

-- Test credentials:
-- admin@zmf.com / password123 (Admin)
-- tony@zmf.com / password123 (Manager)
-- jake@zmf.com / password123 (Worker - Sanding, Finishing)
-- sarah@zmf.com / password123 (Worker - Final Assembly, QC)
-- mike@zmf.com / password123 (Worker - Intake, Sub-Assembly)