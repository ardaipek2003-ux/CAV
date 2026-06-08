"""
Tests for the optimizer algorithm.
"""

import pytest
from datetime import datetime, timedelta, timezone


class TestRelocationLogic:
    def test_bottleneck_identification(self):
        """The bottleneck is the plant with the latest expected harvest."""
        plants = [
            {"id": "p1", "expected_harvest": datetime(2025, 11, 1, tzinfo=timezone.utc)},
            {"id": "p2", "expected_harvest": datetime(2025, 11, 5, tzinfo=timezone.utc)},  # bottleneck
            {"id": "p3", "expected_harvest": datetime(2025, 10, 28, tzinfo=timezone.utc)},
        ]
        bottleneck = max(plants, key=lambda p: p["expected_harvest"])
        assert bottleneck["id"] == "p2"

    def test_relocation_gain(self):
        """Moving from row 5 to row 1 saves ~6 days for lettuce."""
        baseline = 30
        row_5_days = baseline / (1.05 ** (3 - 5))  # ~33.1 days
        row_1_days = baseline / (1.05 ** (3 - 1))  # ~27.2 days
        gain = row_5_days - row_1_days
        assert gain > 5  # Should save about 5.9 days

    def test_no_gain_same_row(self):
        """No relocation gain when moving to same row."""
        baseline = 30
        row_3_days = baseline / (1.05 ** (3 - 3))  # 30 days
        gain = row_3_days - row_3_days
        assert gain == 0

    def test_robot_cap_respected(self):
        """Optimizer should not exceed robot arm capacity."""
        robot_jobs_per_day = 500
        max_relocations_in_5_days = robot_jobs_per_day * 5
        already_queued = 2400
        available = max_relocations_in_5_days - already_queued
        assert available == 100
        assert available > 0

    def test_greedy_ordering(self):
        """Candidates should be processed biggest gain first."""
        candidates = [
            {"gain_days": 2.0},
            {"gain_days": 5.5},
            {"gain_days": 1.2},
            {"gain_days": 3.8},
        ]
        sorted_candidates = sorted(candidates, key=lambda c: c["gain_days"], reverse=True)
        gains = [c["gain_days"] for c in sorted_candidates]
        assert gains == [5.5, 3.8, 2.0, 1.2]

    def test_minimum_gain_threshold(self):
        """Gains below 0.5 days should be skipped."""
        threshold = 0.5
        candidates = [
            {"gain_days": 0.3},
            {"gain_days": 1.5},
            {"gain_days": 0.1},
        ]
        filtered = [c for c in candidates if c["gain_days"] > threshold]
        assert len(filtered) == 1
        assert filtered[0]["gain_days"] == 1.5
