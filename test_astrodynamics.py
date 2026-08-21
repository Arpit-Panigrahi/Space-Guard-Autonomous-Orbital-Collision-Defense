import sys
import os
import numpy as np
from skyfield.api import EarthSatellite, load

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.app.propagation.propagate import propagate_satellite
from backend.app.risk.analytic_pc import analytic_pc, get_risk_tier
from backend.app.maneuver.cw_planner import plan_maneuver, cw_stm
from backend.app.validation.iridium_cosmos_case import run_historical_replay

def test_astrodynamics_engine():
    print("=================================================================")
    print("🛰️  SPACE-GUARD COMPREHENSIVE ASTRODYNAMICS & PHYSICS TEST SUITE")
    print("=================================================================")

    # 1. SGP4 Propagation Test
    print("\n[1/4] Testing SGP4 Numerical Propagation...")
    ts = load.timescale()
    tle_line1 = "1 24946U 97051C   09041.47291667  .00000078  00000-0  34479-4 0  9990"
    tle_line2 = "2 24946  86.3980 235.8073 0002131 103.8824 256.2801 14.34215357593570"
    sat = EarthSatellite(tle_line1, tle_line2, "IRIDIUM 33", ts)
    t = ts.utc(2009, 2, 10, 16, 56, 0)
    pos, vel = propagate_satellite(sat, t)
    
    r_mag = float(np.linalg.norm(pos))
    v_mag = float(np.linalg.norm(vel))
    print(f"  ✓ Iridium 33 Position: [{pos[0]:.2f}, {pos[1]:.2f}, {pos[2]:.2f}] km (|r| = {r_mag:.2f} km, alt ≈ {r_mag - 6378.137:.1f} km)")
    print(f"  ✓ Iridium 33 Velocity: [{vel[0]:.2f}, {vel[1]:.2f}, {vel[2]:.2f}] km/s (|v| = {v_mag:.2f} km/s)")
    assert 6500 < r_mag < 7500, "Orbital radius out of expected LEO range"
    assert 7.0 < v_mag < 8.0, "Orbital velocity out of expected circular LEO range"

    # 2. Foster/Alfano Analytic Collision Probability Test
    print("\n[2/4] Testing Foster/Alfano 2D Analytic Collision Probability (Pc)...")
    vec_crit = np.array([0.0021, -0.0021, 0.0])  # 3m miss
    vec_mod = np.array([0.3, 0.3, 0.0])         # ~424m miss
    vec_safe = np.array([3.4, 3.4, 0.0])         # ~4.8km miss

    pc_crit = analytic_pc(vec_crit, sigma_km=0.5, hbr_km=0.010)
    tier_crit = get_risk_tier(pc_crit)
    print(f"  ✓ Critical Grazing (3m miss): Pc = {pc_crit:.6e} -> Tier: {tier_crit}")
    assert pc_crit > 1e-4, "Critical miss should exceed 1e-4 Pc threshold"
    assert tier_crit == "Critical", "Risk tier must be Critical"

    pc_mod = analytic_pc(vec_mod, sigma_km=0.5, hbr_km=0.010)
    tier_mod = get_risk_tier(pc_mod)
    print(f"  ✓ Moderate Pass (424m miss): Pc = {pc_mod:.6e} -> Tier: {tier_mod}")

    pc_safe = analytic_pc(vec_safe, sigma_km=0.5, hbr_km=0.010)
    tier_safe = get_risk_tier(pc_safe)
    print(f"  ✓ Safe Separation (4.8km miss): Pc = {pc_safe:.6e} -> Tier: {tier_safe}")
    assert pc_safe < 1e-6, "Cleared trajectory should be in Low risk tier"

    # 3. Clohessy-Wiltshire STM & SVD Maneuver Optimizer Test
    print("\n[3/4] Testing Clohessy-Wiltshire STM & SVD Maneuver Optimization...")
    r_target_km = 6787.0
    mu = 398600.4418
    n_rad_s = float(np.sqrt(mu / (r_target_km ** 3)))
    dt_s = 24.0 * 3600.0
    dv_m_s = 0.10

    man = plan_maneuver(np.zeros(3), np.zeros(3), n_rad_s, dt_s, dv_m_s)
    burn_shift_km = man["projected_miss_distance_km"]
    total_proj_km = 0.003 + burn_shift_km
    print(f"  ✓ Optimal Burn Direction (RTN): {[round(x, 4) for x in man['burn_direction_rtn']]}")
    print(f"  ✓ Pure ΔV Separation Gain (24h lead): +{burn_shift_km:.2f} km")
    print(f"  ✓ Projected Post-Burn Clearance: {total_proj_km:.2f} km")
    assert total_proj_km > 4.5, "24h burn with 0.1 m/s must create >4.5km separation"

    # 4. 2009 Historical Collision Benchmark Replay Test
    print("\n[4/4] Testing 2009 Iridium 33 / Cosmos 2251 Collision Benchmark Replay...")
    case = run_historical_replay()
    print(f"  ✓ Predicted TCA: {case['tca_utc']}")
    print(f"  ✓ Relative Closing Speed: {case['relative_velocity_km_s']:.2f} km/s (Perpendicular impact)")
    print(f"  ✓ Baseline Miss Distance: {case['miss_distance_km'] * 1000:.1f} meters (Critical Collision)")
    print(f"  ✓ Baseline Pc: {case['pc']:.6e} ({case['risk_tier']})")
    assert case['miss_distance_km'] < 0.05, "Historical 2009 miss should be sub-50m"
    assert case['risk_tier'] == "Critical", "2009 collision must evaluate as Critical"

    print("\n=================================================================")
    print("✨ ALL 4 ASTRODYNAMICS & PHYSICS TEST SUITES PASSED (100% GREEN)")
    print("=================================================================")

if __name__ == "__main__":
    test_astrodynamics_engine()
