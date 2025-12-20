"""
NADMA Disaster Service
Handles business logic for NADMA disaster management
"""

from typing import List, Dict, Optional, Any
import httpx
import os
from dotenv import load_dotenv
from database.nadma import (
    create_nadma_tables,
    save_disaster,
    save_disasters_batch,
    get_all_disasters,
    get_disaster_statistics
)

load_dotenv()


class NADMAService:
    """Service for managing NADMA disaster data"""
    
    def __init__(self):
        self.api_url = os.getenv("NADMA_API_URL", "https://mydims.nadma.gov.my/api/disasters")
        self.api_token = os.getenv("NADMA_API_TOKEN", "6571756|yN5L6StiHQOlyouD5FjmMFBOeywAxjPE79x0m7n843ac4e63")
    
    async def fetch_from_api(self, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Fetch disasters from NADMA API
        
        Args:
            filters: Optional filters to apply
            
        Returns:
            Dictionary with success status and data
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_token}",
                "Content-Type": "application/json",
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.api_url,
                    headers=headers,
                    json=filters if filters else {}
                )
                
                response.raise_for_status()
                data = response.json()
                
                return {
                    "success": True,
                    "data": data if isinstance(data, list) else [data],
                    "count": len(data) if isinstance(data, list) else 1
                }
                
        except httpx.HTTPStatusError as e:
            return {
                "success": False,
                "error": f"API error: {e.response.status_code}",
                "data": []
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "data": []
            }
    
    async def sync_from_api(self, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Fetch disasters from API and save to database
        
        Args:
            filters: Optional filters to apply
            
        Returns:
            Dictionary with sync statistics
        """
        # Fetch from API
        api_result = await self.fetch_from_api(filters)
        
        if not api_result["success"]:
            return {
                "success": False,
                "error": api_result.get("error"),
                "stats": {}
            }
        
        # Save to database
        disasters = api_result["data"]
        stats = save_disasters_batch(disasters)
        
        return {
            "success": True,
            "stats": stats,
            "message": f"Synced {stats['success']} disasters ({stats['new']} new, {stats['updated']} updated)"
        }
    
    def get_disasters(
        self, 
        status: Optional[str] = None,
        limit: int = 100,
        from_database: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Get disasters from database
        
        Args:
            status: Filter by status
            limit: Maximum records
            from_database: Get from local database (True) or API (False)
            
        Returns:
            List of disasters
        """
        if from_database:
            return get_all_disasters(status=status, limit=limit)
        else:
            # Return empty for now, use sync_from_api instead
            return []
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get disaster statistics from database"""
        return get_disaster_statistics()
    
    def initialize_database(self) -> bool:
        """Initialize NADMA database tables"""
        return create_nadma_tables()


# Create singleton instance
nadma_service = NADMAService()


__all__ = ['NADMAService', 'nadma_service']
