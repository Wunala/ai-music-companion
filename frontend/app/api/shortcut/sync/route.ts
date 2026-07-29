import { NextRequest, NextResponse } from "next/server";
import {
  deleteSyncValue,
  getSyncValue,
  setSyncValue,
} from "@/lib/sync-store";

export const runtime = "nodejs";
export const maxDuration = 60;

const LIBRARY_TTL_SECONDS = 90 * 24 * 60 * 60;
const MAX_LIBRARY_SONGS = 10000;

type PairRecord = {
  sessionToken: string;
  createdAt: string;
};

type ShortcutSong = {
  title?: unknown;
  artist?: unknown;
  album?: unknown;
  genre?: unknown;
  duration?: unknown;
  play_count?: unknown;
  last_played_at?: unknown;
};

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 500) : fallback;
}

function number(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function POST(request: NextRequest) {
  let body: {
    pairing_code?: unknown;
    shortcut_version?: unknown;
    songs?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "请求必须是 JSON" }, { status: 400 });
  }

  const code = text(body.pairing_code);
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "请输入网页显示的六位配对码" }, { status: 400 });
  }

  const pair = await getSyncValue<PairRecord>(`pair:${code}`);
  if (!pair) {
    return NextResponse.json(
      { error: "配对码无效或已经过期，请在网页重新生成" },
      { status: 404 },
    );
  }

  if (!Array.isArray(body.songs) || body.songs.length === 0) {
    return NextResponse.json({ error: "没有收到歌曲数据" }, { status: 400 });
  }
  if (body.songs.length > MAX_LIBRARY_SONGS) {
    return NextResponse.json(
      { error: `一次最多同步 ${MAX_LIBRARY_SONGS} 首歌曲` },
      { status: 413 },
    );
  }

  const songs = (body.songs as ShortcutSong[])
    .map((song, index) => ({
      id: `shortcut-${index}-${crypto.randomUUID().slice(0, 8)}`,
      title: text(song.title),
      artist: text(song.artist, "Unknown Artist"),
      album: text(song.album, "Unknown Album"),
      genre: text(song.genre, "Unknown"),
      year: 0,
      duration: Math.round(number(song.duration)),
      playCount: Math.round(number(song.play_count)),
      lastPlayed: text(song.last_played_at).slice(0, 10) || undefined,
      tags: [text(song.genre, "Unknown")],
      energy: 50,
    }))
    .filter((song) => song.title);

  if (songs.length === 0) {
    return NextResponse.json({ error: "歌曲缺少名称" }, { status: 400 });
  }

  const syncedAt = new Date().toISOString();
  const library = { songs, songCount: songs.length, syncedAt };
  await setSyncValue(
    `library:${pair.sessionToken}`,
    library,
    LIBRARY_TTL_SECONDS,
  );
  await setSyncValue(
    `sync:${pair.sessionToken}`,
    { status: "complete", songCount: songs.length, syncedAt },
    LIBRARY_TTL_SECONDS,
  );
  await deleteSyncValue(`pair:${code}`);

  return NextResponse.json({
    ok: true,
    song_count: songs.length,
    synced_at: syncedAt,
    message: `已同步 ${songs.length} 首歌曲`,
  });
}
