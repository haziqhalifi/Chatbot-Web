from fastapi import APIRouter, HTTPException
from middleware.database_middleware import get_db_stats
from database.connection import get_connection_pool, get_pool_stats, DatabaseConnection

router = APIRouter()

@router.get("/health/database")
async def database_health():
    """Check database connection pool health"""
    try:
        pool_stats = get_pool_stats()
        middleware_stats = get_db_stats()
        
        # Test a simple connection
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
        
        return {
            "status": pool_stats["status"],
            "connection_pool": pool_stats,
            "request_stats": middleware_stats
        }
        
    except Exception as e:
        pool_stats = get_pool_stats()
        return {
            "status": "unhealthy",
            "error": str(e),
            "connection_pool": pool_stats
        }

@router.get("/health/database/stats")
async def database_stats():
    """Get detailed database statistics"""
    try:
        pool_stats = get_pool_stats()
        middleware_stats = get_db_stats()
        
        return {
            "connection_pool": pool_stats,
            "request_statistics": middleware_stats,
            "recommendations": get_performance_recommendations(pool_stats, middleware_stats)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get database stats: {e}")

def get_performance_recommendations(pool_stats, request_stats):
    """Generate performance recommendations based on current stats"""
    recommendations = []
    
    usage_percent = pool_stats.get("utilization_percent", 0)
    
    if usage_percent > 90:
        recommendations.append("⚠️ CRITICAL: Connection pool usage above 90%. Increase max_connections immediately!")
    elif usage_percent > 80:
        recommendations.append("⚠️ WARNING: High connection pool usage detected. Consider increasing max_connections.")
    elif usage_percent > 70:
        recommendations.append("Connection pool usage is moderate. Monitor for sustained high usage.")
    
    if request_stats["failed_requests"] > 0:
        failure_rate = (request_stats["failed_requests"] / max(request_stats["total_requests"], 1)) * 100
        if failure_rate > 5:
            recommendations.append(f"❌ High failure rate ({failure_rate:.1f}%). Check for connection leaks or increase pool size.")
    
    if request_stats["retry_attempts"] > request_stats["total_requests"] * 0.1:
        recommendations.append("🔄 High retry attempts detected. Consider optimizing database queries or increasing pool size.")
    
    if pool_stats.get("status") == "critical":
        recommendations.append("🚨 Pool is in CRITICAL state. Restart recommended if this persists.")
    
    if not recommendations:
        recommendations.append("✅ Database performance looks good!")
    
    return recommendations
