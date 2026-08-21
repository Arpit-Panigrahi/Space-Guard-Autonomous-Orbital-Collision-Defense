import sys
import os
import datetime

# Add backend to path so we can import app
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.validation.iridium_cosmos_case import run_historical_replay

def verify_phase6():
    print("Running historical replay of the 2009 Iridium 33 / Cosmos 2251 collision...\n")
    
    result = run_historical_replay()
    
    if "error" in result:
        print(f"[FAIL] {result['error']}")
        return
        
    print(f"Time of Closest Approach (TCA): {result['tca_utc']}")
    print(f"Miss Distance: {result['miss_distance_km']:.3f} km")
    print(f"Relative Velocity: {result['relative_velocity_km_s']:.3f} km/s")
    print(f"Probability of Collision (Pc): {result['pc']:.6e}")
    print(f"Assigned Risk Tier: {result['risk_tier']}")
    
    # Validation checks
    tca = datetime.datetime.strptime(result['tca_utc'], '%Y-%m-%d %H:%M:%S UTC')
    
    print("\n--- Validation Checklist ---")
    if tca.hour == 16 and tca.minute == 56:
        print("[x] TCA matches historical time (~16:56 UTC).")
    else:
        print("[ ] TCA matches historical time (~16:56 UTC).")
        
    if result['relative_velocity_km_s'] > 11.0:
        print("[x] Hypervelocity collision confirmed (> 11 km/s).")
    else:
        print("[ ] Hypervelocity collision confirmed (> 11 km/s).")
        
    if result['risk_tier'] in ["Critical", "High"]:
        print("[x] System successfully flagged the historical event as High/Critical Risk!")
    else:
        print("[ ] System successfully flagged the historical event as High/Critical Risk!")

if __name__ == "__main__":
    verify_phase6()
