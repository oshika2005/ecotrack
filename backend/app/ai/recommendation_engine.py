"""
Recommendation Engine (ML-ready stub)

Currently wraps the rule-based carbon_calculator suggestions.
Designed to be swapped with a trained scikit-learn model in the future.
"""

from app.ai.carbon_calculator import generate_suggestions, compare_with_average


class RecommendationEngine:
    """
    Pluggable recommendation engine.

    Current implementation: deterministic rule-based.
    Future: load a trained sklearn model and predict personalized suggestions.
    """

    def __init__(self, model_path: str | None = None):
        self.model = None
        if model_path:
            self._load_model(model_path)

    def _load_model(self, path: str):
        """Load a trained ML model from disk. Placeholder for future use."""
        try:
            import joblib
            self.model = joblib.load(path)
        except Exception:
            self.model = None

    def get_recommendations(
        self,
        electricity_kwh: float,
        food_type: str,
        travel_mode: str,
        travel_distance_km: float,
        emissions: dict,
        user_history: list | None = None,
    ) -> list[dict]:
        """
        Generate personalized recommendations.

        If an ML model is loaded, uses it for predictions.
        Otherwise falls back to rule-based suggestions.
        """
        if self.model is not None:
            # Future: use model.predict() with feature vector
            pass

        # Fall back to rule-based
        return generate_suggestions(
            electricity_kwh, food_type, travel_mode, travel_distance_km, emissions
        )

    def get_comparison(self, emissions: dict) -> dict:
        """Compare emissions against averages."""
        return compare_with_average(emissions)


# Singleton instance
recommendation_engine = RecommendationEngine()
