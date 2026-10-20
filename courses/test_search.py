from pdf_reader import extract_text_from_pdf
from text_splitter import split_text
from vector_store import create_vector_store
from search import search_chunks
pdf_path = "courses/ai_knowledge/notes.pdf"

text = extract_text_from_pdf(pdf_path)
chunks = split_text(text)

index, embeddings = create_vector_store(chunks)

question = "What are the advantages of solar energy?"

results = search_chunks(question, chunks, index)

print("\nQUESTION:")
print(question)

print("\nRELEVANT CHUNKS:")

for i, result in enumerate(results, 1):
    print(f"\n--- Chunk {i} ---")
    print(result)