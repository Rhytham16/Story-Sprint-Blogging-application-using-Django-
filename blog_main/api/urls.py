from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BlogViewSet,
    CategoryViewSet,
    DashboardSummaryAPIView,
    LoginAPIView,
    LogoutAPIView,
    RegisterAPIView,
    UserViewSet,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'posts', BlogViewSet, basename='post')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('auth/register/', RegisterAPIView.as_view(), name='api-register'),
    path('auth/login/', LoginAPIView.as_view(), name='api-login'),
    path('auth/logout/', LogoutAPIView.as_view(), name='api-logout'),
    path('dashboard/summary/', DashboardSummaryAPIView.as_view(), name='api-dashboard-summary'),
    path('auth/session/', include('rest_framework.urls')),
    path('', include(router.urls)),
]
