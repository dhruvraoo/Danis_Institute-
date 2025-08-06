"""
URL configuration for institute_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("""
    <h1>Institute Backend API</h1>
    <p>Available endpoints:</p>
    <ul>
        <li><a href="/admin/">Admin Panel</a></li>
        <li><a href="/accounts/student/signup/">Student Signup</a></li>
        <li><a href="/accounts/student/login/">Student Login</a></li>
        <li><a href="/accounts/faculty/login/">Faculty Login</a></li>
        <li><a href="/accounts/principal/login/">Principal Login</a></li>
    </ul>
    """)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('news/', include('news.urls')),
    path('students/', include('students.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('', include('marks.urls')),
    path('', include('chat.urls')),
    path('', home, name='home'),
]
