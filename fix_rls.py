import asyncio
import os
from backend.app.database import execute

async def main():
    print("Fixing RLS policies for participants and registrations...")
    
    queries = [
        """
        -- Allow authenticated users to insert their own participant record
        DROP POLICY IF EXISTS "Users can insert their own participant record" ON public.participants;
        CREATE POLICY "Users can insert their own participant record" ON public.participants
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        """,
        """
        -- Allow authenticated users to insert their own registration record
        DROP POLICY IF EXISTS "Users can insert their own registration record" ON public.registrations;
        CREATE POLICY "Users can insert their own registration record" ON public.registrations
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        """
    ]
    
    for q in queries:
        await execute(q)
        print("Executed successfully.")

if __name__ == "__main__":
    asyncio.run(main())
