import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

tests = []

def run_test(name, path, method="GET", data=None, expected_status=200):
    url = f"{BASE_URL}{path}"
    headers = {"User-Agent": "DevInsights-QA-Tester"}
    if data:
        headers["Content-Type"] = "application/json"
        body = json.dumps(data).encode("utf-8")
    else:
        body = None
        
    start = time.time()
    try:
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=10) as resp:
            elapsed = time.time() - start
            status = resp.status
            resp_body = resp.read().decode("utf-8")
            passed = (status == expected_status)
            return {
                "name": name,
                "path": path,
                "method": method,
                "status": status,
                "expected": expected_status,
                "passed": passed,
                "elapsed_ms": round(elapsed * 1000, 2),
                "error": None
            }
    except urllib.error.HTTPError as e:
        elapsed = time.time() - start
        status = e.code
        err_body = e.read().decode("utf-8", errors="ignore")[:100]
        passed = (status == expected_status)
        return {
            "name": name,
            "path": path,
            "method": method,
            "status": status,
            "expected": expected_status,
            "passed": passed,
            "elapsed_ms": round(elapsed * 1000, 2),
            "error": err_body
        }
    except Exception as e:
        elapsed = time.time() - start
        return {
            "name": name,
            "path": path,
            "method": method,
            "status": 0,
            "expected": expected_status,
            "passed": False,
            "elapsed_ms": round(elapsed * 1000, 2),
            "error": str(e)
        }

test_cases = [
    # Health
    ("Health Check", "/health", "GET", None, 200),
    # Developers
    ("Overview (Valid)", "/developers/torvalds/overview", "GET", None, 200),
    ("Overview (Non-existent)", "/developers/nonexistent999999999/overview", "GET", None, 404),
    ("Repositories (Default)", "/developers/torvalds/repositories", "GET", None, 200),
    ("Repositories (Sort Stars)", "/developers/torvalds/repositories?sort=stars&order=desc", "GET", None, 200),
    ("Repositories (Invalid Sort)", "/developers/torvalds/repositories?sort=invalid_column", "GET", None, 422),
    ("Languages", "/developers/torvalds/languages", "GET", None, 200),
    ("Activity", "/developers/torvalds/activity", "GET", None, 200),
    ("Contributions (2026)", "/developers/torvalds/contributions?year=2026", "GET", None, 200),
    ("Portfolio Audit", "/developers/torvalds/portfolio-audit", "GET", None, 200),
    ("Smart Insights", "/developers/torvalds/insights", "GET", None, 200),
    # Compare
    ("Compare (2 Valid Devs)", "/developers/compare?usernames=torvalds,gaearon", "GET", None, 200),
    ("Compare (<2 Devs Error)", "/developers/compare?usernames=torvalds", "GET", None, 400),
    ("Compare (>4 Devs Error)", "/developers/compare?usernames=torvalds,gaearon,shadcn,sindresorhus,facebook", "GET", None, 400),
    ("Compare (Missing param)", "/developers/compare", "GET", None, 422),
    # Snapshots
    ("Get Snapshots (Empty)", "/snapshots/torvalds", "GET", None, 200),
    ("Create Snapshot", "/snapshots/torvalds", "POST", {"username": "torvalds", "note": "QA automated baseline snapshot"}, 200),
    ("Get Snapshots (After create)", "/snapshots/torvalds", "GET", None, 200),
    # Preferences
    ("Get Preferences", "/preferences?user_key=qa_user", "GET", None, 200),
    ("Update Preferences", "/preferences?user_key=qa_user", "POST", {
        "theme": "dark",
        "layout_mode": "compact",
        "visible_widgets": ["metrics", "heatmap", "languages"]
    }, 200),
    # Reports & Exports
    ("Export JSON", "/reports/torvalds/json", "GET", None, 200),
    ("Export CSV", "/reports/torvalds/csv", "GET", None, 200),
    ("Export PDF", "/reports/torvalds/pdf", "GET", None, 200),
    # Security Injection Checks
    ("SQL Injection in Username", "/developers/%27%20OR%201=1--/overview", "GET", None, 404),
    ("Path Traversal in Username", "/developers/..%2F..%2Fetc%2Fpasswd/overview", "GET", None, 404),
    ("XSS in Snapshot Note", "/snapshots/torvalds", "POST", {"username": "torvalds", "note": "<script>alert('xss')</script>"}, 200),
    # Root / Unregistered Route
    ("Unregistered Route 404", "/developers/torvalds/nonexistent", "GET", None, 404),
]

results = []
for tc in test_cases:
    res = run_test(*tc)
    results.append(res)
    mark = "PASS" if res["passed"] else "FAIL"
    print(f"[{mark}] {res['name']}: {res['status']} (Expected: {res['expected']}) in {res['elapsed_ms']}ms")

passed_count = sum(1 for r in results if r["passed"])
failed_count = len(results) - passed_count
print(f"\nSummary: {passed_count}/{len(results)} passed ({round(passed_count/len(results)*100, 1)}%)")
with open("qa_api_results.json", "w") as f:
    json.dump(results, f, indent=2)
