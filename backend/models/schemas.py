from pydantic import BaseModel, Field


class PlaylistRequest(BaseModel):
    context: str = Field(
        min_length=5,
        max_length=1000,
        description="The user's current mood, situation, and listening needs.",
    )


class EmotionScore(BaseModel):
    key: str
    label: str
    score: float = Field(ge=0, le=1)


class SongRecommendation(BaseModel):
    title: str
    artist: str
    reason: str
    mood: str


class PlaylistResponse(BaseModel):
    title: str
    summary: str
    emotions: list[EmotionScore]
    directions: list[str]
    songs: list[SongRecommendation]


class MemoryCreate(BaseModel):
    song_title: str
    artist: str
    context: str = Field(min_length=1, max_length=1000)
    user_note: str = Field(min_length=1, max_length=1000)
    emotion: str = Field(min_length=1, max_length=100)
    recommendation_reason: str = ""


class MusicMemory(MemoryCreate):
    id: int
    created_at: str


class MusicProfile(BaseModel):
    memory_count: int
    keywords: list[str]
    listening_pattern: str
    summary: str
    agent_context: dict[str, object]
