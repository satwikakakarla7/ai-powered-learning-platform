from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser
from users.permissions import IsVerifiedTeacher, IsStudent

from .models import (
    Course,
    Enrollment,
    Lesson,
    Progress,
    Quiz,
    Question,
    QuizAttempt,
    CourseMaterial
)

from .serializers import (
    CourseSerializer,
    EnrollmentSerializer,
    LessonSerializer,
    ProgressSerializer,
    QuizSerializer,
    QuestionSerializer,
    QuizAttemptSerializer,
    CourseMaterialSerializer
)

from .rag_ai import ask_pdf_ai


class CourseCreateView(generics.CreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsVerifiedTeacher]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class CourseListView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]


class EnrollmentCreateView(generics.CreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsStudent]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class MyEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Enrollment.objects.filter(
            student=self.request.user
        )



class LessonCreateView(generics.CreateAPIView):
    serializer_class = LessonSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsVerifiedTeacher]

    def get_queryset(self):
        return Lesson.objects.filter(
            course__teacher=self.request.user
        )

    def perform_create(self, serializer):
        course = serializer.validated_data['course']

        if course.teacher != self.request.user:
            raise PermissionDenied(
                "You can only add lessons to your own courses."
            )

        serializer.save()

    def post(self, request, *args, **kwargs):
        request_data = request.data.copy()

        if not request_data.get('content'):
            request_data['content'] = request_data.get(
                'title', 'Recorded video class'
            )

        serializer = self.get_serializer(data=request_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(
            serializer.data,
            status=201
        )



class LessonListView(generics.ListAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs['course_id']

        return Lesson.objects.filter(
            course_id=course_id
        )


class ProgressCreateView(generics.CreateAPIView):
    serializer_class = ProgressSerializer
    permission_classes = [IsStudent]

    def create(self, request, *args, **kwargs):
        lesson_id = request.data.get("lesson")

        if not lesson_id:
            return Response(
                {"error": "Lesson is required."},
                status=400
            )

        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response(
                {"error": "Lesson not found."},
                status=404
            )

        progress = Progress.objects.filter(
            student=request.user,
            lesson=lesson
        ).first()

        if progress:
            progress.completed = True
            progress.save()
        else:
            progress = Progress.objects.create(
                student=request.user,
                lesson=lesson,
                completed=True
            )

        return Response({
            "message": "Lesson completed successfully!",
            "lesson": lesson.id,
            "completed": progress.completed
        })


class MyProgressView(generics.ListAPIView):
    serializer_class = ProgressSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Progress.objects.filter(
            student=self.request.user
        )


class QuizCreateView(generics.CreateAPIView):
    serializer_class = QuizSerializer
    permission_classes = [IsVerifiedTeacher]

    def perform_create(self, serializer):
        course = serializer.validated_data['course']

        if course.teacher != self.request.user:
            raise PermissionDenied(
                "You can only create quizzes for your own courses."
            )

        serializer.save()


class QuizListView(generics.ListAPIView):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs['course_id']

        return Quiz.objects.filter(
            course_id=course_id
        )


class QuestionCreateView(generics.CreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsVerifiedTeacher]

    def perform_create(self, serializer):
        quiz = serializer.validated_data['quiz']

        if quiz.course.teacher != self.request.user:
            raise PermissionDenied(
                "You can only add questions to your own quizzes."
            )

        serializer.save()


class QuestionListView(generics.ListAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        quiz_id = self.kwargs['quiz_id']

        return Question.objects.filter(
            quiz_id=quiz_id
        )


class QuizAttemptCreateView(generics.CreateAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsStudent]

    def create(self, request, *args, **kwargs):
        quiz_id = request.data.get('quiz')
        answers = request.data.get('answers', {})

        if not quiz_id:
            return Response(
                {"error": "Quiz is required."},
                status=400
            )

        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response(
                {"error": "Quiz not found."},
                status=404
            )

        questions = quiz.questions.all()

        score = 0
        total = questions.count()

        for question in questions:
            answer = answers.get(str(question.id))

            if answer and answer.upper() == question.correct_answer.upper():
                score += 1

        attempt = QuizAttempt.objects.create(
            student=request.user,
            quiz=quiz,
            score=score,
            total_questions=total
        )

        return Response({
            "message": "Quiz submitted successfully",
            "score": score,
            "total_questions": total,
            "percentage": round(
                (score / total) * 100, 2
            ) if total > 0 else 0,
            "attempt_id": attempt.id
        })


class MyQuizAttemptsView(generics.ListAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return QuizAttempt.objects.filter(
            student=self.request.user
        ).order_by("-submitted_at")


class AIDoubtView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        question = request.data.get('question')
        course_id = request.data.get('course_id')

        if not question:
            return Response(
                {"error": "Question is required"},
                status=400
            )

        if not course_id:
            return Response(
                {"error": "Course ID is required"},
                status=400
            )

        answer = ask_pdf_ai(question, course_id)

        return Response({
            "question": question,
            "answer": answer
        })

class CourseMaterialUploadView(generics.CreateAPIView):
    serializer_class = CourseMaterialSerializer
    permission_classes = [IsVerifiedTeacher]

    def perform_create(self, serializer):
        course = serializer.validated_data['course']

        if course.teacher != self.request.user:
            raise PermissionDenied(
                "You can only upload materials to your own courses."
            )

        serializer.save()


class AdminCourseListView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != "admin":
            return Course.objects.none()

        return Course.objects.all()


class AdminStatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin":
            return Response(
                {"error": "Admin access required."},
                status=403
            )

        from users.models import User

        return Response({
            "students": User.objects.filter(
                role="student"
            ).count(),

            "teachers": User.objects.filter(
                role="teacher"
            ).count(),

            "courses": Course.objects.count(),

            "enrollments": Enrollment.objects.count(),
        })
class AdminCourseDeleteView(generics.DestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response(
                {"error": "Admin access required."},
                status=403
            )

        course = self.get_object()
        course.delete()

        return Response(
            {"message": "Course deleted successfully."},
            status=200
        )
class CourseMaterialListView(generics.ListAPIView):
    serializer_class = CourseMaterialSerializer
    permission_classes = [IsVerifiedTeacher]

    def get_queryset(self):
        return CourseMaterial.objects.filter(
            course__teacher=self.request.user
        ).order_by('-uploaded_at')
class StudentCourseMaterialListView(generics.ListAPIView):
    serializer_class = CourseMaterialSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        course_id = self.kwargs.get("course_id")

        return CourseMaterial.objects.filter(
            course_id=course_id
        ).order_by("-uploaded_at") 