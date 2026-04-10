from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    BlogViewSet,
    CategoryViewSet,
    CategoryStatsAPIView,
    CurrentUserAPIView,
    DashboardOptionsAPIView,
    DashboardSummaryAPIView,
    LoginAPIView,
    LogoutAPIView,
    RegisterAPIView,
    SiteMetaAPIView,
    UserStatsAPIView,
    UserViewSet,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'posts', BlogViewSet, basename='post')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('site/', SiteMetaAPIView.as_view(), name='api-site'),
    path('analytics/categories/', CategoryStatsAPIView.as_view(), name='api-category-stats'),
    path('analytics/users/', UserStatsAPIView.as_view(), name='api-user-stats'),
    path('auth/register/', RegisterAPIView.as_view(), name='api-register'),
    path('auth/login/', LoginAPIView.as_view(), name='api-login'),
    path('auth/logout/', LogoutAPIView.as_view(), name='api-logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='api-token-refresh'),
    path('auth/me/', CurrentUserAPIView.as_view(), name='api-current-user'),
    path('dashboard/summary/', DashboardSummaryAPIView.as_view(), name='api-dashboard-summary'),
    path('dashboard/options/', DashboardOptionsAPIView.as_view(), name='api-dashboard-options'),
    path('auth/session/', include('rest_framework.urls')),
    path('', include(router.urls)),
]
