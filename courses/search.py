from .vector_store import model


def search_chunks(question, chunks, index, top_k=5):
    question_embedding = model.encode([question])
    question_embedding = question_embedding.astype("float32")

    distances, indices = index.search(
        question_embedding,
        min(top_k, len(chunks))
    )

    results = []

    for i in indices[0]:
        if 0 <= i < len(chunks):
            results.append(chunks[i])

    return results