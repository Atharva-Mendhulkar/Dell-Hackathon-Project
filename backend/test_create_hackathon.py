import requests
import sys

BASE_URL = "http://localhost:8000"

def test_create_hackathon():
    print("Testing POST /hackathons/ ...")
    payload = {
        "name": "Super AI Hackathon",
        "theme": "Artificial Intelligence",
        "description": "Build the next generation AI application.",
        "registration_start": "2026-07-01",
        "registration_end": "2026-07-15",
        "event_start": "2026-07-20",
        "event_end": "2026-07-22",
        "min_team_size": 2,
        "max_team_size": 5
    }
    
    response = requests.post(f"{BASE_URL}/hackathons/", json=payload)
    if response.status_code not in [200, 201]:
        print(f"FAILED. Status {response.status_code}, Body: {response.text}")
        sys.exit(1)
        
    data = response.json()
    assert "id" in data, f"Expected 'id' in response, got: {data}"
    assert data["name"] == payload["name"], f"Expected name {payload['name']}, got: {data.get('name')}"
    print("✅ Hackathon Creation Passed:", data)

def test_get_hackathons():
    print("Testing GET /hackathons/ ...")
    response = requests.get(f"{BASE_URL}/hackathons/")
    if response.status_code != 200:
        print(f"FAILED. Status {response.status_code}, Body: {response.text}")
        sys.exit(1)
        
    data = response.json()
    assert isinstance(data, list), f"Expected list, got: {type(data)}"
    print(f"✅ Get Hackathons Passed: Found {len(data)} hackathons.")

if __name__ == "__main__":
    try:
        test_create_hackathon()
        test_get_hackathons()
        print("\n🎉 ALL TESTS PASSED!")
    except AssertionError as e:
        print("\n❌ TEST FAILED:", e)
        sys.exit(1)
    except Exception as e:
        print("\n❌ UNEXPECTED ERROR:", e)
        sys.exit(1)
