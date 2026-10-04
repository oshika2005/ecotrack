"""
AI Carbon Footprint Calculator

Rule-based engine with a pluggable interface for future ML models.
Calculates CO₂ emissions from electricity, food, and travel, then
generates personalized reduction suggestions.
"""


# ── Emission factors (kg CO₂) ────────────────────────────────────

ELECTRICITY_FACTOR = 0.42  # kg CO₂ per kWh (US grid average)

FOOD_FACTORS = {
    "veg": 1.0,       # kg CO₂ per meal
    "non-veg": 3.3,
    "vegan": 0.7,
}

TRAVEL_FACTORS = {
    "car": 0.21,       # kg CO₂ per km
    "bike": 0.0,
    "bus": 0.089,
    "train": 0.041,
    "flight": 0.255,
    "walk": 0.0,
}

# Daily averages for comparison (global middle-class estimate)
DAILY_AVG_CO2 = {
    "electricity": 4.2,   # ~10 kWh * 0.42
    "food": 3.3,           # one non-veg meal equivalent
    "travel": 4.2,         # ~20 km by car
    "total": 11.7,
}


def calculate_emissions(
    electricity_kwh: float,
    food_type: str,
    travel_mode: str,
    travel_distance_km: float,
) -> dict:
    """
    Calculate CO₂ emissions broken down by category.

    Returns dict with electricity_co2_kg, food_co2_kg, travel_co2_kg, total_co2_kg.
    """
    electricity_co2 = round(electricity_kwh * ELECTRICITY_FACTOR, 3)
    food_co2 = round(FOOD_FACTORS.get(food_type.lower(), 1.0), 3)
    travel_co2 = round(
        travel_distance_km * TRAVEL_FACTORS.get(travel_mode.lower(), 0.0), 3
    )
    total_co2 = round(electricity_co2 + food_co2 + travel_co2, 3)

    return {
        "electricity_co2_kg": electricity_co2,
        "food_co2_kg": food_co2,
        "travel_co2_kg": travel_co2,
        "total_co2_kg": total_co2,
    }


def generate_suggestions(
    electricity_kwh: float,
    food_type: str,
    travel_mode: str,
    travel_distance_km: float,
    emissions: dict,
) -> list[dict]:
    """
    Generate personalized AI suggestions based on the user's inputs.
    Returns a list of suggestion dicts with category, current_impact,
    suggestion text, and potential CO₂ saving.
    """
    suggestions = []

    # ── Electricity suggestions ──────────────────────────────────
    if electricity_kwh > 10:
        suggestions.append({
            "category": "electricity",
            "current_impact": f"{emissions['electricity_co2_kg']} kg CO₂ from {electricity_kwh} kWh",
            "suggestion": "Switch to LED bulbs and unplug devices when not in use. "
                          "Consider a smart power strip to eliminate phantom loads.",
            "potential_saving_kg": round(electricity_kwh * 0.15 * ELECTRICITY_FACTOR, 2),
        })
    if electricity_kwh > 20:
        suggestions.append({
            "category": "electricity",
            "current_impact": f"High usage: {electricity_kwh} kWh/day",
            "suggestion": "Your electricity usage is significantly above average. "
                          "Consider a home energy audit and explore solar panel options.",
            "potential_saving_kg": round(electricity_kwh * 0.30 * ELECTRICITY_FACTOR, 2),
        })

    # ── Food suggestions ─────────────────────────────────────────
    if food_type.lower() == "non-veg":
        suggestions.append({
            "category": "food",
            "current_impact": f"{emissions['food_co2_kg']} kg CO₂ from non-veg diet",
            "suggestion": "Try 'Meatless Mondays' – replacing one non-veg meal per week "
                          "with a plant-based option saves ~120 kg CO₂/year.",
            "potential_saving_kg": round(FOOD_FACTORS["non-veg"] - FOOD_FACTORS["veg"], 2),
        })
    elif food_type.lower() == "veg":
        suggestions.append({
            "category": "food",
            "current_impact": f"{emissions['food_co2_kg']} kg CO₂ from vegetarian diet",
            "suggestion": "Great choice! Consider trying vegan meals occasionally – "
                          "dairy production still has a notable carbon footprint.",
            "potential_saving_kg": round(FOOD_FACTORS["veg"] - FOOD_FACTORS["vegan"], 2),
        })

    # ── Travel suggestions ───────────────────────────────────────
    if travel_mode.lower() == "car" and travel_distance_km > 0:
        saving_bus = round(
            travel_distance_km * (TRAVEL_FACTORS["car"] - TRAVEL_FACTORS["bus"]), 2
        )
        suggestions.append({
            "category": "travel",
            "current_impact": f"{emissions['travel_co2_kg']} kg CO₂ from {travel_distance_km} km by car",
            "suggestion": "Switch to public transport for this trip to save "
                          f"{saving_bus} kg CO₂. Carpooling is another great option.",
            "potential_saving_kg": saving_bus,
        })
    if travel_mode.lower() == "flight" and travel_distance_km > 0:
        saving_train = round(
            travel_distance_km * (TRAVEL_FACTORS["flight"] - TRAVEL_FACTORS["train"]), 2
        )
        suggestions.append({
            "category": "travel",
            "current_impact": f"{emissions['travel_co2_kg']} kg CO₂ from {travel_distance_km} km flight",
            "suggestion": "For distances under 500 km, trains produce ~84% less CO₂ "
                          f"than flights. Potential saving: {saving_train} kg CO₂.",
            "potential_saving_kg": saving_train,
        })
    if travel_mode.lower() in ("walk", "bike"):
        suggestions.append({
            "category": "travel",
            "current_impact": "Zero emissions – excellent!",
            "suggestion": "You're already making the greenest choice. "
                          "Keep it up and inspire others to walk or cycle!",
            "potential_saving_kg": 0.0,
        })

    # Always include a general tip
    total = emissions["total_co2_kg"]
    if total > DAILY_AVG_CO2["total"]:
        suggestions.append({
            "category": "overall",
            "current_impact": f"Your daily footprint ({total} kg) is above the average ({DAILY_AVG_CO2['total']} kg)",
            "suggestion": "Focus on the category with highest impact first. "
                          "Small consistent changes add up – even a 10% reduction "
                          f"saves {round(total * 0.1 * 365, 1)} kg CO₂ per year.",
            "potential_saving_kg": round(total * 0.1, 2),
        })
    else:
        suggestions.append({
            "category": "overall",
            "current_impact": f"Your daily footprint ({total} kg) is below average – great job!",
            "suggestion": "You're doing better than average! Share your habits "
                          "in the EcoTrack community to inspire others.",
            "potential_saving_kg": 0.0,
        })

    return suggestions


def compare_with_average(emissions: dict) -> dict:
    """Compare the user's emissions against daily averages."""
    return {
        "user_total_kg": emissions["total_co2_kg"],
        "average_total_kg": DAILY_AVG_CO2["total"],
        "difference_kg": round(emissions["total_co2_kg"] - DAILY_AVG_CO2["total"], 2),
        "percentage_of_average": round(
            (emissions["total_co2_kg"] / DAILY_AVG_CO2["total"]) * 100, 1
        ),
        "rating": (
            "excellent" if emissions["total_co2_kg"] < DAILY_AVG_CO2["total"] * 0.5
            else "good" if emissions["total_co2_kg"] < DAILY_AVG_CO2["total"]
            else "average" if emissions["total_co2_kg"] < DAILY_AVG_CO2["total"] * 1.5
            else "high"
        ),
    }
