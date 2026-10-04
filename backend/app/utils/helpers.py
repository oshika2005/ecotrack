"""Helper utilities – badge calculation, point rewards, etc."""


# Badge tiers based on total points
BADGE_TIERS = [
    (0, "Eco Beginner"),
    (500, "Eco Learner"),
    (1500, "Eco Enthusiast"),
    (3000, "Eco Warrior"),
    (5000, "Eco Champion"),
    (10000, "Eco Legend"),
]

# Points awarded for each eco-friendly activity type
ACTIVITY_POINTS = {
    "walking": 10,
    "cycling": 15,
    "recycling": 20,
    "reduced_electricity": 25,
    "public_transport": 15,
    "composting": 20,
    "tree_planting": 50,
    "vegan_meal": 10,
    "carpooling": 15,
    "water_saving": 10,
}

# Estimated CO₂ saved (kg) per activity instance
ACTIVITY_CO2_SAVED = {
    "walking": 2.0,       # vs driving avg trip
    "cycling": 2.5,
    "recycling": 0.5,
    "reduced_electricity": 1.0,
    "public_transport": 1.5,
    "composting": 0.3,
    "tree_planting": 5.0,
    "vegan_meal": 2.3,    # vs non-veg meal
    "carpooling": 1.8,
    "water_saving": 0.2,
}


def calculate_badge(total_points: int) -> str:
    """Determine badge level based on accumulated points."""
    badge = "Eco Beginner"
    for threshold, level in BADGE_TIERS:
        if total_points >= threshold:
            badge = level
    return badge


def get_activity_reward(activity_type: str) -> tuple[int, float]:
    """Return (points, co2_saved_kg) for a given activity type."""
    points = ACTIVITY_POINTS.get(activity_type, 5)
    co2_saved = ACTIVITY_CO2_SAVED.get(activity_type, 0.1)
    return points, co2_saved
