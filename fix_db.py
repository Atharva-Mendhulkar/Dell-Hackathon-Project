import os
import psycopg2
from dotenv import load_dotenv

def main():
    print("Fixing database schema and RLS...")
    load_dotenv(dotenv_path=".env")
    
    database_url = os.environ.get("DATABASE_URL")
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    queries = [
        "DROP TABLE IF EXISTS public.participants CASCADE;",
        
        """
        CREATE TABLE public.participants (
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
        """,
        
        "ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;",
        
        """
        CREATE POLICY "Users can insert their own participant record" ON public.participants
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        """,
        
        """
        DROP POLICY IF EXISTS "Users can insert their own registration record" ON public.registrations;
        CREATE POLICY "Users can insert their own registration record" ON public.registrations
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        """,
        
        """
        CREATE POLICY "Authenticated users can view participants" ON public.participants
        FOR SELECT USING (auth.role() = 'authenticated');
        """
    ]
    
    for i, q in enumerate(queries):
        try:
            cur.execute(q)
            conn.commit()
            print(f"Query {i+1} executed.")
        except Exception as e:
            conn.rollback()
            print(f"Query {i+1} failed: {e}")

    # Don't forget to enable realtime for participants again
    try:
        cur.execute("ALTER PUBLICATION supabase_realtime ADD TABLE participants;")
        conn.commit()
        print("Realtime enabled for participants.")
    except Exception as e:
        conn.rollback()
        print(f"Realtime info: {e}")

    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
