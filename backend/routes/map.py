from fastapi import APIRouter, HTTPException, Header
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
from services.nadma_service import nadma_service

load_dotenv()

router = APIRouter()

class MapEndpoint(BaseModel):
    """Model for a map data endpoint"""
    name: str
    url: str
    type: str
    description: str

class MapEndpointsResponse(BaseModel):
    """Response model for map endpoints"""
    endpoints: List[MapEndpoint]

# ArcGIS Feature Server endpoints for Malaysia disaster data
MAP_ENDPOINTS = [
    {
        "name": "Land Slide Risk Area",
        "url": "https://services7.arcgis.com/DpGu4Fz48xobufjF/arcgis/rest/services/Land_Slide_Risk_Area/FeatureServer",
        "type": "landslide",
        "description": "Areas prone to landslides and slope failures in Malaysia"
    },
    {
        "name": "Flood Prone Area",
        "url": "https://services7.arcgis.com/DpGu4Fz48xobufjF/arcgis/rest/services/Flood_Prone_Area/FeatureServer",
        "type": "flood",
        "description": "Areas at risk of flooding during monsoon seasons in Malaysia"
    },
    {
        "name": "Place of Interest",
        "url": "https://services7.arcgis.com/DpGu4Fz48xobufjF/arcgis/rest/services/Place_of_Interest/FeatureServer",
        "type": "poi",
        "description": "Points of interest including emergency services and important facilities"
    },
    {
        "name": "Population",
        "url": "https://services7.arcgis.com/DpGu4Fz48xobufjF/arcgis/rest/services/Population/FeatureServer",
        "type": "population",
        "description": "Population density across Malaysia for evacuation planning"
    }
]

@router.get("/endpoints", response_model=MapEndpointsResponse)
def get_map_endpoints():
    """
    Get all available ArcGIS map data endpoints
    
    Returns:
        MapEndpointsResponse: List of available map data endpoints with URLs
    """
    return MapEndpointsResponse(endpoints=[MapEndpoint(**endpoint) for endpoint in MAP_ENDPOINTS])

@router.get("/endpoints/{endpoint_type}", response_model=MapEndpoint)
def get_map_endpoint_by_type(endpoint_type: str):
    """
    Get a specific map endpoint by type
    
    Args:
        endpoint_type: Type of map data (landslide, flood, poi, population)
        
    Returns:
        MapEndpoint: The requested map endpoint details
        
    Raises:
        HTTPException: If the endpoint type is not found
    """
    for endpoint in MAP_ENDPOINTS:
        if endpoint["type"] == endpoint_type.lower():
            return MapEndpoint(**endpoint)
    
    raise HTTPException(
        status_code=404, 
        detail=f"Map endpoint type '{endpoint_type}' not found. Available types: landslide, flood, poi, population"
    )

@router.get("/types")
def get_map_types():
    """
    Get all available map data types
    
    Returns:
        dict: List of available map data types
    """
    types = [endpoint["type"] for endpoint in MAP_ENDPOINTS]
    return {"types": types}

@router.post("/nadma/disasters")
async def get_nadma_disasters(filters: Optional[Dict[str, Any]] = None):
    """
    Get disaster data from NADMA MyDIMS API and automatically sync to database
    
    This endpoint fetches real-time disaster information from Malaysia's
    National Disaster Management Agency (NADMA) MyDIMS system and stores it
    in the local database for historical tracking.
    
    Args:
        filters: Optional dictionary of filters to apply to the disaster data
        
    Returns:
        dict: Disaster data from NADMA API
        
    Raises:
        HTTPException: If the API request fails
    """
    nadma_url = os.getenv("NADMA_API_URL", "https://mydims.nadma.gov.my/api/disasters")
    nadma_token = os.getenv("NADMA_API_TOKEN")
    
    if not nadma_token:
        raise HTTPException(
            status_code=500,
            detail="NADMA API token not configured"
        )
    
    # Use Bearer token format (matching Postman setup)
    headers = {
        "Authorization": f"Bearer {nadma_token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    # Log the request for debugging
    print(f"NADMA API Request:")
    print(f"URL: {nadma_url}")
    print(f"Token: {nadma_token}")
    print(f"Auth Header: Bearer {nadma_token}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # POST request with optional filters in the body
            response = await client.post(
                nadma_url,
                headers=headers,
                json=filters if filters else {}
            )
            
            print(f"Response Status: {response.status_code}")
            print(f"Response Headers: {response.headers}")
            
            response.raise_for_status()
            data = response.json()
            
            # Automatically sync to database for history
            try:
                disasters_list = data if isinstance(data, list) else [data]
                sync_result = await nadma_service.sync_from_api(filters)
                print(f"Auto-sync to DB: {sync_result.get('message', 'completed')}")
            except Exception as sync_error:
                print(f"Warning: Failed to auto-sync to database: {sync_error}")
                # Continue even if sync fails - real-time data is priority
            
            return {
                "success": True,
                "source": "NADMA MyDIMS",
                "data": data,
                "count": len(data) if isinstance(data, list) else 1
            }
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"NADMA API error: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Failed to connect to NADMA API: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing NADMA data: {str(e)}"
        )

@router.get("/nadma/disasters")
async def get_nadma_disasters_get():
    """
    Get disaster data from NADMA MyDIMS API (GET method for convenience)
    
    Returns:
        dict: Disaster data from NADMA API
    """
    return await get_nadma_disasters(filters=None)

@router.post("/nadma/sync")
async def sync_nadma_disasters(filters: Optional[Dict[str, Any]] = None):
    """
    Sync disaster data from NADMA API to database
    
    This endpoint fetches data from NADMA MyDIMS API and saves it to the local database.
    
    Args:
        filters: Optional dictionary of filters to apply to the disaster data
        
    Returns:
        dict: Sync statistics (success count, failed count, new records, updated records)
    """
    try:
        result = await nadma_service.sync_from_api(filters)
        
        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Failed to sync disasters")
            )
        
        return {
            "success": True,
            "message": result["message"],
            "statistics": result["stats"]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error syncing NADMA data: {str(e)}"
        )

@router.get("/nadma/disasters/db")
def get_nadma_disasters_from_db(
    status: Optional[str] = None,
    limit: int = 100
):
    """
    Get disaster data from local database
    
    Args:
        status: Filter by status (Aktif, Selesai, etc.)
        limit: Maximum number of records to return (default 100)
        
    Returns:
        dict: List of disasters from database
    """
    try:
        disasters = nadma_service.get_disasters(status=status, limit=limit)
        
        return {
            "success": True,
            "count": len(disasters),
            "data": disasters
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving disasters from database: {str(e)}"
        )

@router.get("/admin/nadma/history")
def get_nadma_history(
    status: Optional[str] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    limit: int = 500,
    x_api_key: str = Header(None)
):
    """
    Get all NADMA disaster history from database (Admin only)
    
    Args:
        status: Filter by status (Aktif, Selesai, etc.)
        category: Filter by category name
        state: Filter by state name
        limit: Maximum number of records to return (default 500)
        x_api_key: Admin API key
        
    Returns:
        dict: List of historical disasters from database
    """
    from config.settings import API_KEY_CREDITS
    from utils.chat import verify_api_key
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        disasters = nadma_service.get_disasters(status=status, limit=limit)
        
        # Apply additional filters if provided
        if category:
            disasters = [
                d for d in disasters
                if d.get('kategori', {}).get('name', '').lower() == category.lower()
            ]
        
        if state:
            disasters = [
                d for d in disasters
                if d.get('state', {}).get('name', '').lower() == state.lower()
            ]
        
        return {
            "success": True,
            "count": len(disasters),
            "data": disasters
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving disaster history: {str(e)}"
        )

@router.get("/nadma/statistics")
def get_nadma_statistics():
    """
    Get statistics about stored NADMA disasters
    
    Returns:
        dict: Statistics including total, active, by category, by state, special cases
    """
    try:
        stats = nadma_service.get_statistics()
        
        return {
            "success": True,
            "statistics": stats
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving statistics: {str(e)}"
        )

@router.post("/nadma/init-db")
def initialize_nadma_database():
    """
    Initialize NADMA database tables
    
    Creates all necessary tables for storing NADMA disaster data.
    Safe to call multiple times (checks if tables exist).
    
    Returns:
        dict: Success status
    """
    try:
        success = nadma_service.initialize_database()
        
        if success:
            return {
                "success": True,
                "message": "NADMA database tables created successfully"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to create NADMA database tables"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error initializing database: {str(e)}"
        )
