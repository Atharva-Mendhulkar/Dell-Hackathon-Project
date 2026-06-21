from app.database import fetch_all

def get_first_user():
    res = fetch_all("SELECT id FROM auth.users LIMIT 1")
    if res:
        print(res[0]['id'])
    else:
        print("NO_USER")

if __name__ == "__main__":
    get_first_user()
