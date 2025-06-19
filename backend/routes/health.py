from fastapi import APIRouter, HTTPException
from middleware.database_middleware import get_db_stats
from database.connection import get_connection_pool

router = APIRouter()

@router.get("/health/database")
async def database_health():
    """Check database connection pool health"""
    try:
        pool = get_connection_pool()
        stats = get_db_stats()
        
        # Test a simple connection
        with pool.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
        
        return {
            "status": "healthy",
            "connection_pool": {
                "active_connections": pool.active_connections,
                "max_connections": pool.max_connections,
                "min_connections": pool.min_connections,
                "pool_usage_percent": (pool.active_connections / pool.max_connections) * 100
            },
            "request_stats": stats
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "connection_pool": {
                "active_connections": pool.active_connections if 'pool' in locals() else 0,
                "max_connections": pool.max_connections if 'pool' in locals() else 0,
                "min_connections": pool.min_connections if 'pool' in locals() else 0
            }
        }

@router.get("/health/database/stats")
async def database_stats():
    """Get detailed database statistics"""
    try:
        pool = get_connection_pool()
        stats = get_db_stats()
        
        return {
            "connection_pool": {
                "active_connections": pool.active_connections,
                "max_connections": pool.max_connections,
                "min_connections": pool.min_connections,
                "pool_usage_percent": (pool.active_connections / pool.max_connections) * 100,
                "available_connections": pool.max_connections - pool.active_connections
            },
            "request_statistics": stats,
            "recommendations": get_performance_recommendations(pool, stats)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get database stats: {e}")

def get_performance_recommendations(pool, stats):
    """Generate performance recommendations based on current stats"""
    recommendations = []
    
    usage_percent = (pool.active_connections / pool.max_connections) * 100
    
    if usage_percent > 80:
        recommendations.append("High connection pool usage detected. Consider increasing max_connections.")
    
    if stats["failed_requests"] > 0:
        failure_rate = (stats["failed_requests"] / stats["total_requests"]) * 100
        if failure_rate > 5:
            recommendations.append(f"High failure rate ({failure_rate:.1f}%). Check for connection leaks.")
    
    if stats["retry_attempts"] > stats["total_requests"] * 0.1:
        recommendations.append("High retry attempts detected. Consider optimizing database queries.")
    
    if not recommendations:
        recommendations.append("Database performance looks good!")
    
    return recommendations
