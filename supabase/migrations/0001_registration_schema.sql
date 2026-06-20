-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the registrations table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID,
    user_id UUID REFERENCES auth.users(id), -- If using Supabase Auth
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    college TEXT NOT NULL,
    github TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Decisions and Scores
    decision TEXT NOT NULL CHECK (decision IN ('AUTO_APPROVED', 'MANUAL_REVIEW', 'POTENTIAL_DUPLICATE', 'HARD_DUPLICATE')),
    score DOUBLE PRECISION NOT NULL,
    
    -- Explanations
    matched_profile TEXT,
    matched_profile_note TEXT,
    
    -- Extracted Data
    skills TEXT[] DEFAULT '{}',
    
    -- Exact Signals
    exact_email BOOLEAN DEFAULT false,
    exact_phone BOOLEAN DEFAULT false,
    exact_github BOOLEAN DEFAULT false,
    
    -- Similarity
    sim_name DOUBLE PRECISION DEFAULT 0.0,
    sim_college DOUBLE PRECISION DEFAULT 0.0,
    
    -- Device/IP Correlation
    device_match BOOLEAN DEFAULT false,
    ip_subnet_match BOOLEAN DEFAULT false,
    
    -- FaceScan
    face_scan_status TEXT CHECK (face_scan_status IN ('verified', 'manual_review', 'review_required', 'not_consented')),
    face_scan_score DOUBLE PRECISION,
    face_scan_consented BOOLEAN DEFAULT false,
    face_scan_deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Admin Recommendation
    recommendation TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Core golden-path tables. These are intentionally compact but cover the PRD flow:
-- hackathon setup -> participant registration -> team formation -> reviewer assignment
-- -> evaluation -> results -> tamper-evident audit trail.
CREATE TABLE IF NOT EXISTS public.hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    theme TEXT,
    description TEXT,
    registration_start TIMESTAMP WITH TIME ZONE,
    registration_end TIMESTAMP WITH TIME ZONE,
    event_start TIMESTAMP WITH TIME ZONE,
    event_end TIMESTAMP WITH TIME ZONE,
    min_team_size INTEGER NOT NULL DEFAULT 1,
    max_team_size INTEGER NOT NULL DEFAULT 4,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'active', 'completed', 'archived')),
    public_slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.problem_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ps_id UUID UNIQUE DEFAULT gen_random_uuid(),
    hackathon_id UUID REFERENCES public.hackathons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    domain TEXT,
    difficulty TEXT,
    raw_text TEXT,
    description TEXT,
    required_vector JSONB NOT NULL DEFAULT '{}'::jsonb,
    min_size INTEGER,
    max_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID REFERENCES public.hackathons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    weight INTEGER NOT NULL CHECK (weight >= 0 AND weight <= 100),
    score_min INTEGER NOT NULL DEFAULT 0,
    score_max INTEGER NOT NULL DEFAULT 10,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teams (
    team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id UUID UNIQUE DEFAULT gen_random_uuid(),
    hackathon_id UUID REFERENCES public.hackathons(id) ON DELETE CASCADE,
    problem_statement_id UUID REFERENCES public.problem_statements(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    member_ids UUID[] NOT NULL DEFAULT '{}',
    coverage_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    diversity_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'forming' CHECK (status IN ('forming', 'ready', 'submitted', 'evaluated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    hackathon_id UUID REFERENCES public.hackathons(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
    name TEXT,
    email TEXT,
    college_name TEXT,
    github_url TEXT,
    declared_skills TEXT[] DEFAULT '{}',
    skill_vector JSONB NOT NULL DEFAULT '{}'::jsonb,
    semantic_embedding vector(384),
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'approved', 'flagged', 'rejected', 'teamed')),
    team_id UUID REFERENCES public.teams(team_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviewers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    hackathon_id UUID REFERENCES public.hackathons(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT NOT NULL,
    institution TEXT,
    expertise_domains TEXT[] DEFAULT '{}',
    expertise_vector JSONB NOT NULL DEFAULT '{}'::jsonb,
    availability INTEGER NOT NULL DEFAULT 8,
    conflicts TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID REFERENCES public.hackathons(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(team_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    github_repo TEXT,
    demo_url TEXT,
    pitch_url TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'assigned', 'evaluated')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Existing RLS migrations refer to idea_submissions, so keep this compatibility table.
CREATE TABLE IF NOT EXISTS public.idea_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID REFERENCES public.hackathons(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(team_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    github_repo TEXT,
    demo_url TEXT,
    status TEXT NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID REFERENCES public.hackathons(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.reviewers(id) ON DELETE CASCADE,
    expertise_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    workload_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    conflict_flag BOOLEAN NOT NULL DEFAULT false,
    cost_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'declined', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (submission_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID REFERENCES public.hackathons(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.reviewers(id) ON DELETE CASCADE,
    scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    weighted_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (submission_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS public.audit_events (
    sequence_number BIGSERIAL PRIMARY KEY,
    event_id UUID NOT NULL DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID,
    action TEXT NOT NULL,
    actor_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    previous_hash TEXT,
    event_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_hackathon ON public.registrations(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_participants_hackathon ON public.participants(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_teams_hackathon ON public.teams(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_submissions_hackathon ON public.submissions(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_assignments_hackathon ON public.assignments(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_hackathon ON public.evaluations(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON public.audit_events(entity_type, entity_id);

CREATE OR REPLACE FUNCTION public.append_audit_event(
    p_entity_type TEXT,
    p_entity_id UUID,
    p_action TEXT,
    p_actor_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS public.audit_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_previous_hash TEXT;
    v_created_at TIMESTAMP WITH TIME ZONE := NOW();
    v_event public.audit_events;
BEGIN
    SELECT event_hash
      INTO v_previous_hash
      FROM public.audit_events
     ORDER BY sequence_number DESC
     LIMIT 1;

    INSERT INTO public.audit_events (
        entity_type,
        entity_id,
        action,
        actor_id,
        metadata,
        previous_hash,
        event_hash,
        created_at
    )
    VALUES (
        p_entity_type,
        p_entity_id,
        p_action,
        p_actor_id,
        COALESCE(p_metadata, '{}'::jsonb),
        v_previous_hash,
        encode(
            digest(
                COALESCE(v_previous_hash, '') ||
                p_entity_type ||
                COALESCE(p_entity_id::text, '') ||
                p_action ||
                COALESCE(p_actor_id::text, '') ||
                COALESCE(p_metadata::text, '{}') ||
                v_created_at::text,
                'sha256'
            ),
            'hex'
        ),
        v_created_at
    )
    RETURNING * INTO v_event;

    RETURN v_event;
END;
$$;

-- RLS Policies
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registration"
    ON registrations
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Organizers can view all registrations"
    ON registrations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'organizer'
        )
    );

CREATE POLICY "Users can insert their own registration"
    ON registrations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizers can update registrations"
    ON registrations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'organizer'
        )
    );
