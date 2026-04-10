from django.contrib.auth.models import Group, Permission, User
from rest_framework import serializers

from blogs.models import About, Blog, Category, Comment, SocialLink


class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'category_name', 'created_at', 'updated_at', 'post_count']

    def get_post_count(self, obj):
        return Blog.objects.filter(category=obj, status='Published').count()


class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'user_name', 'blog', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'user_name', 'blog', 'created_at', 'updated_at']


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['comment']


class BlogListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.category_name', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Blog
        fields = [
            'id',
            'title',
            'slug',
            'category',
            'category_name',
            'author',
            'author_name',
            'featured_image',
            'short_description',
            'status',
            'is_featured',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'author', 'slug', 'created_at', 'updated_at']


class BlogDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.category_name', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    comments = CommentSerializer(source='comment_set', many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Blog
        fields = [
            'id',
            'title',
            'slug',
            'category',
            'category_name',
            'author',
            'author_name',
            'featured_image',
            'short_description',
            'blog_body',
            'status',
            'is_featured',
            'created_at',
            'updated_at',
            'comment_count',
            'comments',
        ]
        read_only_fields = ['id', 'author', 'slug', 'created_at', 'updated_at']

    def get_comment_count(self, obj):
        return obj.comment_set.count()


class BlogWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = [
            'id',
            'title',
            'category',
            'featured_image',
            'short_description',
            'blog_body',
            'status',
            'is_featured',
        ]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'is_superuser',
            'groups',
            'user_permissions',
        ]


class AdminUserCreateUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'password',
            'is_active',
            'is_staff',
            'is_superuser',
            'groups',
            'user_permissions',
        ]

   
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', [])
        user_permissions = validated_data.pop('user_permissions', [])
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        user.groups.set(groups)
        user.user_permissions.set(user_permissions)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', None)
        user_permissions = validated_data.pop('user_permissions', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        if groups is not None:
            instance.groups.set(groups)

        if user_permissions is not None:
            instance.user_permissions.set(user_permissions)

        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)


class AboutSerializer(serializers.ModelSerializer):
    class Meta:
        model = About
        fields = ['id', 'about_heading', 'about_description']


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ['id', 'platform', 'link']


class GroupOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']


class PermissionOptionSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()

    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'label']

    def get_label(self, obj):
        return f'{obj.content_type.app_label}.{obj.codename}'
