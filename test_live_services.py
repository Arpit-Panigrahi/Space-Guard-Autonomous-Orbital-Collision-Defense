import time
import requests
import json

def benchmark_live_services():
    print("=================================================================")
    print("🚀 LIVE FULL-STACK API & SERVICES BENCHMARK")
    print("=================================================================")

    endpoints = [
        {
            "name": "Frontend Web App (Vite React 19)",
            "url": "http://localhost:5173/",
            "method": "GET",
            "payload": None
        },
        {
            "name": "Backend Health & Telemetry",
            "url": "http://localhost:8000/health",
            "method": "GET",
            "payload": None
        },
        {
            "name": "Catalog SGP4 Objects Ephemeris",
            "url": "http://localhost:8000/api/objects?limit=25",
            "method": "GET",
            "payload": None
        },
        {
            "name": "2009 Collision Validation Case",
            "url": "http://localhost:8000/api/validation/iridium-cosmos",
            "method": "GET",
            "payload": None
        },
        {
            "name": "CW-SVD Impulsive Maneuver Planner",
            "url": "http://localhost:8000/api/maneuver",
            "method": "POST",
            "payload": {
                "miss_distance_km": 0.003,
                "delta_v_budget_m_s": 0.10,
                "burn_lead_time_hours": 24.0
            }
        },
        {
            "name": "Conjunction Screening Engine",
            "url": "http://localhost:8000/scan",
            "method": "POST",
            "payload": {}
        }
    ]

    results = []

    for ep in endpoints:
        name = ep["name"]
        url = ep["url"]
        method = ep["method"]
        payload = ep["payload"]

        try:
            t0 = time.perf_counter()
            if method == "GET":
                res = requests.get(url, timeout=15)
            else:
                res = requests.post(url, json=payload, timeout=15)
            latency_ms = (time.perf_counter() - t0) * 1000.0

            content_length = len(res.content)
            status_code = res.status_code

            summary = ""
            if "json" in res.headers.get("Content-Type", ""):
                data = res.json()
                if "status" in data:
                    summary = f"status={data['status']}, version={data.get('version', 'N/A')}"
                elif "count" in data:
                    summary = f"{data['count']} objects propagated"
                elif "projected_miss_distance_km" in data:
                    summary = f"projected_miss={data['projected_miss_distance_km']}km, gain=+{data.get('projected_miss_distance_km',0)-data.get('baseline_miss_distance_km',0):.2f}km"
                elif "events_found" in data:
                    summary = f"events={data['events_found']}, pairs={data.get('candidate_pairs')}, sats={data.get('object_count')}"
                elif "tca_utc" in data:
                    summary = f"TCA={data['tca_utc']}, Pc={data.get('pc', 0):.2e}, tier={data.get('risk_tier')}"
            else:
                summary = f"HTML document ({content_length} bytes)"

            results.append({
                "name": name,
                "url": url,
                "method": method,
                "status": status_code,
                "latency_ms": latency_ms,
                "size_bytes": content_length,
                "summary": summary,
                "ok": status_code == 200
            })

        except Exception as e:
            results.append({
                "name": name,
                "url": url,
                "method": method,
                "status": "ERR",
                "latency_ms": 0.0,
                "size_bytes": 0,
                "summary": str(e),
                "ok": False
            })

    print(f"\n{'SERVICE / ENDPOINT':<36} | {'METHOD':<6} | {'STATUS':<6} | {'LATENCY':<10} | {'SIZE':<9} | {'LIVE DATA SUMMARY'}")
    print("-" * 115)
    for r in results:
        status_icon = "🟢" if r["ok"] else "🔴"
        lat_str = f"{r['latency_ms']:.1f} ms"
        size_str = f"{r['size_bytes']:,} B"
        print(f"{status_icon} {r['name']:<34} | {r['method']:<6} | {str(r['status']):<6} | {lat_str:<10} | {size_str:<9} | {r['summary']}")

    all_passed = all(r["ok"] for r in results)
    print("\n=================================================================")
    if all_passed:
        print("✨ ALL LIVE FRONTEND & BACKEND SERVICES TESTED & OPERATIONAL (100% GREEN)")
    else:
        print("⚠️ SOME ENDPOINTS FAILED")
    print("=================================================================")

if __name__ == "__main__":
    benchmark_live_services()
