"""
Script to initialize NADMA database and sync initial data
Run this once to set up the database tables and sync disasters
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.nadma_service import nadma_service


async def main():
    print("=" * 60)
    print("NADMA Database Initialization and Sync")
    print("=" * 60)
    
    # Step 1: Initialize database tables
    print("\n1. Creating database tables...")
    if nadma_service.initialize_database():
        print("✓ Database tables created successfully")
    else:
        print("✗ Failed to create database tables")
        return
    
    # Step 2: Sync data from NADMA API
    print("\n2. Syncing data from NADMA API...")
    result = await nadma_service.sync_from_api()
    
    if result["success"]:
        stats = result["stats"]
        print(f"✓ Sync completed successfully!")
        print(f"  - Total processed: {stats['success'] + stats['failed']}")
        print(f"  - Successful: {stats['success']}")
        print(f"  - Failed: {stats['failed']}")
        print(f"  - New records: {stats['new']}")
        print(f"  - Updated records: {stats['updated']}")
    else:
        print(f"✗ Sync failed: {result.get('error')}")
        return
    
    # Step 3: Display statistics
    print("\n3. Database statistics:")
    stats = nadma_service.get_statistics()
    
    print(f"  - Total disasters: {stats.get('total', 0)}")
    print(f"  - Active disasters: {stats.get('active', 0)}")
    print(f"  - Special cases: {stats.get('special_cases', 0)}")
    
    if stats.get('by_category'):
        print("\n  Disasters by category:")
        for category, count in stats['by_category'].items():
            print(f"    - {category}: {count}")
    
    if stats.get('by_state'):
        print("\n  Disasters by state:")
        for state, count in stats['by_state'].items():
            print(f"    - {state}: {count}")
    
    print("\n" + "=" * 60)
    print("Initialization complete!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
