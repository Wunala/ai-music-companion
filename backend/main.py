from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agents import MockPlaylistAgent, PlaylistAgent
from models.schemas import (
    MemoryCreate,
    MusicMemory,
    MusicProfile,
    PlaylistRequest,
    PlaylistResponse,
)
from repositories import MemoryRepository
from pathlib import Path

app = FastAPI(
    title="AI Music Companion API",
    version="0.1.0",
    description="Emotion-aware playlist generation API.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

playlist_agent: PlaylistAgent = MockPlaylistAgent()
memory_repository = MemoryRepository(Path(__file__).parent / "music_companion.db")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/v1/playlists/generate", response_model=PlaylistResponse)
async def generate_playlist(request: PlaylistRequest) -> PlaylistResponse:
    return await playlist_agent.generate(request)


@app.post("/api/v1/memories", response_model=MusicMemory, status_code=201)
async def create_memory(memory: MemoryCreate) -> MusicMemory:
    return memory_repository.create(memory)


@app.get("/api/v1/memories", response_model=list[MusicMemory])
async def list_memories() -> list[MusicMemory]:
    return memory_repository.list()


@app.get("/api/v1/profile", response_model=MusicProfile)
async def get_music_profile() -> MusicProfile:
    return memory_repository.profile()
