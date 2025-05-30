
from .views import CustomTokenObtainPairView, UserDetailsView
from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', UserDetailsView.as_view(), name='user_details'),
]