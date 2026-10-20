from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer
from .permissions import IsStudent
from .permissions import IsStudent, IsTeacher
from .permissions import IsStudent, IsTeacher, IsAdmin
from rest_framework.views import APIView
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
class StudentDashboardView(generics.GenericAPIView):
    permission_classes = [IsStudent]

class TeacherDashboardView(generics.GenericAPIView):
    permission_classes = [IsTeacher]

class VerifyTeacherView(generics.GenericAPIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            teacher = User.objects.get(
                id=pk,
                role="teacher"
            )
        except User.DoesNotExist:
            return Response(
                {"error": "Teacher not found."},
                status=404
            )

        teacher.is_verified = True
        teacher.save()

        return Response({
            "message": "Teacher verified successfully.",
            "teacher": teacher.username,
            "is_verified": teacher.is_verified
        })

class TeacherListView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request):
        teachers = User.objects.filter(role="teacher")

        data = []

        for teacher in teachers:
            data.append({
                "id": teacher.id,
                "username": teacher.username,
                "email": teacher.email,
                "role": teacher.role,
                "is_verified": teacher.is_verified,
            })

        return Response(data)
class StudentListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        students = User.objects.filter(role="student")

        data = []

        for student in students:
            data.append({
                "id": student.id,
                "username": student.username,
                "email": student.email,
                "role": student.role,
            })

        return Response(data)