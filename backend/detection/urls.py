from django.urls import path
from . import views
from .verification_views import verify_news

urlpatterns = [

    path("predict/", views.predict_news_api),

    path("history/", views.prediction_history),

    path("clear-history/", views.clear_history),

    path("history/restore/", views.restore_history),

    path("history/<int:pk>/", views.delete_history),

    path("verify-news/", verify_news, name="verify-news"),
]

