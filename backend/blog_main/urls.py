"""blog_main URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', views.react_app, name='home'),
    path('category/<int:category_id>/', views.react_app, name='posts_by_category'),
    path('blogs/<slug:slug>/', views.react_app, name='blogs'),
    path('search/', views.react_app, name='search'),
    path('register/', views.react_app, name='register'),
    path('login/', views.react_app, name='login'),
    path('logout/', views.logout, name='logout'),
    path('dashboard/', views.react_app, name='dashboard'),
    path('dashboard/<path:path>/', views.react_app, name='dashboard-spa'),
    path('<path:path>/', views.react_app, name='spa-catchall'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
