from unittest.mock import patch

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase

from detection.models import PredictionHistory


class AssistantChatTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="current-user",
            password="test-password",
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse("assistant-chat")

    @patch("assistant.views.requests.post")
    def test_chat_uses_only_authenticated_users_prediction_counts(
        self,
        post,
    ):
        PredictionHistory.objects.bulk_create([
            PredictionHistory(
                user=self.user,
                news=f"Current user's article {index}",
                prediction="Fake",
                score=0.9,
            )
            for index in range(2)
        ] + [
            PredictionHistory(
                user=self.user,
                news="Current user's real article",
                prediction="Real",
                score=0.8,
            ),
            PredictionHistory(
                user=User.objects.create_user(username="other-user"),
                news="Another user's fake article",
                prediction="Fake",
                score=0.9,
            ),
        ])
        post.return_value.json.return_value = {
            "message": {"content": "You have 2 Fake and 1 Real predictions."}
        }

        response = self.client.post(
            self.url,
            {"message": "How many of my predictions are fake and real?"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["reply"],
            "You have 2 Fake and 1 Real predictions.",
        )
        messages = post.call_args.kwargs["json"]["messages"]
        stats_context = messages[1]["content"]
        self.assertIn("Total prediction records: 3", stats_context)
        self.assertIn("Classified Fake: 2", stats_context)
        self.assertIn("Classified Real: 1", stats_context)
        self.assertIn("not independently verified truth", stats_context)

    @patch("assistant.views.requests.post")
    def test_chat_reports_zero_counts_for_user_without_predictions(self, post):
        post.return_value.json.return_value = {
            "message": {"content": "You have no predictions yet."}
        }

        response = self.client.post(
            self.url,
            {"message": "How many predictions do I have?"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        stats_context = post.call_args.kwargs["json"]["messages"][1]["content"]
        self.assertIn("Total prediction records: 0", stats_context)
        self.assertIn("Classified Fake: 0", stats_context)
        self.assertIn("Classified Real: 0", stats_context)

    @patch("assistant.views.requests.post")
    def test_chat_requires_authentication(self, post):
        self.client.force_authenticate(user=None)

        response = self.client.post(
            self.url,
            {"message": "How many predictions do I have?"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)
        post.assert_not_called()
