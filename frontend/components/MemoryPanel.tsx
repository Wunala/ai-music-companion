import { Brain, CalendarDays, LockKeyhole, Music2, X } from "lucide-react";
import type { MusicMemory, MusicProfile } from "@/lib/types";

export function MemoryPanel({
  memories,
  profile,
  onClose,
}: {
  memories: MusicMemory[];
  profile: MusicProfile | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm md:p-8">
      <div className="glass mx-auto h-full max-w-4xl overflow-y-auto rounded-3xl p-6 md:p-9">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#a98ee8]">
              Personal Music Memory
            </p>
            <h2 className="mt-2 font-serif text-3xl">你的音乐，不只是收藏</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-[#8d8795] hover:bg-white/5 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-[#b99cff]/15 bg-[#b99cff]/[0.05] p-5">
            <div className="flex items-center gap-2 text-sm text-[#cbb8ff]">
              <Brain className="h-4 w-4" /> 正在形成的音乐人格
            </div>
            <p className="mt-4 leading-7 text-[#d3ced9]">{profile?.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile?.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-[#bbb5c2]">
                  {keyword}
                </span>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <div className="flex items-center gap-2 text-sm text-[#aaa4b2]">
              <LockKeyhole className="h-4 w-4" /> Agent 访问原则
            </div>
            <p className="mt-4 text-sm leading-6 text-[#96909e]">
              其他 Agent 未来只能在你授权后读取抽象偏好。具体事件与原始感受默认保持私密，并留下访问记录。
            </p>
            <p className="mt-3 text-xs text-[#686270]">
              已沉淀 {profile?.memory_count ?? 0} 条用户拥有的记忆
            </p>
          </section>
        </div>

        <h3 className="mt-9 flex items-center gap-2 text-sm text-[#aaa4b2]">
          <CalendarDays className="h-4 w-4" /> 音乐记忆时间线
        </h3>
        <div className="mt-4 space-y-3">
          {memories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-[#77717f]">
              在一首推荐歌曲旁点击爱心，保存第一段感受。
            </div>
          ) : (
            memories.map((memory) => (
              <article key={memory.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Music2 className="h-4 w-4 text-[#b99cff]" />
                      <strong>{memory.song_title}</strong>
                      <span className="text-sm text-[#817b89]">{memory.artist}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#bbb5c2]">“{memory.user_note}”</p>
                    <p className="mt-2 text-xs text-[#67616e]">{memory.context}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#b99cff]/10 px-3 py-1 text-xs text-[#cbb8ff]">
                    {memory.emotion}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
