-- Fix RLS policies for registrations to use auth.jwt() instead of querying auth.users directly

-- Drop the old incorrect policies
DROP POLICY IF EXISTS "Organizers can view all registrations" ON registrations;
DROP POLICY IF EXISTS "Organizers can update registrations" ON registrations;

-- Recreate with proper JWT checks
CREATE POLICY "Organizers can view all registrations"
    ON registrations
    FOR SELECT
    USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');

CREATE POLICY "Organizers can update registrations"
    ON registrations
    FOR UPDATE
    USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');
