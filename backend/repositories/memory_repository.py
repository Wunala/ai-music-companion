import sqlite3
from collections import Counter
from contextlib import closing
from pathlib import Path

from models.schemas import MemoryCreate, MusicMemory, MusicProfile


class MemoryRepository:
    """User-owned music memory store.

    SQLite is intentionally hidden behind this repository so storage can later
    move to Postgres/vector search without changing the API or agent layer.
    """

    def __init__(self, database_path: Path) -> None:
        self.database_path = database_path
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with closing(self._connect()) as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS music_memories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    song_title TEXT NOT NULL,
                    artist TEXT NOT NULL,
                    context TEXT NOT NULL,
                    user_note TEXT NOT NULL,
                    emotion TEXT NOT NULL,
                    recommendation_reason TEXT NOT NULL DEFAULT '',
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            connection.commit()

    def create(self, memory: MemoryCreate) -> MusicMemory:
        with closing(self._connect()) as connection:
            cursor = connection.execute(
                """
                INSERT INTO music_memories
                (song_title, artist, context, user_note, emotion, recommendation_reason)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    memory.song_title,
                    memory.artist,
                    memory.context,
                    memory.user_note,
                    memory.emotion,
                    memory.recommendation_reason,
                ),
            )
            row = connection.execute(
                "SELECT * FROM music_memories WHERE id = ?", (cursor.lastrowid,)
            ).fetchone()
            connection.commit()
        return MusicMemory(**dict(row))

    def list(self, limit: int = 50) -> list[MusicMemory]:
        with closing(self._connect()) as connection:
            rows = connection.execute(
                "SELECT * FROM music_memories ORDER BY created_at DESC, id DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return [MusicMemory(**dict(row)) for row in rows]

    def profile(self) -> MusicProfile:
        memories = self.list(limit=200)
        if not memories:
            return MusicProfile(
                memory_count=0,
                keywords=["等待你的第一段音乐记忆"],
                listening_pattern="尚未形成",
                summary="保存一首真正触动你的歌，我会从感受而不是播放次数开始认识你。",
                agent_context={
                    "preference": "unknown",
                    "confidence": 0,
                    "evidence_scope": "private_derived_profile",
                },
            )

        emotion_counts = Counter(memory.emotion for memory in memories)
        top_emotions = [emotion for emotion, _ in emotion_counts.most_common(3)]
        keywords = top_emotions + ["情境感", "个人记忆"]
        strongest = top_emotions[0]
        return MusicProfile(
            memory_count=len(memories),
            keywords=keywords[:5],
            listening_pattern=f"你常在「{strongest}」的时刻，用音乐保存当下的感受。",
            summary=(
                f"你的音乐偏好正在围绕「{strongest}」形成。"
                "你在意的不只是歌曲本身，更在意它是否能准确回应一段真实经历。"
            ),
            agent_context={
                "preference": f"与{strongest}及真实生活情境相关的音乐",
                "avoid": ["脱离情境的泛化推荐"],
                "confidence": min(0.95, 0.45 + len(memories) * 0.08),
                "evidence_scope": "private_derived_profile",
                "raw_memories_exposed": False,
            },
        )
