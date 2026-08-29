from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import httpx

app = FastAPI()

RADIO_URL = "http://82.145.41.50:12274/stream"

@app.get("/api/main")
async def get_audio_stream():
    client = httpx.AsyncClient()
    request = client.build_request("GET", RADIO_URL)
    response = await client.send(request, stream=True)
    
    return StreamingResponse(
        response.aiter_bytes(), 
        media_type="audio/mpeg"
    )