from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

from . import views


urlpatterns = [

    # =====================================================
    # AUTHENTICATION
    # =====================================================

    path(
        "register/",
        views.register,
        name="register",
    ),

    # Exchanges a refresh token for a new access token (and a rotated
    # refresh token). The frontend calls this on any 401 response.
    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),

    path(
        "login/",
        views.login,
        name="login",
    ),

    # =====================================================
    # PROFILE
    # =====================================================

    path(
        "profile/",
        views.profile,
        name="profile",
    ),

    path(
        "change-password/",
        views.change_password,
        name="change-password",
    ),

    path(
        "support/",
        views.contact_support,
        name="contact-support",
    ),

    # =====================================================
    # ADMIN USER MANAGEMENT
    # =====================================================

    path(
        "users/",
        views.users,
        name="users",
    ),

    path(
        "users/<int:pk>/",
        views.user_detail,
        name="user-detail",
    ),

]