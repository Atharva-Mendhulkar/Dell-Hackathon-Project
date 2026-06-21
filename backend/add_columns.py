from app.database import execute

def alter_table():
    try:
        execute("ALTER TABLE participants ADD COLUMN IF NOT EXISTS year_of_study VARCHAR;")
        execute("ALTER TABLE participants ADD COLUMN IF NOT EXISTS gender VARCHAR;")
        execute("ALTER TABLE participants ADD COLUMN IF NOT EXISTS location VARCHAR;")
        execute("ALTER TABLE participants ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR;")
        execute("ALTER TABLE participants ADD COLUMN IF NOT EXISTS skill_vector JSONB;")
        execute("ALTER TABLE participants ADD COLUMN IF NOT EXISTS vectorization_status VARCHAR(50);")
        execute("ALTER TABLE participants ADD COLUMN IF NOT EXISTS duplication_score FLOAT;")
        execute("ALTER TABLE participants ADD COLUMN IF NOT EXISTS degree VARCHAR;")
        execute("ALTER TABLE participants ADD COLUMN IF NOT EXISTS phone VARCHAR;")
        execute("ALTER TABLE participants ADD COLUMN IF NOT EXISTS email VARCHAR;")
        execute("ALTER TABLE participants ADD COLUMN IF NOT EXISTS status VARCHAR;")
        print("Columns added successfully!")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    alter_table()
