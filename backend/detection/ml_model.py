
import os
import joblib
import numpy as np

from utils.preprocess import clean_text


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "model")

MODEL_PATH = os.path.join(MODEL_DIR, "fake_news_model.pkl")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")


# --------------------------------------------------
# Load saved artifacts
# --------------------------------------------------

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)


def _get_prediction_label(raw_label):
    """
    The training pipeline must use:
        0 = Fake
        1 = Real

    If your training script uses different labels, update this
    mapping to match the actual training labels.
    """
    if isinstance(raw_label, (int, np.integer)):
        if int(raw_label) == 0:
            return "Fake"
        if int(raw_label) == 1:
            return "Real"

    if isinstance(raw_label, str):
        normalized = raw_label.strip().lower()

        if normalized in {"fake", "false", "0"}:
            return "Fake"
        if normalized in {"real", "true", "1"}:
            return "Real"

    raise ValueError(
        f"Unknown model label {raw_label!r}. "
        "Check the label mapping used during training."
    )


def predict_news(news_text):
    """
    Classify supplied news text using the saved ML model.

    Note:
    The classifier prediction is a learned text-pattern estimate,
    not independent proof that a news claim is true or false.
    """
    if not isinstance(news_text, str) or not news_text.strip():
        raise ValueError("News text must not be empty.")

    cleaned = clean_text(news_text)

    if not cleaned.strip():
        raise ValueError(
            "No usable text remains after preprocessing."
        )

    vector = vectorizer.transform([cleaned])

    raw_prediction = model.predict(vector)[0]
    prediction = _get_prediction_label(raw_prediction)

    # Preserve the decision score for debugging and analysis.
    score = None
    if hasattr(model, "decision_function"):
        raw_score = np.asarray(model.decision_function(vector)).reshape(-1)
        if raw_score.size:
            score = float(raw_score[0])

    # Extract the most important words present in this input.
    feature_names = vectorizer.get_feature_names_out()
    vector_array = vector.toarray()[0]
    top_indices = vector_array.argsort()[-5:][::-1]

    keywords = [
        str(feature_names[index])
        for index in top_indices
        if vector_array[index] > 0
    ]

    # Do not invent a confidence percentage from the decision score.
    # A raw decision score is not a calibrated probability.
    return {
        "prediction": prediction,
        "score": round(score, 4) if score is not None else None,
        "confidence": None,
        "confidence_note": (
            "A calibrated probability is not available for this model. "
            "The score is a classifier decision value, not a probability."
        ),
        "keywords": keywords,
        "explanation": [
            "This result comes from patterns learned from the training dataset.",
            "It does not independently establish whether the claim is true.",
            "Check the source, publication date, and corroborating evidence."
        ]
    }
