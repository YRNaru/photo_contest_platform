from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """ユーザーシリアライザー"""
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar_url', 
                  'is_judge', 'is_moderator', 'created_at')
        read_only_fields = ('id', 'created_at', 'is_judge', 'is_moderator')


class UserDetailSerializer(serializers.ModelSerializer):
    """ユーザー詳細シリアライザー"""
    entry_count = serializers.SerializerMethodField()
    vote_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar_url', 
                  'is_judge', 'is_moderator', 'created_at',
                  'entry_count', 'vote_count')
        read_only_fields = ('id', 'created_at', 'is_judge', 'is_moderator')
    
    def get_entry_count(self, obj):
        return obj.entries.filter(approved=True).count()
    
    def get_vote_count(self, obj):
        return obj.votes.count()

