from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.dateparse import parse_datetime

from .ml_model import predict_news
from .models import PredictionHistory
from .serializers import PredictionHistorySerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def predict_news_api(request):
    """
    Predict Fake or Real News
    """

    news = request.data.get("news")
    source_url = request.data.get("source_url", "")
    if not isinstance(source_url, str):
        source_url = ""

    if not news:
        return Response(
            {
                "status": "error",
                "message": "News text is required."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    result = predict_news(news)

    history = PredictionHistory.objects.create(
        user=request.user,
        news=news,
        source_url=source_url,
        prediction=result["prediction"],
        score=result["score"],
    )

    result["id"] = history.id

    return Response(result)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def prediction_history(request):
    print("=" * 60)
    print("USER:", request.user)
    print("AUTH:", request.auth)
    print("=" * 60)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def restore_history(request):
    record_id = request.data.get("id")
    news = request.data.get("news")

    if not record_id or not news:
        return Response(
            {"message": "Valid prediction data is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if PredictionHistory.objects.filter(id=record_id, user=request.user).exists():
        return Response(
            {"message": "Prediction is already restored.", "id": record_id},
            status=status.HTTP_200_OK,
        )

    try:
        score = float(request.data.get("score", 0))
    except (TypeError, ValueError):
        return Response(
            {"message": "Invalid prediction score."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    restored = PredictionHistory.objects.create(
        id=record_id,
        user=request.user,
        news=news,
        source_url=request.data.get("source_url", "") or "",
        prediction=request.data.get("prediction", ""),
        score=score,
    )

    created_at = parse_datetime(request.data.get("created_at", ""))
    if created_at:
        PredictionHistory.objects.filter(id=restored.id).update(created_at=created_at)

    return Response(
        PredictionHistorySerializer(restored).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_history(request, pk):
    """
    Delete one history record belonging to logged-in user
    """

    try:
        history = PredictionHistory.objects.get(
            id=pk,
            user=request.user
        )
    except PredictionHistory.DoesNotExist:
        return Response(
            {"message": "History not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    history.delete()

    return Response(
        {"message": "History deleted successfully."},
        status=status.HTTP_200_OK
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def clear_history(request):
    """
    Delete all history belonging to logged-in user
    """

    PredictionHistory.objects.filter(
        user=request.user
    ).delete()

    return Response(
        {"message": "History cleared successfully."},
        status=status.HTTP_200_OK
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def prediction_history(request):

    print("=" * 50)
    print("USER:", request.user)
    print("AUTH:", request.auth)
    print("IS AUTHENTICATED:", request.user.is_authenticated)
    print("=" * 50)

    history = PredictionHistory.objects.filter(
        user=request.user
    ).order_by("-created_at")

    serializer = PredictionHistorySerializer(history, many=True)

    return Response(serializer.data)