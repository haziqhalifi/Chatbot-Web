"""
Script to identify potential database connection leaks in the codebase.
This will find all get_db_conn() calls that don't properly close connections.
"""

import os
import re
from pathlib import Path

def analyze_file(filepath):
    """Analyze a Python file for potential connection leaks"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return []
    
    issues = []
    lines = content.split('\n')
    
    # Find all get_db_conn() calls
    for i, line in enumerate(lines, 1):
        if 'get_db_conn()' in line and 'with' not in line:
            # Check if there's a corresponding close() within next 50 lines
            has_close = False
            has_context_manager = 'with get_db_conn()' in line
            
            # Look ahead for conn.close() or return_connection
            for j in range(i, min(i + 50, len(lines))):
                if '.close()' in lines[j] or 'return_connection' in lines[j]:
                    has_close = True
                    break
            
            if not has_close and not has_context_manager:
                # Potential leak
                context_start = max(0, i - 3)
                context_end = min(len(lines), i + 3)
                context = '\n'.join(f"{idx+1:4d}: {lines[idx]}" for idx in range(context_start, context_end))
                
                issues.append({
                    'file': filepath,
                    'line': i,
                    'code': line.strip(),
                    'context': context,
                    'type': 'POTENTIAL_LEAK'
                })
    
    return issues

def scan_directory(directory):
    """Scan all Python files in directory"""
    all_issues = []
    
    for root, dirs, files in os.walk(directory):
        # Skip certain directories
        if any(skip in root for skip in ['__pycache__', 'venv', 'env', '.git', 'node_modules']):
            continue
            
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                issues = analyze_file(filepath)
                all_issues.extend(issues)
    
    return all_issues

def main():
    """Main analysis function"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(script_dir)  # Go up one level from scripts/
    
    print("=" * 80)
    print("DATABASE CONNECTION LEAK DETECTOR")
    print("=" * 80)
    print(f"\nScanning: {backend_dir}\n")
    
    issues = scan_directory(backend_dir)
    
    if not issues:
        print("OK - No obvious connection leaks detected!")
        return
    
    print(f"WARNING - Found {len(issues)} potential connection leaks:\n")
    
    # Group by file
    by_file = {}
    for issue in issues:
        file = issue['file']
        if file not in by_file:
            by_file[file] = []
        by_file[file].append(issue)
    
    for filepath, file_issues in sorted(by_file.items()):
        rel_path = os.path.relpath(filepath, backend_dir)
        print(f"\n[FILE] {rel_path} ({len(file_issues)} issues)")
        print("-" * 80)
        
        for issue in file_issues:
            print(f"\n  Line {issue['line']}: {issue['code']}")
            print(f"  Type: {issue['type']}")
            print(f"\n  Context:")
            for line in issue['context'].split('\n'):
                marker = ">>> " if str(issue['line']) in line.split(':')[0] else "    "
                print(f"  {marker}{line}")
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total files with issues: {len(by_file)}")
    print(f"Total potential leaks: {len(issues)}")
    print("\nRECOMMENDATION:")
    print("1. Review each instance above")
    print("2. Wrap get_db_conn() calls in 'with' statement")
    print("3. Or ensure conn.close() is called in finally block")
    print("\nSee CONNECTION_POOL_FIX.md for detailed migration guide")
    print("=" * 80)

if __name__ == "__main__":
    main()
