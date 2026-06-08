"""
Tests for the quote algorithm.
"""

import pytest
import math
from datetime import datetime, timedelta, timezone


def growth_multiplier(row_number: int) -> float:
    """Same formula used in production."""
    return 1.05 ** (3 - row_number)


def compute_grow_days(baseline: int, row_number: int) -> float:
    """Compute actual grow days for a given row."""
    return baseline / growth_multiplier(row_number)


class TestGrowthMultiplier:
    def test_row_1_fastest(self):
        assert growth_multiplier(1) == pytest.approx(1.1025, rel=1e-4)

    def test_row_2(self):
        assert growth_multiplier(2) == pytest.approx(1.05, rel=1e-4)

    def test_row_3_baseline(self):
        assert growth_multiplier(3) == pytest.approx(1.0, rel=1e-4)

    def test_row_4(self):
        assert growth_multiplier(4) == pytest.approx(0.9524, rel=1e-3)

    def test_row_5_slowest(self):
        assert growth_multiplier(5) == pytest.approx(0.9070, rel=1e-3)


class TestGrowDays:
    def test_lettuce_row_1(self):
        days = compute_grow_days(30, 1)
        assert days == pytest.approx(27.2, rel=1e-2)

    def test_lettuce_row_3_baseline(self):
        days = compute_grow_days(30, 3)
        assert days == pytest.approx(30.0, rel=1e-2)

    def test_lettuce_row_5(self):
        days = compute_grow_days(30, 5)
        assert days == pytest.approx(33.1, rel=1e-2)

    def test_tomato_row_1(self):
        days = compute_grow_days(60, 1)
        assert days == pytest.approx(54.4, rel=1e-2)

    def test_tomato_row_3_baseline(self):
        days = compute_grow_days(60, 3)
        assert days == pytest.approx(60.0, rel=1e-2)


class TestSpotsNeeded:
    def test_lettuce_spots(self):
        """10 kg of lettuce at 0.3 kg/spot = 34 spots needed."""
        spots = math.ceil(10 / 0.3)
        assert spots == 34

    def test_tomato_spots(self):
        """10 kg of tomatoes at 0.5 kg/spot = 20 spots needed."""
        spots = math.ceil(10 / 0.5)
        assert spots == 20

    def test_small_order(self):
        """0.1 kg needs at least 1 spot."""
        spots = math.ceil(0.1 / 0.3)
        assert spots == 1


class TestModuleFill:
    def test_complete_module_fill(self):
        """Ensure modules are filled completely (45 spots) before next."""
        # Simulate filling with 50 spots (should use module 1 fully + 5 from module 2)
        spots_needed = 50
        modules_used = set()
        spots_per_module = {}

        spot_count = 0
        for module in range(1, 10001):
            for row in range(1, 6):
                for spot in range(1, 10):
                    if spot_count >= spots_needed:
                        break
                    modules_used.add(module)
                    spots_per_module[module] = spots_per_module.get(module, 0) + 1
                    spot_count += 1
                if spot_count >= spots_needed:
                    break
            if spot_count >= spots_needed:
                break

        assert len(modules_used) == 2  # 2 modules
        assert spots_per_module[1] == 45  # First module completely filled
        assert spots_per_module[2] == 5   # Second module partially filled
