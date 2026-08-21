import sys
import os

# Add backend to path so we can import app
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.ingestion.tle_fetch import fetch_active_tles
from app.ingestion.tle_parser import parse_tles_from_text
from app.propagation.propagate import propagate_satellite
from skyfield.api import load

def verify_phase1():
    print("1. Fetching TLEs...")
    tle_text = fetch_active_tles()
    print(f"Fetched {len(tle_text)} bytes of TLE data.")
    
    print("\n2. Parsing TLEs...")
    sats = parse_tles_from_text(tle_text)
    print(f"Parsed {len(sats)} satellites.")
    
    # Find ISS (NORAD ID 25544)
    iss = next((s for s in sats if s.model.satnum == 25544), None)
    if not iss:
        print("ISS not found in active TLEs.")
        return
        
    print(f"\n3. Found ISS: {iss.name}")
    
    ts = load.timescale()
    t = ts.now()
    print(f"\n4. Propagating to Current UTC time: {t.utc_datetime()}")
    
    r_km, v_km_s = propagate_satellite(iss, t)
    
    print(f"\nResults in GCRS (ECI) frame:")
    print(f"Position (km): {r_km}")
    print(f"Velocity (km/s): {v_km_s}")
    
if __name__ == "__main__":
    verify_phase1()
