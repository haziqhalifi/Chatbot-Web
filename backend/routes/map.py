from fastapi import APIRouter, HTTPException
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv

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
    Get disaster data from NADMA MyDIMS API
    
    This endpoint fetches real-time disaster information from Malaysia's
    National Disaster Management Agency (NADMA) MyDIMS system.
    
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
