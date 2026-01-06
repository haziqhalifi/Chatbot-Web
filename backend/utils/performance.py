import time
import logging

logger = logging.getLogger(__name__)


class PerformanceMonitor:
    """Monitor and log basic model performance metrics (RAG removed)."""

    def __init__(self):
        self.metrics = {
            "avg_model_time": 0.0,
            "total_requests": 0,
        }

    def start_timer(self) -> float:
        return time.time()

    def end_timer(self, start_time: float, operation: str) -> float:
        duration = time.time() - start_time
        logger.info(f"{operation} took {duration:.2f} seconds")
        return duration

    def log_model_time(self, duration: float):
        self.metrics["total_requests"] += 1
        old_avg = self.metrics["avg_model_time"]
        count = self.metrics["total_requests"]
        self.metrics["avg_model_time"] = (old_avg * (count - 1) + duration) / count

    def get_stats(self) -> dict:
        return dict(self.metrics)


perf_monitor = PerformanceMonitor()


def get_performance_stats() -> dict:
    return perf_monitor.get_stats()
