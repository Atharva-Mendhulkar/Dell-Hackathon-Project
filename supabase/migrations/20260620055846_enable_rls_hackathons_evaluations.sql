-- Enable Row Level Security (RLS) on tables exposed to PostgREST
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Note: Since the backend interacts with the database via the postgres user, 
-- it bypasses RLS. We do not need to add restrictive policies for now, 
-- as the default behavior of enabled RLS without policies is a deny-all 
-- for PostgREST clients (frontend), which prevents unauthorized public access.
