from google import genai
from django.conf import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)


def ask_ai(question):
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=question
    )

    return response.text