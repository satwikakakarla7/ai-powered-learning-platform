import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from courses.pdf_reader import extract_text_from_pdf
from courses.text_splitter import split_text

pdf_path = "courses/ai_knowledge/notes.pdf"

text = extract_text_from_pdf(pdf_path)

print("PDF TEXT:")
print(text[:1000])

chunks = split_text(text)

print("\nNUMBER OF CHUNKS:")
print(len(chunks))

print("\nFIRST CHUNK:")
print(chunks[0])