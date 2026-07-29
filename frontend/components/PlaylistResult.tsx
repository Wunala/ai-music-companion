import { Disc3, Sparkles } from "lucide-react";
import type { Playlist } from "@/lib/types";
import { SongCard } from "./SongCard";

export function PlaylistResult({
  playlist,
  savedSongs,
  onSave,
}: {
  playlist: Playlist;
  savedSongs: Set<string>;
  onSave: (song: Playlist["songs"][number]) => void;
}) {
  return (
    <section className="fade-up mx-auto mt-12 max-w-5xl pb-24">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#a98ee8]">
            <Sparkles className="h-3.5 w-3.5" />
            Your moment, understood
          </div>
          <h2 className="font-serif text-3xl text-white md:text-4xl">{playlist.title}</h2>
        </div>
        <div className="hidden items-center gap-2 text-sm text-[#817b89] md:flex">
          <Disc3 className="h-4 w-4" />
          {playlist.songs.length} 首歌
        </div>
      </div>

      <div className="glass grid gap-7 rounded-3xl p-6 md:grid-cols-[1.3fr_1fr] md:p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#817b89]">状态理解</p>
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#d4cfdb]">
            {playlist.summary}
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {playlist.emotions.map((emotion) => (
              <div key={emotion.key} className="rounded-xl bg-white/[0.035] p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#aaa4b2]">{emotion.label}</span>
                  <span className="text-[#cbb8ff]">{Math.round(emotion.score * 100)}%</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8062bd] to-[#d6c5ff]"
                    style={{ width: `${emotion.score * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-white/[0.07] md:border-l md:pl-7">
          <p className="text-xs uppercase tracking-[0.18em] text-[#817b89]">音乐方向</p>
          <ul className="mt-4 space-y-3">
            {playlist.directions.map((direction) => (
              <li key={direction} className="flex gap-3 text-sm text-[#c2bdc8]">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#b99cff]" />
                {direction}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {playlist.songs.map((song, index) => (
          <SongCard
            key={`${song.artist}-${song.title}`}
            song={song}
            index={index}
            saved={savedSongs.has(`${song.artist}-${song.title}`)}
            onSave={() => onSave(song)}
          />
        ))}
      </div>
    </section>
  );
}
