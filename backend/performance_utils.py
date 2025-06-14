import time
import logging
from typing import Optional
from config import GENERAL_QUESTION_KEYWORDS, PERFORMANCE_SETTINGS

logger = logging.getLogger(__name__)

def is_general_question(query: str) -> bool:
    """
    Check if the query is a general question that doesn't need RAG
    """
    if not PERFORMANCE_SETTINGS.get("skip_rag_for_general_questions", True):
        return False
    
    query_lower = query.lower().strip()
    
    # Check for greeting patterns
    greetings = ["hello", "hi", "hai", "helo", "good morning", "good afternoon", "good evening"]
    if any(greeting in query_lower for greeting in greetings):
        logger.info(f"Detected greeting: {query_lower}")
        return True
    
    # Check for simple personal questions
    personal_questions = [
        "who are you", "what are you", "siapa awak", "siapa anda", 
        "apa nama awak", "what is your name"
    ]
    if any(question in query_lower for question in personal_questions):
        logger.info(f"Detected personal question: {query_lower}")
        return True
    
    # Check for very short queries (likely general) - made less restrictive
    if len(query.strip().split()) <= 1:  # Changed from 2 to 1
        logger.info(f"Very short query detected: {query_lower}")
        return True
    
    # Check against keyword list - only exact matches
    for keyword in GENERAL_QUESTION_KEYWORDS:
        if query_lower.strip() == keyword.lower():  # Exact match instead of substring
            logger.info(f"Exact keyword match found: {keyword}")
            return True
    
    return False

def should_use_rag(query: str, query_length: int = None) -> bool:
    """
    Determine if RAG should be used for this query
    """
    if query_length is None:
        query_length = len(query.strip())
    
    logger.info(f"Evaluating RAG usage for query: '{query[:100]}...' (length: {query_length})")
    
    # Skip RAG for very short queries
    if query_length < 5:  # Made less restrictive (was 10)
        logger.info(f"Query too short ({query_length} chars), skipping RAG")
        return False
    
    # Skip RAG for general questions
    if is_general_question(query):
        logger.info("Query identified as general question, skipping RAG")
        return False
    
    # Use RAG for longer, specific queries
    logger.info("Query is suitable for RAG")
    return True

class PerformanceMonitor:
    """Monitor and log performance metrics"""
    
    def __init__(self):
        self.metrics = {
            "rag_calls": 0,
            "rag_skipped": 0,
            "avg_rag_time": 0,
            "avg_model_time": 0,
            "total_requests": 0
        }
    
    def start_timer(self) -> float:
        """Start a performance timer"""
        return time.time()
    
    def end_timer(self, start_time: float, operation: str) -> float:
        """End timer and log the duration"""
        duration = time.time() - start_time
        logger.info(f"{operation} took {duration:.2f} seconds")
        return duration
    
    def log_rag_usage(self, used: bool, duration: Optional[float] = None):
        """Log RAG usage statistics"""
        self.metrics["total_requests"] += 1
        
        if used:
            self.metrics["rag_calls"] += 1
            if duration:
                # Update running average
                old_avg = self.metrics["avg_rag_time"]
                new_count = self.metrics["rag_calls"]
                self.metrics["avg_rag_time"] = (old_avg * (new_count - 1) + duration) / new_count
        else:
            self.metrics["rag_skipped"] += 1
    
    def log_model_time(self, duration: float):
        """Log model response time"""
        old_avg = self.metrics["avg_model_time"]
        new_count = self.metrics["total_requests"]
        self.metrics["avg_model_time"] = (old_avg * (new_count - 1) + duration) / new_count
    
    def get_stats(self) -> dict:
        """Get performance statistics"""
        total = self.metrics["total_requests"]
        if total == 0:
            return self.metrics
        
        return {
            **self.metrics,
            "rag_usage_percentage": (self.metrics["rag_calls"] / total) * 100,
            "performance_improvement": (self.metrics["rag_skipped"] / total) * 100
        }

# Global performance monitor
perf_monitor = PerformanceMonitor()

def get_performance_stats() -> dict:
    """Get current performance statistics"""
    return perf_monitor.get_stats()
