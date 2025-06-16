from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import os
from database import (
    get_admin_dashboard_stats, get_system_status, get_all_faqs, 
    get_faq_by_id, add_faq, update_faq, delete_faq
)
from chat_utils import verify_api_key
from rag_utils import get_rag_system
from performance_utils import get_performance_stats

router = APIRouter()

class FAQCreate(BaseModel):
    question: str
    answer: str
    category: Optional[str] = None
    order_index: Optional[int] = 0

class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    order_index: Optional[int] = None

# Dashboard endpoints
@router.get("/admin/dashboard/stats")
def get_dashboard_stats(x_api_key: str = Header(None)):
    """Get dashboard statistics for admin dashboard"""
    from main import API_KEY_CREDITS  # Import from main to avoid circular imports
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        stats = get_admin_dashboard_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/system/status")
def get_admin_system_status(x_api_key: str = Header(None)):
    """Get system status for admin dashboard"""
    from main import API_KEY_CREDITS  # Import from main to avoid circular imports
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        status = get_system_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# RAG management endpoints
@router.post("/rebuild-rag")
def rebuild_rag(x_api_key: str = Header(None)):
    """Rebuild RAG embeddings (requires API key)"""
    from main import API_KEY_CREDITS  # Import from main to avoid circular imports
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        rag = get_rag_system()
        rag.initialize_or_update(force_rebuild=True)
        return {"message": "RAG embeddings rebuilt successfully", "documents_count": len(rag.documents)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rebuild RAG: {str(e)}")

@router.get("/rag-status")
def get_rag_status(x_api_key: str = Header(None)):
    """Get RAG system status (requires API key)"""
    from main import API_KEY_CREDITS  # Import from main to avoid circular imports
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        rag = get_rag_system()
        
        return {
            "documents_count": len(rag.documents) if rag.documents else 0,
            "embeddings_loaded": rag.embeddings is not None,
            "documents_path": rag.documents_path,
            "available_files": [f for f in os.listdir(rag.documents_path) if f.endswith('.pdf')] if os.path.exists(rag.documents_path) else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get RAG status: {str(e)}")

@router.get("/performance")
def get_performance_metrics(x_api_key: str = Header(None)):
    """Get performance metrics (requires API key)"""
    from main import API_KEY_CREDITS  # Import from main to avoid circular imports
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    return get_performance_stats()

# FAQ endpoints
@router.get("/faqs")
def get_faqs():
    """Get all active FAQs"""
    try:
        faqs = get_all_faqs()
        return {"faqs": faqs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/faqs/{faq_id}")
def get_faq(faq_id: int):
    """Get a specific FAQ by ID"""
    try:
        faq = get_faq_by_id(faq_id)
        if not faq:
            raise HTTPException(status_code=404, detail="FAQ not found")
        return faq
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/faqs")
def create_faq(faq: FAQCreate, x_api_key: str = Header(None)):
    """Create a new FAQ (Admin only)"""
    from main import API_KEY_CREDITS  # Import from main to avoid circular imports
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        faq_id = add_faq(faq.question, faq.answer, faq.category, faq.order_index)
        if faq_id:
            return {"message": "FAQ created successfully", "faq_id": faq_id}
        else:
            raise HTTPException(status_code=500, detail="Failed to create FAQ")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/faqs/{faq_id}")
def update_faq_endpoint(faq_id: int, faq: FAQUpdate, x_api_key: str = Header(None)):
    """Update an existing FAQ (Admin only)"""
    from main import API_KEY_CREDITS  # Import from main to avoid circular imports
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        success = update_faq(
            faq_id, 
            faq.question, 
            faq.answer, 
            faq.category, 
            faq.order_index
        )
        if success:
            return {"message": "FAQ updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="FAQ not found or failed to update")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/admin/faqs/{faq_id}")
def delete_faq_endpoint(faq_id: int, x_api_key: str = Header(None)):
    """Delete an FAQ (Admin only)"""
    from main import API_KEY_CREDITS  # Import from main to avoid circular imports
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        success = delete_faq(faq_id)
        if success:
            return {"message": "FAQ deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="FAQ not found or failed to delete")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
