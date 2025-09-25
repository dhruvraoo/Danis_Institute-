from django.http import JsonResponse
from django.urls import resolve

class AdminAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get the current URL path
        path = request.path_info.lstrip('/')
        
        # Check if this is an admin API endpoint
        if path.startswith('api/admin/') and not path == 'api/admin/login':
            # Check if the user is authenticated as admin
            if not request.session.get('admin_authenticated'):
                return JsonResponse({
                    'success': False,
                    'message': 'Admin authentication required',
                    'redirect_to': '/admin/login'
                }, status=401)
        
        response = self.get_response(request)
        return response
