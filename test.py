import asyncio
from participant_ai.pipelines.resume_rag.parser import parse_and_vectorize_batch

async def main():
    text = "Jane Doe. B.Tech Computer Science from MIT. Experience in Python, React, and Machine Learning. Built an AI project using PyTorch."
    try:
        results = await parse_and_vectorize_batch([text])
        print("SUCCESS!")
        parsed, vector, embed, bd = results[0]
        print(f"Name: {parsed.name}")
        print(f"Skills: {parsed.raw_skills}")
        print(f"Vector: {vector.to_dict()}")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
