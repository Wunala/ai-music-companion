import { BookmarkCheck, Heart, MoreHorizontal, Play } from "lucide-react";
import type { SongRecommendation } from "@/lib/types";

export function SongCard({
  song,
  index,
  saved,
  onSave,
}: {
  song: SongRecommendation;
  index: number;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <article className="group grid grid-cols-[40px_1fr_auto] gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:border-white/[0.14] hover:bg-white/[0.045]">
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.07] text-white transition group-hover:bg-[#b99cff] group-hover:text-[#17111f]"
        aria-label={`播放 ${song.title}`}
      >
        <span className="text-sm group-hover:hidden">{index + 1}</span>
        <Play className="hidden h-4 w-4 fill-current group-hover:block" />
      </button>
      <div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h3 className="font-medium text-white">{song.title}</h3>
          <span className="text-sm text-[#8e8998]">{song.artist}</span>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b4aebe]">
          {song.reason}
        </p>
        <span className="mt-3 inline-block rounded-full bg-[#b99cff]/10 px-2.5 py-1 text-xs text-[#cbb8ff]">
          {song.mood}
        </span>
      </div>
      <div className="flex gap-1 text-[#77717f]">
        <button
          onClick={onSave}
          className="h-8 p-2 hover:text-white"
          aria-label={saved ? "已保存到记忆" : "保存为记忆"}
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4 text-[#b99cff]" />
          ) : (
            <Heart className="h-4 w-4" />
          )}
        </button>
        <button className="h-8 p-2 hover:text-white" aria-label="更多">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
