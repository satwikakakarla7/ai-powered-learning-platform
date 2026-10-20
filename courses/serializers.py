from rest_framework import serializers

from .models import (
    Course,
    Enrollment,
    Lesson,
    Progress,
    Quiz,
    Question,
    QuizAttempt,
    CourseMaterial,
)


class CourseSerializer(serializers.ModelSerializer):
    teacher_username = serializers.CharField(
        source='teacher.username',
        read_only=True
    )

    lessons_count = serializers.IntegerField(
        source='lessons.count',
        read_only=True
    )

    students_count = serializers.IntegerField(
        source='enrollments.count',
        read_only=True
    )

    class Meta:
        model = Course
        fields = [
            'id',
            'teacher',
            'teacher_username',
            'title',
            'description',
            'created_at',
            'lessons_count',
            'students_count'
        ]

        read_only_fields = [
            'teacher',
            'created_at',
            'lessons_count',
            'students_count'
        ]
class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        source='course',
        queryset=Course.objects.all(),
        write_only=True
    )

    class Meta:
        model = Enrollment
        fields = [
            'id',
            'student',
            'course',
            'course_id',
            'enrolled_at'
        ]
        read_only_fields = ['student', 'enrolled_at']



class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            'id',
            'course',
            'title',
            'content',
            'video_url',
            'video_file',
            'created_at'
        ]
        read_only_fields = ['created_at']



class ProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(
        source='lesson.title',
        read_only=True
    )

    course_id = serializers.IntegerField(
        source='lesson.course.id',
        read_only=True
    )

    class Meta:
        model = Progress
        fields = [
            'id',
            'student',
            'lesson',
            'lesson_title',
            'course_id',
            'completed',
            'completed_at'
        ]
        read_only_fields = [
            'student',
            'completed_at'
        ]


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = [
            'id',
            'course',
            'title',
            'created_at'
        ]
        read_only_fields = ['created_at']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            'id',
            'quiz',
            'question_text',
            'option_a',
            'option_b',
            'option_c',
            'option_d',
            'correct_answer'
        ]


class QuizAttemptSerializer(serializers.ModelSerializer):

    quiz_title = serializers.CharField(
        source='quiz.title',
        read_only=True
    )

    course_title = serializers.CharField(
        source='quiz.course.title',
        read_only=True
    )

    percentage = serializers.SerializerMethodField()

    class Meta:
        model = QuizAttempt

        fields = [
            'id',
            'student',
            'quiz',
            'quiz_title',
            'course_title',
            'score',
            'total_questions',
            'percentage',
            'submitted_at'
        ]

        read_only_fields = [
            'student',
            'score',
            'total_questions',
            'percentage',
            'submitted_at'
        ]

    def get_percentage(self, obj):
        if obj.total_questions > 0:
            return round(
                (obj.score / obj.total_questions) * 100,
                2
            )

        return 0


class CourseMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseMaterial
        fields = [
            'id',
            'course',
            'title',
            'pdf',
            'uploaded_at'
        ]
        read_only_fields = ['uploaded_at']