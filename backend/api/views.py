import json

from django.contrib.auth import authenticate
from django.contrib.auth.models import Group, Permission, User
from django.db.models import Q
from django.template.defaultfilters import slugify
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from blogs.models import About, Blog, Category, Comment, SocialLink
from .permissions import IsAdminOrReadOnly, IsAuthorOrAdminOrReadOnly
from .procedures import call_procedure_fetch_all, call_procedure_fetch_one
from .serializers import (
    AdminUserCreateUpdateSerializer,
    AboutSerializer,
    BlogDetailSerializer,
    BlogListSerializer,
    BlogWriteSerializer,
    CategorySerializer,
    CommentCreateSerializer,
    CommentSerializer,
    GroupOptionSerializer,
    PermissionOptionSerializer,
    RegisterSerializer,
    SocialLinkSerializer,
    UserSerializer,
)


class SiteMetaAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        about = About.objects.order_by('-updated_at').first()
        social_links = SocialLink.objects.all().order_by('platform')
        categories = Category.objects.all().order_by('category_name')

        return Response(
            {
                'about': AboutSerializer(about).data if about else None,
                'social_links': SocialLinkSerializer(social_links, many=True).data,
                'categories': CategorySerializer(categories, many=True).data,
            }
        )


class CurrentUserAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {
                    'authenticated': False,
                    'user': None,
                }
            )

        user = request.user
        return Response(
            {
                'authenticated': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                },
            }
        )


class DashboardSummaryAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            data = call_procedure_fetch_one('GetDashboardSummary')
            return Response(data)
        except Exception as e:
            return Response(
                {'detail': f'Failed to load dashboard summary: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CategoryStatsAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            data = call_procedure_fetch_all('GetCategoryStats')
            return Response(data)
        except Exception as e:
            return Response(
                {'detail': f'Failed to load category stats: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UserStatsAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            user_id = request.query_params.get('user_id')
            user_id = int(user_id) if user_id else None
            data = call_procedure_fetch_all('GetUserStats', [user_id])
            return Response(data)
        except ValueError:
            return Response(
                {'detail': 'user_id must be an integer.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {'detail': f'Failed to load user stats: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DashboardOptionsAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        groups = Group.objects.all().order_by('name')
        permissions = Permission.objects.select_related('content_type').all().order_by(
            'content_type__app_label',
            'codename',
        )
        return Response(
            {
                'groups': GroupOptionSerializer(groups, many=True).data,
                'permissions': PermissionOptionSerializer(permissions, many=True).data,
            }
        )


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                'message': 'User registered successfully.',
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
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                'message': 'Login successful.',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
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
        refresh_token = request.data.get('refresh')

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                return Response(
                    {'detail': 'Invalid refresh token.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

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
                Q(title__icontains=keyword)
                | Q(short_description__icontains=keyword)
                | Q(blog_body__icontains=keyword)
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
        if self.action in ['list', 'retrieve', 'search']:
            permission_classes = [AllowAny]
        elif self.action == 'create':
            permission_classes = [IsAuthenticated]
        elif self.action == 'bulk_status':
            permission_classes = [IsAdminUser]
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

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        keyword = (request.query_params.get('keyword') or '').strip()

        if not keyword:
            return Response([])

        try:
            results = call_procedure_fetch_all('SearchBlogs', [keyword])
            return Response(results)
        except Exception as e:
            return Response(
                {'detail': f'Failed to search blogs: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=['post'], url_path='bulk-status')
    def bulk_status(self, request):
        blog_ids = request.data.get('blog_ids', [])
        new_status = request.data.get('status')

        if not isinstance(blog_ids, list) or not blog_ids:
            return Response(
                {'detail': 'blog_ids must be a non-empty list.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_status not in ['Draft', 'Published']:
            return Response(
                {'detail': "status must be 'Draft' or 'Published'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = call_procedure_fetch_one(
                'UpdateBlogStatusBulk',
                [json.dumps(blog_ids), new_status],
            )
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'detail': f'Failed to update blog status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

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
