import utils.language as lang
import utils.performance as perf


def test_detect_language_basic():
    assert lang.detect_language("Apa khabar?") == "malay"
    assert lang.detect_language("What is this?") == "english"
    assert lang.detect_language("???") == "unknown"


def test_get_language_instruction():
    assert "Bahasa" in lang.get_language_instruction("malay")
    assert "English" in lang.get_language_instruction("english")
    assert "respond" in lang.get_language_instruction("unknown")


def test_performance_monitor_tracks():
    perf.perf_monitor.log_model_time(0.5)
    stats = perf.get_performance_stats()
    assert stats["total_requests"] >= 1
    assert "avg_model_time" in stats
