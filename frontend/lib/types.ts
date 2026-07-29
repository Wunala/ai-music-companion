export interface EmotionScore {
  key: string;
  label: string;
  score: number;
}

export interface SongRecommendation {
  title: string;
  artist: string;
  reason: string;
  mood: string;
}

export interface Playlist {
  title: string;
  summary: string;
  emotions: EmotionScore[];
  directions: string[];
  songs: SongRecommendation[];
}

export interface MusicMemory {
  id: number;
  song_title: string;
  artist: string;
  context: string;
  user_note: string;
  emotion: string;
  recommendation_reason: string;
  created_at: string;
}

export interface MusicProfile {
  memory_count: number;
  keywords: string[];
  listening_pattern: string;
  summary: string;
  agent_context: Record<string, unknown>;
}
