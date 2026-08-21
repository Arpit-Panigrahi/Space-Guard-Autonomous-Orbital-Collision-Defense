import sys
import os
import asyncio
from fastapi.testclient import TestClient

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.api.main import app

def test_api_endpoints():
    print("=================================================================")
    print("🌐 SPACE-GUARD FASTAPI BACKEND HTTP INTEGRATION TEST SUITE")
    print("=================================================================")

    client = TestClient(app)

    # 1. Test /health endpoint
    print("\n[1/5] Testing GET /health...")
    resp = client.get("/health")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    print("  ✓ /health response:", data)
    assert data["status"] == "ok"
    assert "version" in data
    assert "service" in data

    # 2. Test /api/objects endpoint
    print("\n[2/5] Testing GET /api/objects?limit=10...")
    resp = client.get("/api/objects?limit=10")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    objects = data["objects"]
    print(f"  ✓ Propagated {len(objects)} satellites successfully (Count: {data.get('count')}).")
    assert len(objects) > 0
    sat0 = objects[0]
    print(f"  ✓ Sample satellite: {sat0.get('name')} (NORAD ID: {sat0.get('norad_id')})")
    assert "position_km" in sat0
    assert "velocity_km_s" in sat0

    # 3. Test /api/validation/iridium-cosmos endpoint
    print("\n[3/5] Testing GET /api/validation/iridium-cosmos...")
    resp = client.get("/api/validation/iridium-cosmos")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    print(f"  ✓ Historical 2009 Collision Replay Endpoint Response:")
    print(f"    - TCA: {data.get('tca_utc')}")
    print(f"    - Miss Distance: {data.get('miss_distance_km')} km")
    print(f"    - Closing Velocity: {data.get('relative_velocity_km_s')} km/s")
    print(f"    - Collision Probability: {data.get('pc'):.6e}")
    print(f"    - Risk Tier: {data.get('risk_tier')}")
    assert data.get("risk_tier") == "Critical"
    assert data.get("miss_distance_km") < 0.050

    # 4. Test /api/maneuver endpoint (with both full and partial payload)
    print("\n[4/5] Testing POST /api/maneuver...")
    payload_full = {
        "miss_distance_km": 0.003,
        "relative_velocity_km_s": 14.12,
        "delta_v_budget_m_s": 0.10,
        "burn_lead_time_hours": 24.0
    }
    resp = client.post("/api/maneuver", json=payload_full)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    data = resp.json()
    print(f"  ✓ Full Payload Maneuver Result:")
    print(f"    - Baseline Miss: {data['baseline_miss_distance_km']} km")
    print(f"    - Projected Miss: {data['projected_miss_distance_km']} km")
    print(f"    - RTN Burn Direction: {[round(x, 4) for x in data['burn_direction_rtn']]}")
    assert data['projected_miss_distance_km'] > 4.0

    # Test partial payload (without optional relative_velocity_km_s)
    payload_partial = {
        "miss_distance_km": 0.005,
        "delta_v_budget_m_s": 0.50,
        "burn_lead_time_hours": 12.0
    }
    resp_part = client.post("/api/maneuver", json=payload_partial)
    assert resp_part.status_code == 200, f"Expected 200, got {resp_part.status_code}: {resp_part.text}"
    print(f"  ✓ Partial Payload (omitted relative_velocity_km_s) succeeded with 200 OK.")

    # 5. Test /scan endpoint
    print("\n[5/5] Testing POST /scan...")
    resp = client.post("/scan")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    print(f"  ✓ Conjunction Screening Scan Completed:")
    print(f"    - Objects Ingested: {data.get('object_count')}")
    print(f"    - Candidate Pairs Filtered: {data.get('candidate_pairs')}")
    print(f"    - Conjunctions Surfaced: {data.get('events_found')}")
    assert "events" in data
    assert len(data["events"]) > 0

    print("\n=================================================================")
    print("✨ ALL 5 REST API ENDPOINTS VALIDATED SUCCESSFULLY (100% GREEN)")
    print("=================================================================")

if __name__ == "__main__":
    test_api_endpoints()
