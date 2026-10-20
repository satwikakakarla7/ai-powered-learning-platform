from google import genai
from django.conf import settings

from .pdf_reader import extract_text_from_pdf
from .text_splitter import split_text
from .vector_store import create_vector_store
from .search import search_chunks
client = genai.Client(api_key=settings.GEMINI_API_KEY)


def ask_pdf_ai(question, course_id):
    from .models import CourseMaterial

    materials = CourseMaterial.objects.filter(
        course_id=course_id
    )

    if not materials.exists():
        return "Sorry, no study material has been uploaded for this course."

    # rest of your existing code...
    all_text = ""

    for material in materials:
        pdf_path = material.pdf.path

        text = extract_text_from_pdf(pdf_path)

        all_text += "\n" + text

    chunks = split_text(all_text)

    if not chunks:
        return "Sorry, I could not extract any text from the uploaded study material."

    index, embeddings = create_vector_store(chunks)

    relevant_chunks = search_chunks(
        question,
        chunks,
        index,
        top_k=3
    )

    context = "\n\n".join(relevant_chunks)

    prompt = f"""
Answer the student's question using only the study material provided below.

Study material:
{context}

Student question:
{question}

If the answer is not available in the study material, say:
"Sorry, I could not find this information in the uploaded study material."
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text