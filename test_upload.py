import httpx
import asyncio

async def test():
    files = {'file': ('resume.pdf', b'dummy content about Python and React', 'application/pdf')}
    async with httpx.AsyncClient() as client:
        response = await client.post('http://127.0.0.1:8000/participants/upload_resume', files=files)
        print(response.status_code)
        print(response.json())

asyncio.run(test())
