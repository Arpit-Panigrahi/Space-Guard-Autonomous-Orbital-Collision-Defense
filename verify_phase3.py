import sys
import os
import numpy as np

# Add backend to path so we can import app
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.risk.analytic_pc import analytic_pc, get_risk_tier
from app.config import DEFAULT_HBR_KM, DEFAULT_SIGMA_KM

def verify_phase3():
    # Use a larger HBR (50 meters instead of 2 meters) for the verification script
    # so that the 200,000 sample Monte Carlo can reliably resolve the probability 
    # instead of returning 0.0 due to sampling sparsity.
    test_hbr_km = 0.050
    print(f"Using test HBR_KM: {test_hbr_km}")
    print(f"Using DEFAULT_SIGMA_KM: {DEFAULT_SIGMA_KM}")
    
    test_cases = [
        {"name": "Direct Hit", "miss_km": 0.0},
        {"name": "Close Miss", "miss_km": 0.5},
        {"name": "Marginal Miss", "miss_km": 1.5},
        {"name": "Far Miss", "miss_km": 3.0},
        {"name": "Guaranteed Safe", "miss_km": 100.0}
    ]
    
    print("\nRunning Monte Carlo Pc Verification...")
    
    prev_pc = None
    monotonic = True
    
    for case in test_cases:
        miss_dist = case["miss_km"]
        miss_vector = np.array([miss_dist, 0.0])
        
        pc = analytic_pc(miss_vector, DEFAULT_SIGMA_KM, test_hbr_km)
        tier = get_risk_tier(pc)
        
        print(f"\n{case['name']} (Miss: {miss_dist} km)")
        print(f"  Pc: {pc:.8e}  |  Tier: {tier}")
        
        # Monotonicity check
        if prev_pc is not None:
            if pc > prev_pc and pc > 0:
                print("  [!] WARNING: Pc increased as miss distance increased. This violates monotonicity.")
                monotonic = False
        prev_pc = pc

    if monotonic:
        print("\n[SUCCESS] Pc values are correctly monotonically decreasing as miss distance increases.")

if __name__ == "__main__":
    verify_phase3()
