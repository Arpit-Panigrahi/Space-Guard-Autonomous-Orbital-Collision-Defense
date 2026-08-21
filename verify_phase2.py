import sys
import os
import time

# Add backend to path so we can import app
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.ingestion.tle_fetch import fetch_active_tles
from app.ingestion.tle_parser import parse_tles_from_text
from app.screening.coarse_filter import filter_pairs
from app.screening.conjunction import find_conjunctions
from skyfield.api import load

def verify_phase2():
    print("1. Fetching TLEs...")
    tle_text = fetch_active_tles()
    
    print("\n2. Parsing TLEs...")
    sats = parse_tles_from_text(tle_text)
    print(f"Parsed {len(sats)} satellites.")
    
    # Take a subset of 300 to keep it under a minute for testing
    subset = sats[:300]
    n = len(subset)
    total_pairs = n * (n - 1) // 2
    print(f"\nUsing subset of {n} satellites ({total_pairs} pairs).")
    
    print("\n3. Running Stage 1: Coarse Filter...")
    t0_stage1 = time.time()
    candidates = filter_pairs(subset, margin_km=50.0)
    t1_stage1 = time.time()
    
    print(f"Stage 1 completed in {t1_stage1 - t0_stage1:.3f} seconds.")
    print(f"Filtered {total_pairs} pairs down to {len(candidates)} candidate pairs.")
    
    ts = load.timescale()
    t_start = ts.now()
    t_end = ts.tt_jd(t_start.tt + 3.0) # 72 hours (3 days)
    
    print("\n4. Running Stage 2: Refined Conjunction Search (72h window)...")
    all_events = []
    t0_stage2 = time.time()
    
    for i, (sat_i, sat_j) in enumerate(candidates):
        if i % 100 == 0 and i > 0:
            print(f"  Processed {i}/{len(candidates)} candidate pairs...")
            
        events = find_conjunctions(sat_i, sat_j, ts, t_start, t_end, screen_threshold_km=50.0)
        all_events.extend(events)
        
    t1_stage2 = time.time()
    print(f"Stage 2 completed in {t1_stage2 - t0_stage2:.3f} seconds.")
    
    # Sort events by miss distance
    all_events.sort(key=lambda x: x["miss_distance_km"])
    
    print(f"\nFound {len(all_events)} conjunction events < 50 km in the next 72 hours.")
    for idx, event in enumerate(all_events[:10]):
        sat_i = event["sat_i"].name
        sat_j = event["sat_j"].name
        tca = event["tca_time"].utc_datetime()
        dist = event["miss_distance_km"]
        print(f"[{idx+1}] {sat_i} vs {sat_j}")
        print(f"    TCA: {tca} | Miss Distance: {dist:.3f} km")

if __name__ == "__main__":
    verify_phase2()
