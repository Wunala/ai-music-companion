"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Disc3,
  Download,
  ExternalLink,
  FileMusic,
  Headphones,
  Library,
  ListMusic,
  LoaderCircle,
  Music2,
  Plus,
  Search,
  Smartphone,
  SlidersHorizontal,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: number;
  duration: number;
  tags: string[];
  energy: number;
  lastPlayed?: string;
  language?: string;
  aiSummary?: string;
  playCount?: number;
};

type Result = Song & { reason: string; score: number };

const demoLibrary: Song[] = [
  { id: "1", title: "Happy Ending", artist: "Epik High", album: "SHOEBOX", genre: "K-Hip-Hop", year: 2014, duration: 238, tags: ["释然", "叙事", "夜晚", "情绪递进", "韩语"], energy: 48, lastPlayed: "2025-02" },
  { id: "2", title: "Left Right", artist: "XG", album: "SHOOTING STAR", genre: "R&B", year: 2023, duration: 208, tags: ["轻盈", "自信", "通勤", "律动", "女声"], energy: 64, lastPlayed: "2026-06" },
  { id: "3", title: "Everythinggoes", artist: "RM, NELL", album: "mono.", genre: "Alternative", year: 2018, duration: 217, tags: ["治愈", "流动", "雨天", "夜晚", "韩语"], energy: 38, lastPlayed: "2024-11" },
  { id: "4", title: "Holo", artist: "LeeHi", album: "HOLO", genre: "K-R&B", year: 2020, duration: 178, tags: ["温柔", "独处", "治愈", "女声", "韩语"], energy: 31, lastPlayed: "2026-01" },
  { id: "5", title: "Through the Night", artist: "IU", album: "Palette", genre: "K-Pop", year: 2017, duration: 253, tags: ["安静", "夜晚", "睡前", "温柔", "韩语"], energy: 22, lastPlayed: "2025-08" },
  { id: "6", title: "Instagram", artist: "DEAN", album: "instagram", genre: "K-R&B", year: 2017, duration: 256, tags: ["深夜", "克制", "独处", "氛围", "韩语"], energy: 35, lastPlayed: "2023-12" },
  { id: "7", title: "New Jeans", artist: "NewJeans", album: "Get Up", genre: "K-Pop", year: 2023, duration: 108, tags: ["清爽", "轻快", "通勤", "女声", "韩语"], energy: 66, lastPlayed: "2026-07" },
  { id: "8", title: "Ditto", artist: "NewJeans", album: "OMG", genre: "K-Pop", year: 2022, duration: 185, tags: ["怀旧", "冬天", "氛围", "女声", "韩语"], energy: 47, lastPlayed: "2025-01" },
  { id: "9", title: "Tokyo", artist: "RM", album: "mono.", genre: "Alternative", year: 2018, duration: 205, tags: ["城市", "夜晚", "独处", "旅行", "韩语"], energy: 29, lastPlayed: "2022-09" },
  { id: "10", title: "Square (2017)", artist: "Yerin Baek", album: "Every letter I sent you.", genre: "Indie", year: 2019, duration: 261, tags: ["自由", "成长", "女声", "英文", "情绪递进"], energy: 58, lastPlayed: "2025-05" },
  { id: "11", title: "End of a day", artist: "JONGHYUN", album: "Story Op.1", genre: "Ballad", year: 2015, duration: 274, tags: ["下班", "安慰", "疲惫", "夜晚", "韩语"], energy: 25, lastPlayed: "2024-03" },
  { id: "12", title: "Breathe", artist: "LeeHi", album: "SEOULITE", genre: "Ballad", year: 2016, duration: 288, tags: ["安慰", "疲惫", "治愈", "女声", "韩语"], energy: 26, lastPlayed: "2023-06" },
  { id: "13", title: "D (Half Moon)", artist: "DEAN, Gaeko", album: "130 mood : TRBL", genre: "K-R&B", year: 2016, duration: 229, tags: ["深夜", "思念", "氛围", "韩语"], energy: 40, lastPlayed: "2022-11" },
  { id: "14", title: "ANTIFRAGILE", artist: "LE SSERAFIM", album: "ANTIFRAGILE", genre: "K-Pop", year: 2022, duration: 184, tags: ["力量", "自信", "运动", "女声", "韩语"], energy: 88, lastPlayed: "2026-04" },
  { id: "15", title: "People", artist: "Agust D", album: "D-2", genre: "K-Hip-Hop", year: 2020, duration: 197, tags: ["思考", "释然", "成长", "韩语"], energy: 52, lastPlayed: "2024-08" },
  { id: "16", title: "NAPPA", artist: "Crush", album: "NAPPA", genre: "K-R&B", year: 2019, duration: 181, tags: ["轻松", "夏天", "律动", "韩语"], energy: 61, lastPlayed: "2021-07" },
];

const syncShortcutUrl =
  process.env.NEXT_PUBLIC_SYNC_SHORTCUT_URL ??
  "https://www.icloud.com/shortcuts/e355efaa5f7147409fc511d54f20e8f2";
const queueShortcutUrl =
  process.env.NEXT_PUBLIC_QUEUE_SHORTCUT_URL ??
  "https://www.icloud.com/shortcuts/ff3fd03e1f0f4ecc8e0290bd801bb836";
const quickPrompts = [
  "🌙 深夜开车",
  "💿 最近没听过",
  "⚡ 只要女团",
  "🫧 轻松一点",
];
const queueColors = ["#C8FF4D", "#E9E7FF", "#FFB4BB", "#B9E6FF"];

function analyze(query: string, songs: Song[]): Result[] {
  const q = query.toLowerCase();
  const quiet = /不要太吵|安静|放松|睡前|温柔|轻柔/.test(q);
  const powerful = /力量|自信|振作|能量/.test(q);
  const night = /晚上|夜晚|深夜|开车|下班/.test(q);
  const korean = /韩语|韩国|k-pop|kpop/.test(q);
  const rediscover = /很久|没听|找回|以前|两年|重新发现/.test(q);
  const female = /女声|女歌手/.test(q);
  const wanted = ["释然", "叙事", "夜晚", "情绪递进", "轻盈", "自信", "通勤", "治愈", "温柔", "独处", "安静", "深夜", "克制", "氛围", "力量", "下班", "安慰", "疲惫", "韩语"]
    .filter((tag) => q.includes(tag.toLowerCase()));

  return songs
    .map((song) => {
      let score = 1;
      const reasons: string[] = [];
      const tagText = `${song.tags.join(" ")} ${song.genre} ${song.artist}`.toLowerCase();
      if (quiet && song.energy <= 55) { score += 4; reasons.push(`能量值 ${song.energy}，保持克制`); }
      if (quiet && song.energy > 75) score -= 5;
      if (powerful && song.energy >= 45 && song.energy <= 75) { score += 4; reasons.push("有向前感，但不过度刺激"); }
      if (night && song.tags.some((tag) => ["夜晚", "深夜", "通勤", "下班", "城市"].includes(tag))) { score += 4; reasons.push("符合夜间与返程场景"); }
      if (korean && tagText.includes("韩语")) { score += 5; reasons.push("来自你的韩语收藏"); }
      if (female && song.tags.includes("女声")) { score += 4; reasons.push("符合女声条件"); }
      if (rediscover && song.lastPlayed && song.lastPlayed < "2025-01") { score += 6; reasons.push(`上次播放停留在 ${song.lastPlayed.replace("-", " 年 ")} 月`); }
      wanted.forEach((tag) => {
        if (tagText.includes(tag.toLowerCase())) { score += 2; reasons.push(`带有“${tag}”感`); }
      });
      if (reasons.length === 0) reasons.push(`与你资料库中的 ${song.genre} 偏好相近`);
      return { ...song, score, reason: [...new Set(reasons)].slice(0, 2).join("，") };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(10, songs.length));
}

function parseCsv(text: string): Song[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((value) => value.replace(/^"|"$/g, "").trim().toLowerCase());
  return lines.slice(1).map((line, index) => {
    const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map((value) => value.replace(/^"|"$/g, "").trim()) ?? [];
    const get = (...names: string[]) => values[headers.findIndex((header) => names.includes(header))] ?? "";
    const genre = get("genre", "类型") || "Unknown";
    return {
      id: `import-${index}`,
      title: get("name", "title", "歌曲", "名称") || `Track ${index + 1}`,
      artist: get("artist", "艺人") || "Unknown Artist",
      album: get("album", "专辑") || "Unknown Album",
      genre,
      year: Number(get("year", "年份")) || 0,
      duration: Math.round((Number(get("time", "duration", "时长")) || 210000) / 1000),
      tags: [genre],
      energy: 50,
      lastPlayed: get("last played", "lastplayed", "上次播放")?.slice(0, 7),
    };
  });
}

function parseXml(text: string): Song[] {
  const document = new DOMParser().parseFromString(text, "application/xml");
  const dicts = Array.from(document.querySelectorAll("dict"));
  const songs: Song[] = [];
  for (const dict of dicts) {
    const children = Array.from(dict.children);
    const data: Record<string, string> = {};
    for (let index = 0; index < children.length - 1; index += 1) {
      if (children[index].tagName === "key") data[children[index].textContent ?? ""] = children[index + 1].textContent ?? "";
    }
    if (!data.Name || !data.Artist) continue;
    songs.push({
      id: data["Track ID"] || `xml-${songs.length}`,
      title: data.Name,
      artist: data.Artist,
      album: data.Album || "Unknown Album",
      genre: data.Genre || "Unknown",
      year: Number(data.Year) || 0,
      duration: Math.round((Number(data["Total Time"]) || 210000) / 1000),
      tags: [data.Genre || "Unknown"],
      energy: 50,
      lastPlayed: data["Play Date UTC"]?.slice(0, 7),
    });
  }
  return songs;
}

export default function Home() {
  const [librarySongs, setLibrarySongs] = useState<Song[]>(demoLibrary);
  const [libraryName, setLibraryName] = useState("Yang 的示例资料库");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [playlistSummary, setPlaylistSummary] = useState("");
  const [generationSource, setGenerationSource] = useState<"ai" | "local" | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [externalSuggestions, setExternalSuggestions] = useState<
    Array<{ title: string; artist: string; reason: string }>
  >([]);
  const [pairingCode, setPairingCode] = useState("");
  const [pairingToken, setPairingToken] = useState("");
  const [syncStatus, setSyncStatus] = useState("");
  const [creatingPair, setCreatingPair] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const visibleResults = useMemo(() => results.filter((song) => !excluded.has(song.id)), [results, excluded]);
  const totalMinutes = Math.round(visibleResults.reduce((sum, song) => sum + song.duration, 0) / 60);

  useEffect(() => {
    const savedToken = window.localStorage.getItem("music-companion-library-token");
    if (!savedToken) return;

    fetch(`/api/library/pair?token=${encodeURIComponent(savedToken)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as {
          status?: string;
          songs?: Song[];
          songCount?: number;
          syncedAt?: string;
        };
      })
      .then((data) => {
        if (data?.status === "complete" && data.songs?.length) {
          setLibrarySongs(data.songs);
          setLibraryName(`我的 Apple Music 资料库`);
          setSyncStatus(
            `已载入 ${data.songCount ?? data.songs.length} 首 · ${new Date(
              data.syncedAt ?? Date.now(),
            ).toLocaleString("zh-CN")}`,
          );
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!pairingToken || !showImport) return;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(
          `/api/library/pair?token=${encodeURIComponent(pairingToken)}`,
          { cache: "no-store" },
        );
        const data = (await response.json()) as {
          status?: string;
          songs?: Song[];
          songCount?: number;
          syncedAt?: string;
          error?: string;
        };
        if (data.status === "complete" && data.songs?.length) {
          setLibrarySongs(data.songs);
          setLibraryName("我的 Apple Music 资料库");
          setResults([]);
          setSyncStatus(
            `同步成功：${data.songCount ?? data.songs.length} 首歌曲`,
          );
          window.localStorage.setItem(
            "music-companion-library-token",
            pairingToken,
          );
          window.clearInterval(timer);
        } else if (data.status === "expired") {
          setSyncStatus(data.error ?? "配对码已过期");
          window.clearInterval(timer);
        }
      } catch {
        setSyncStatus("正在等待快捷指令上传…");
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [pairingToken, showImport]);

  async function createPairingCode() {
    setCreatingPair(true);
    setSyncStatus("");
    try {
      const response = await fetch("/api/library/pair", { method: "POST" });
      const data = (await response.json()) as {
        code?: string;
        sessionToken?: string;
        persistent?: boolean;
        error?: string;
      };
      if (!response.ok || !data.code || !data.sessionToken) {
        throw new Error(data.error ?? "无法生成配对码");
      }
      setPairingCode(data.code);
      setPairingToken(data.sessionToken);
      setSyncStatus(
        data.persistent
          ? "等待快捷指令上传，配对码十分钟内有效"
          : "本地测试模式：请保持当前开发服务器运行",
      );
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : "无法生成配对码");
    } finally {
      setCreatingPair(false);
    }
  }

  async function generate() {
    if (!query.trim()) return;
    setLoading(true);
    setSaved(false);
    setGenerationError("");
    setExternalSuggestions([]);
    try {
      const response = await fetch("/api/generate-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          songs: librarySongs.map(
            ({ id, title, artist, album, genre, year, energy, tags, language, aiSummary, lastPlayed }) => ({
              id, title, artist, album, genre, year, energy, tags, language, aiSummary, lastPlayed,
            }),
          ),
        }),
      });
      const data = (await response.json()) as {
        title?: string;
        summary?: string;
        selections?: Array<{ id: string; reason: string; score: number }>;
        external_suggestions?: Array<{ title: string; artist: string; reason: string }>;
        error?: string;
      };
      if (!response.ok || !data.selections) throw new Error(data.error ?? "AI 生成失败");
      const songsById = new Map(librarySongs.map((song) => [song.id, song]));
      const selected = data.selections
        .map((selection) => {
          const song = songsById.get(selection.id);
          return song ? { ...song, reason: selection.reason, score: selection.score } : null;
        })
        .filter((song): song is Result => song !== null);
      setResults(selected);
      setPlaylistTitle(data.title ?? "为你找到的歌");
      setPlaylistSummary(data.summary ?? "");
      setGenerationSource("ai");
      setExternalSuggestions(data.external_suggestions ?? []);
      setExcluded(new Set());
    } catch (error) {
      setResults([]);
      setPlaylistTitle("暂时无法完成筛选");
      setPlaylistSummary("");
      setGenerationError(error instanceof Error ? error.message : "AI 服务暂时不可用");
      setGenerationSource(null);
      setExcluded(new Set());
    } finally {
      setHasGenerated(true);
      setLoading(false);
    }
  }

  async function importLibrary(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const songs = file.name.toLowerCase().endsWith(".xml") ? parseXml(text) : parseCsv(text);
    if (songs.length) {
      setLibrarySongs(songs);
      setLibraryName(file.name.replace(/\.(csv|xml)$/i, ""));
      setResults([]);
      setShowImport(false);
      await analyzeImportedSongs(songs);
    }
  }

  async function analyzeImportedSongs(songs: Song[]) {
    setAnalyzing(true);
    const batchSize = 30;
    const analyses = new Map<
      string,
      { language: string; energy: number; tags: string[]; ai_summary: string }
    >();
    try {
      for (let offset = 0; offset < songs.length; offset += batchSize) {
        const batch = songs.slice(offset, offset + batchSize);
        setAnalysisMessage(
          `AI 正在分析 ${offset + 1}–${Math.min(offset + batchSize, songs.length)} / ${songs.length} 首…`,
        );
        const response = await fetch("/api/analyze-library", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            songs: batch.map(({ id, title, artist, album, genre, year }) => ({
              id, title, artist, album, genre, year,
            })),
          }),
        });
        const data = (await response.json()) as {
          analyses?: Array<{
            id: string;
            language: string;
            energy: number;
            tags: string[];
            ai_summary: string;
          }>;
          error?: string;
        };
        if (!response.ok || !data.analyses) throw new Error(data.error ?? "AI 分析失败");
        data.analyses.forEach((analysis) => analyses.set(analysis.id, analysis));
      }
      setLibrarySongs(
        songs.map((song) => {
          const analysis = analyses.get(song.id);
          return analysis
            ? {
                ...song,
                energy: analysis.energy,
                language: analysis.language,
                tags: analysis.tags,
                aiSummary: analysis.ai_summary,
              }
            : song;
        }),
      );
      setAnalysisMessage(`已完成 ${analyses.size} 首歌曲的 AI 标签分析`);
    } catch (error) {
      setAnalysisMessage(error instanceof Error ? error.message : "AI 分析失败");
    } finally {
      setAnalyzing(false);
    }
  }

  function exportPlaylist() {
    const escape = (value: string | number | undefined) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;
    const content = [
      "Title,Artist,Album,Genre,Year,Language,Energy,AI Tags,AI Summary",
      ...visibleResults.map((song) =>
        [
          song.title,
          song.artist,
          song.album,
          song.genre,
          song.year,
          song.language,
          song.energy,
          song.tags.join("|"),
          song.aiSummary,
        ]
          .map(escape)
          .join(","),
      ),
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    link.download = "AI-Music-Companion-Playlist.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function savePlaylist() {
    const savedPlaylists = JSON.parse(
      window.localStorage.getItem("music-companion-playlists") ?? "[]",
    ) as unknown[];
    savedPlaylists.unshift({
      id: crypto.randomUUID(),
      title: playlistTitle || query,
      query,
      summary: playlistSummary,
      createdAt: new Date().toISOString(),
      songs: visibleResults.map(({ id, title, artist, album, reason }) => ({
        id,
        title,
        artist,
        album,
        reason,
      })),
    });
    window.localStorage.setItem(
      "music-companion-playlists",
      JSON.stringify(savedPlaylists.slice(0, 50)),
    );
    setSaved(true);
  }

  function createAppleMusicPlaylist() {
    if (visibleResults.length === 0) return;
    const payload = {
      playlist_title: playlistTitle || `Music Companion · ${query.slice(0, 30)}`,
      songs: visibleResults.map(({ title, artist, album }) => ({
        title,
        artist,
        album,
      })),
    };
    const shortcutName = "Music Companion Create Playlist";
    const shortcutUrl =
      `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}` +
      `&input=text&text=${encodeURIComponent(JSON.stringify(payload))}`;
    window.location.href = shortcutUrl;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7fb] text-[#15151a]">
      <nav className="border-b-2 border-[#15151a] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 rotate-[-4deg] items-center justify-center rounded-xl border-2 border-[#15151a] bg-[#635bff] text-white shadow-[3px_3px_0_#15151a]"><Music2 className="h-5 w-5" /><span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#15151a] bg-[#c8ff4d]" /></div>
            <div><p className="text-sm font-black tracking-[-0.01em]">Music Companion</p><p className="text-[11px] font-medium text-[#74747f]">Your library in motion</p></div>
          </div>
          <button onClick={() => setShowImport(true)} className="flex items-center gap-2 rounded-full border-2 border-[#15151a] bg-[#c8ff4d] px-3 py-2 text-sm font-bold shadow-[2px_2px_0_#15151a] transition hover:-translate-y-0.5 sm:px-4">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#15151a]" />
            <span className="hidden sm:inline">{libraryName}</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs">{librarySongs.length} 首</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>

      {analysisMessage && (
        <div className="mx-auto mt-4 flex max-w-7xl items-center gap-2 px-5 text-xs text-[#716d66] md:px-8">
          {analyzing ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-[#967047]" />}
          {analysisMessage}
        </div>
      )}

      <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-12 md:px-8 md:pt-16">
        <div className="pointer-events-none absolute -right-24 top-10 h-52 w-52 rounded-full bg-[#e9e7ff] blur-3xl" />
        <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_0.48fr]">
          <div>
            <div className="mb-5 flex w-fit rotate-[-2deg] items-center gap-2 rounded-full border-2 border-[#15151a] bg-[#ffb4bb] px-3 py-1.5 text-xs font-black shadow-[2px_2px_0_#15151a]"><Disc3 className="h-4 w-4" />只在你的收藏里找</div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.055em] md:text-7xl lg:text-[82px]">
              今天想听什么？<br /><span className="text-[#635bff]">从你的音乐里找。</span>
            </h1>
          </div>
          <p className="max-w-sm text-base font-medium leading-7 text-[#656570]">
            不用翻歌单。说出此刻的状态，马上得到只属于你资料库的播放队列。
          </p>
        </div>

        <div className="relative mt-10 rounded-[28px] border-2 border-[#15151a] bg-white p-3 shadow-[7px_7px_0_#15151a]">
          <div className="flex items-start gap-3 p-3 md:p-5">
            <Search className="mt-1 h-5 w-5 shrink-0 text-[#635bff]" />
            <textarea
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") generate(); }}
              placeholder="比如：晚上开车，来三首有力量但不要太吵的歌"
              className="min-h-20 w-full resize-none bg-transparent text-lg font-semibold leading-8 outline-none placeholder:font-medium placeholder:text-[#aaaab5]"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#15151a]/10 px-3 pt-3">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button key={prompt} onClick={() => setQuery(prompt.slice(3))} className="rounded-full bg-[#f0efff] px-3 py-2 text-xs font-bold text-[#5149d8] transition hover:bg-[#e3e0ff]">{prompt}</button>
              ))}
            </div>
            <button onClick={generate} disabled={!query.trim() || loading} className="flex h-11 items-center gap-2 rounded-full border-2 border-[#15151a] bg-[#635bff] px-5 text-sm font-black text-white shadow-[2px_2px_0_#15151a] transition hover:-translate-y-0.5 disabled:opacity-40">
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? "正在找歌…" : "开始找歌"}
            </button>
          </div>
        </div>

        {results.length === 0 && !loading && (
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              [SlidersHorizontal, "自然语言筛选", "不用记住复杂分类，说出你真正想听的感觉。"],
              [Clock3, "重新发现旧收藏", "找回很久没听，却曾经陪伴过你的歌曲。"],
              [ListMusic, "整理成可用歌单", "移除不合适的歌，再保存或导出最终结果。"],
            ].map(([Icon, title, body]) => {
              const CardIcon = Icon as typeof SlidersHorizontal;
              const colors = ["bg-[#c8ff4d]", "bg-[#e9e7ff]", "bg-[#ffb4bb]"];
              const cardIndex = title === "自然语言筛选" ? 0 : title === "重新发现旧收藏" ? 1 : 2;
              return <div key={title as string} className={`rounded-2xl border-2 border-[#15151a] p-5 shadow-[3px_3px_0_#15151a] ${colors[cardIndex]}`}><span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#15151a] bg-white"><CardIcon className="h-5 w-5" /></span><h2 className="mt-6 font-black">{title as string}</h2><p className="mt-2 text-sm font-medium leading-6 text-[#53535c]">{body as string}</p></div>;
            })}
          </div>
        )}

        {hasGenerated && !loading && (
          <section className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="flex items-center gap-2 text-xs font-black text-[#635bff]">
                  YOUR NEXT QUEUE
                  <span className={`rounded-full px-2 py-1 text-[10px] ${generationSource === "ai" ? "bg-[#c8ff4d] text-[#15151a]" : "bg-[#ffb4bb] text-[#15151a]"}`}>
                    {generationSource === "ai" ? "AI MATCHED" : "未生成"}
                  </span>
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] md:text-4xl">{playlistTitle || `为“${query}”找到的歌`}</h2>
                {playlistSummary && <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#656570]">{playlistSummary}</p>}
                <p className="mt-2 text-sm font-bold text-[#858590]">{visibleResults.length} 首 · 约 {totalMinutes} 分钟 · 来自你的资料库</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={exportPlaylist} className="flex items-center gap-2 rounded-full border-2 border-[#15151a] bg-white px-4 py-2.5 text-sm font-bold"><Download className="h-4 w-4" />CSV</button>
                <button onClick={savePlaylist} className="flex items-center gap-2 rounded-full border-2 border-[#15151a] bg-[#c8ff4d] px-4 py-2.5 text-sm font-bold">{saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{saved ? "已保存" : "保存"}</button>
                <button
                  onClick={createAppleMusicPlaylist}
                  disabled={visibleResults.length === 0}
                  className="flex items-center gap-2 rounded-full border-2 border-[#15151a] bg-[#ff6b6b] px-5 py-2.5 text-sm font-black text-white shadow-[2px_2px_0_#15151a] transition hover:-translate-y-0.5 disabled:opacity-40"
                >
                  <Music2 className="h-4 w-4" />
                  在 Apple Music 中播放
                </button>
              </div>
            </div>
            {generationError && (
              <div className="mt-7 rounded-3xl border border-[#c98b76]/30 bg-[#fbf1ed] p-8 text-center">
                <p className="font-medium text-[#7f4937]">{generationError}</p>
                <p className="mt-2 text-sm text-[#946b5d]">没有使用本地规则替代，请稍后重试。</p>
              </div>
            )}
            {!generationError && visibleResults.length === 0 && (
              <div className="mt-7 rounded-3xl border border-black/[0.08] bg-white p-8 text-center">
                <p className="text-2xl font-black">你的资料库里没有符合条件的歌曲</p>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#817b73]">{playlistSummary || "可以换一个条件，或看看资料库外的推荐。"}</p>
              </div>
            )}
            {visibleResults.length > 0 && <div className="mt-7 overflow-hidden rounded-[26px] border-2 border-[#15151a] bg-white shadow-[5px_5px_0_#15151a]">
              {visibleResults.map((song, index) => (
                <article key={song.id} className="group grid grid-cols-[46px_1fr_auto] items-center gap-4 border-b-2 border-[#15151a]/10 p-4 last:border-0 md:grid-cols-[46px_1fr_1.2fr_auto] md:px-6">
                  <div style={{ backgroundColor: queueColors[index % queueColors.length] }} className="flex h-11 w-11 rotate-[-3deg] items-center justify-center rounded-xl border-2 border-[#15151a] text-sm font-black shadow-[2px_2px_0_#15151a]">{String(index + 1).padStart(2, "0")}</div>
                  <div><h3 className="font-black">{song.title}</h3><p className="mt-1 text-sm font-medium text-[#767680]">{song.artist} · {song.album}</p></div>
                  <div className="hidden md:block"><p className="rounded-xl bg-[#f1f0ff] px-3 py-2 text-sm font-medium text-[#4f4b75]">{song.reason}</p><div className="mt-2 flex gap-2">{song.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-[#f1f1f5] px-2 py-1 text-[10px] font-bold text-[#72727c]">{tag}</span>)}</div></div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`https://music.apple.com/search?term=${encodeURIComponent(`${song.title} ${song.artist}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-full bg-[#ecebff] px-3 py-2 text-xs font-bold text-[#5149d8] transition hover:bg-[#dedbff]"
                      aria-label={`在 Apple Music 中查找 ${song.title}`}
                    >
                      <Music2 className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">Apple Music</span>
                      <ExternalLink className="hidden h-3 w-3 lg:block" />
                    </a>
                    <button onClick={() => setExcluded((current) => new Set([...current, song.id]))} className="rounded-full p-2 text-[#aaa49b] hover:bg-[#f3efe8] hover:text-[#3c3833]" aria-label={`移除 ${song.title}`}><X className="h-4 w-4" /></button>
                  </div>
                </article>
              ))}
            </div>}
            {externalSuggestions.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">资料库外推荐</h3>
                    <p className="mt-1 text-xs text-[#8b857c]">这些歌曲不在你的资料库中，将在 Apple Music 中打开。</p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {externalSuggestions.map((song) => (
                    <article key={`${song.artist}-${song.title}`} className="rounded-2xl border border-black/[0.08] bg-white p-5">
                      <p className="text-xs uppercase tracking-[0.15em] text-[#967047]">Outside your library</p>
                      <h4 className="mt-3 font-medium">{song.title}</h4>
                      <p className="mt-1 text-sm text-[#817b73]">{song.artist}</p>
                      <p className="mt-4 text-sm leading-6 text-[#625e57]">{song.reason}</p>
                      <a
                        href={`https://music.apple.com/search?term=${encodeURIComponent(`${song.title} ${song.artist}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 flex w-fit items-center gap-2 rounded-full bg-[#f2eee7] px-4 py-2 text-xs font-medium"
                      >
                        <Music2 className="h-3.5 w-3.5" />在 Apple Music 中查找<ExternalLink className="h-3 w-3" />
                      </a>
                    </article>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-4 text-center text-xs text-[#948e85]">你移除和保留的歌曲，会逐渐帮助系统理解“你的力量感”和“你的放松”具体是什么。</p>
          </section>
        )}
      </section>

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#15151a]/70 p-5 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border-2 border-[#15151a] bg-white p-7 shadow-[7px_7px_0_#635bff]">
            <div className="flex items-start justify-between"><div><p className="text-xs font-black text-[#635bff]">YOUR MUSIC LIBRARY</p><h2 className="mt-2 text-3xl font-black tracking-[-0.035em]">连接你的资料库</h2></div><button onClick={() => setShowImport(false)} className="rounded-full border-2 border-[#15151a] p-2"><X className="h-5 w-5" /></button></div>
            <p className="mt-4 text-sm leading-6 text-[#746f67]">
              推荐使用 iPhone 快捷指令读取 Apple Music 资料库。网页会生成一次性配对码，快捷指令上传完成后，此页面会自动载入歌曲。
            </p>
            <div className="mt-6 rounded-2xl border-2 border-[#15151a] bg-[#e9e7ff] p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">
                  <Smartphone className="h-5 w-5 text-[#635bff]" />
                </span>
                <div className="min-w-0 flex-1">
                  <strong className="block text-sm">通过快捷指令同步</strong>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {syncShortcutUrl ? (
                      <a
                        href={syncShortcutUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border-2 border-[#15151a] bg-[#c8ff4d] px-3 py-2 text-xs font-bold"
                      >
                        安装资料库同步快捷指令
                      </a>
                    ) : (
                      <span className="rounded-full border border-black/10 px-3 py-2 text-xs text-[#999187]">
                        同步快捷指令链接待添加
                      </span>
                    )}
                    {queueShortcutUrl ? (
                      <a
                        href={queueShortcutUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border-2 border-[#15151a] bg-[#ffb4bb] px-3 py-2 text-xs font-bold"
                      >
                        安装播放队列快捷指令
                      </a>
                    ) : (
                      <span className="rounded-full border border-black/10 px-3 py-2 text-xs text-[#999187]">
                        队列快捷指令链接待添加
                      </span>
                    )}
                  </div>
                  {!pairingCode ? (
                    <>
                      <p className="mt-1 text-xs leading-5 text-[#7f776c]">
                        先生成配对码，再运行 Music Companion · Sync Library。
                      </p>
                      <button
                        onClick={createPairingCode}
                        disabled={creatingPair}
                        className="mt-4 flex items-center gap-2 rounded-full border-2 border-[#15151a] bg-[#635bff] px-4 py-2.5 text-xs font-bold text-white shadow-[2px_2px_0_#15151a] disabled:opacity-50"
                      >
                        {creatingPair && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
                        {creatingPair ? "正在生成…" : "生成配对码"}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="mt-1 text-xs text-[#7f776c]">
                        在快捷指令询问时输入：
                      </p>
                      <button
                        onClick={() => navigator.clipboard.writeText(pairingCode)}
                        className="mt-3 flex items-center gap-3 rounded-xl bg-white px-4 py-3"
                        aria-label="复制配对码"
                      >
                        <span className="font-mono text-2xl font-semibold tracking-[0.25em]">
                          {pairingCode}
                        </span>
                        <Copy className="h-4 w-4 text-[#8c867d]" />
                      </button>
                      <button
                        onClick={createPairingCode}
                        className="mt-3 text-xs text-[#806142] underline underline-offset-4"
                      >
                        重新生成
                      </button>
                    </>
                  )}
                  {syncStatus && (
                    <p className="mt-3 flex items-center gap-2 text-xs leading-5 text-[#6f685f]">
                      {pairingCode && !syncStatus.startsWith("同步成功") && (
                        <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin" />
                      )}
                      {syncStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-[#aaa39a]">
              <span className="h-px flex-1 bg-black/[0.08]" />
              或使用文件
              <span className="h-px flex-1 bg-black/[0.08]" />
            </div>
            <input ref={fileInput} onChange={importLibrary} type="file" accept=".xml,.csv,text/csv,application/xml" className="hidden" />
            <button onClick={() => fileInput.current?.click()} className="flex w-full items-center justify-between rounded-2xl border border-dashed border-black/20 bg-[#f5f2ec] p-5 text-left hover:border-[#967047]">
              <span className="flex items-center gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white"><Upload className="h-5 w-5" /></span><span><strong className="block text-sm">上传 Apple Music 资料库</strong><span className="mt-1 block text-xs text-[#8c867d]">XML 或 CSV</span></span></span><ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => { setLibrarySongs(demoLibrary); setLibraryName("Yang 的示例资料库"); setShowImport(false); }} className="mt-3 flex w-full items-center gap-4 rounded-2xl border border-black/[0.07] p-5 text-left hover:bg-[#f5f2ec]">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2eee7]"><FileMusic className="h-5 w-5" /></span><span><strong className="block text-sm">继续使用示例资料库</strong><span className="mt-1 block text-xs text-[#8c867d]">16 首带情绪与场景标签的歌曲</span></span>
            </button>
            <div className="mt-5 flex items-center gap-2 text-xs text-[#918b82]"><Headphones className="h-3.5 w-3.5" />Apple Music 直接同步将在验证体验后接入</div>
          </div>
        </div>
      )}
    </main>
  );
}
