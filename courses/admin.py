from django.contrib import admin
from .models import Course, Enrollment, Lesson, Progress, Quiz, Question, QuizAttempt, CourseMaterial
admin.site.register(Course)
admin.site.register(Enrollment)
admin.site.register(Lesson)
admin.site.register(Progress)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(QuizAttempt)
admin.site.register(CourseMaterial)