from django.urls import path
from .views import (
    CourseCreateView,
    CourseListView,
    EnrollmentCreateView,
    MyEnrollmentsView,
    LessonCreateView,
    LessonListView,
    ProgressCreateView,
    MyProgressView,
    QuizCreateView,
    QuizListView,
    QuestionCreateView,
    QuestionListView,
    QuizAttemptCreateView,
    MyQuizAttemptsView,
    AIDoubtView,
    CourseMaterialUploadView,
CourseMaterialListView,
    AdminCourseListView,
     AdminStatisticsView,
     AdminCourseDeleteView,
     StudentCourseMaterialListView
)

urlpatterns = [
    path('create/', CourseCreateView.as_view(), name='course-create'),
    path('list/', CourseListView.as_view(), name='course-list'),
    path('admin/courses/', AdminCourseListView.as_view(), name='admin-course-list'),
    path('admin/statistics/', AdminStatisticsView.as_view(), name='admin-statistics'),
    path('enroll/', EnrollmentCreateView.as_view(), name='enroll-course'),
    path('my-enrollments/', MyEnrollmentsView.as_view(), name='my-enrollments'),
    path('lessons/create/', LessonCreateView.as_view(), name='lesson-create'),
    path('lessons/<int:course_id>/', LessonListView.as_view(), name='lesson-list'),
    path('progress/create/', ProgressCreateView.as_view(), name='progress-create'),
    path('progress/', MyProgressView.as_view(), name='my-progress'),
    path('quizzes/create/', QuizCreateView.as_view(), name='quiz-create'),
path('quizzes/<int:course_id>/', QuizListView.as_view(), name='quiz-list'),
path('questions/create/', QuestionCreateView.as_view(), name='question-create'),
    path('quiz-attempts/create/', QuizAttemptCreateView.as_view(), name='quiz-attempt-create'),
path('quizzes/submit/', QuizAttemptCreateView.as_view(), name='quiz-submit'),
path('ai-doubt/', AIDoubtView.as_view(), name='ai-doubt'),
path(
    'quizzes/<int:quiz_id>/questions/',
    QuestionListView.as_view(),
    name='question-list'
),
path(
    'materials/upload/',
    CourseMaterialUploadView.as_view(),
    name='material-upload'
),
path('materials/', CourseMaterialListView.as_view(), name='material-list'),
path(
    'quiz-attempts/',
    MyQuizAttemptsView.as_view(),
    name='my-quiz-attempts'
),
path(
    'admin/courses/<int:pk>/delete/',
    AdminCourseDeleteView.as_view()
),
path(
    'materials/<int:course_id>/',
    StudentCourseMaterialListView.as_view(),
    name='student-course-materials'
),
]
