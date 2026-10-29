from django.urls import path

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