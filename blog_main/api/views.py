from django.shortcuts import render

# Create your views here.
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Q
from django.template.defaultfilters import slugify
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from blogs.models import Blog, Category, Comment
from .permissions import IsAdminOrReadOnly, IsAuthorOrAdminOrReadOnly
from .serializers import (
    AdminUserCreateUpdateSerializer,
    BlogDetailSerializer,
    BlogListSerializer,
    BlogWriteSerializer,
    CategorySerializer,
    CommentCreateSerializer,
    CommentSerializer,
    RegisterSerializer,
    UserSerializer,
)


class DashboardSummaryAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = {
            'category_count': Category.objects.count(),
            'blogs_count': Blog.objects.count(),
            'users_count': User.objects.count(),
            'comments_count': Comment.objects.count(),
        }
        return Response(data)


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                'message': 'User registered successfully.',
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {'detail': 'Invalid username or password.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                'message': 'Login successful.',
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                },
            }
        )


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'message': 'Logout successful.'}, status=status.HTTP_200_OK)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('category_name')
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class BlogViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = Blog.objects.select_related('category', 'author').all().order_by('-created_at')

        user = self.request.user
        if not (user.is_authenticated and user.is_staff):
            queryset = queryset.filter(status='Published')

        category_id = self.request.query_params.get('category')
        keyword = self.request.query_params.get('keyword')
        featured = self.request.query_params.get('featured')
        status_value = self.request.query_params.get('status')

        if category_id:
            queryset = queryset.filter(category_id=category_id)

        if keyword:
            queryset = queryset.filter(
                Q(title__icontains=keyword) |
                Q(short_description__icontains=keyword) |
                Q(blog_body__icontains=keyword)
            )

        if featured is not None:
            featured_value = featured.lower() == 'true'
            queryset = queryset.filter(is_featured=featured_value)

        if user.is_authenticated and user.is_staff and status_value:
            queryset = queryset.filter(status=status_value)

        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return BlogListSerializer
        if self.action == 'retrieve':
            return BlogDetailSerializer
        if self.action == 'comments':
            if self.request.method == 'POST':
                return CommentCreateSerializer
            return CommentSerializer
        return BlogWriteSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        elif self.action == 'create':
            permission_classes = [IsAuthenticated]
        elif self.action == 'comments':
            if self.request.method == 'GET':
                permission_classes = [AllowAny]
            else:
                permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsAuthorOrAdminOrReadOnly]

        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)
        post.slug = f"{slugify(post.title)}-{post.id}"
        post.save()

    def perform_update(self, serializer):
        post = serializer.save()
        post.slug = f"{slugify(post.title)}-{post.id}"
        post.save()

    @action(detail=True, methods=['get', 'post'], url_path='comments')
    def comments(self, request, slug=None):
        blog = self.get_object()

        if request.method == 'GET':
            comments = blog.comment_set.select_related('user').all().order_by('-created_at')
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)

        serializer = CommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(user=request.user, blog=blog)

        return Response(
            CommentSerializer(comment).data,
            status=status.HTTP_201_CREATED,
        )


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AdminUserCreateUpdateSerializer
        return UserSerializer
