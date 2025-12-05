from rest_framework import permissions


class IsJudge(permissions.BasePermission):
    """審査員権限"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_judge or request.user.is_staff
        )


class IsModerator(permissions.BasePermission):
    """モデレーター権限"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_moderator or request.user.is_staff
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """オーナーまたは読み取り専用"""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.author == request.user

