"""Test script to verify NULL severity"""
from database.reports import get_all_reports
import json

result = get_all_reports()
reports_with_null = [r for r in result['reports'] if r['severity'] is None]

print(f"Reports with NULL severity: {len(reports_with_null)}")
print(f"Total reports: {len(result['reports'])}")

if reports_with_null:
    print("\nFirst report with NULL severity:")
    print(json.dumps(reports_with_null[0], indent=2))
else:
    print("\nAll reports have assigned severity")
    print("\nExample report:")
    print(json.dumps(result['reports'][0], indent=2))
