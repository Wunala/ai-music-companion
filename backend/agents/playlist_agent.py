from typing import Protocol

from models.schemas import (
    EmotionScore,
    PlaylistRequest,
    PlaylistResponse,
    SongRecommendation,
)


class PlaylistAgent(Protocol):
    """Boundary for mock and future LLM-backed playlist agents."""

    async def generate(self, request: PlaylistRequest) -> PlaylistResponse: ...


class MockPlaylistAgent:
    """Deterministic demo agent that keeps the frontend flow fully testable."""

    async def generate(self, request: PlaylistRequest) -> PlaylistResponse:
        context = request.context.lower()
        is_calm = any(word in context for word in ("平静", "放松", "睡", "calm", "relax"))

        if is_calm:
            return PlaylistResponse(
                title="慢慢落回夜色",
                summary="你需要的不是立刻振作，而是一段允许情绪自然沉降的空间。",
                emotions=[
                    EmotionScore(key="tired", label="疲惫", score=0.45),
                    EmotionScore(key="calm", label="平静", score=0.35),
                    EmotionScore(key="hope", label="期待", score=0.20),
                ],
                directions=["留白感与温柔声线", "缓慢但不低落", "适合独处与夜晚"],
                songs=[
                    SongRecommendation(
                        title="Holo",
                        artist="LeeHi",
                        reason="它没有催促你变好，只是安静地提醒你：独自走过这一段也值得被看见。",
                        mood="温柔 · 松弛",
                    ),
                    SongRecommendation(
                        title="Through the Night",
                        artist="IU",
                        reason="轻柔的表达像一盏留在远处的灯，让疲惫有一个安全的落点。",
                        mood="夜色 · 安心",
                    ),
                    SongRecommendation(
                        title="Instagram",
                        artist="DEAN",
                        reason="克制的节奏适合整理复杂心绪，不会把你推向更沉重的情绪。",
                        mood="克制 · 独处",
                    ),
                ],
            )

        return PlaylistResponse(
            title="今晚 · 重新获得能量",
            summary="你刚刚穿过压力，正在从疲惫转向释然。此刻适合有力量、会向前，但不过度喧闹的音乐。",
            emotions=[
                EmotionScore(key="tired", label="疲惫", score=0.40),
                EmotionScore(key="relief", label="释然", score=0.35),
                EmotionScore(key="power", label="动力", score=0.25),
            ],
            directions=["从克制到舒展的情绪递进", "有力量感，但不过度激烈", "带一点夜晚的画面感"],
            songs=[
                SongRecommendation(
                    title="Happy Ending",
                    artist="Epik High",
                    reason="它不是单纯表达结束，而是经历一切之后的释然，与你刚解决难题后的状态很接近。",
                    mood="释然 · 叙事",
                ),
                SongRecommendation(
                    title="Left Right",
                    artist="XG",
                    reason="轻盈的律动带来自信和向前感，能补充能量，又不会打破下班路上的松弛。",
                    mood="轻盈 · 自信",
                ),
                SongRecommendation(
                    title="Everythinggoes",
                    artist="RM, NELL",
                    reason="它承认疲惫的存在，也相信一切终将流动过去，适合作为情绪转场。",
                    mood="流动 · 治愈",
                ),
                SongRecommendation(
                    title="New Jeans",
                    artist="NewJeans",
                    reason="干净、轻快却不吵闹，像把今天的重量放下后重新迈开的第一步。",
                    mood="清爽 · 向前",
                ),
            ],
        )

