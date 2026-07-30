import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

type InputSong = {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
  lastPlayed?: string;
};

type PromptSuggestion = {
  label: string;
  query: string;
};

const SYSTEM_PROMPT = `你是擅长叙事编排的个人音乐策划师。根据用户资料库中的代表性歌曲，生成 4 段值得点击的中文“聆听旅程”。

要求：
1. 每一项都必须描述一段完整的听感弧线，明确从什么氛围开始、如何推进、最终抵达什么状态。
2. 四项必须多样：至少包含一次重新发现旧收藏、一次具体歌手或类型探索、一次场景或情绪需求、一次有趣的随机探索。
3. 只能提到输入中真实出现的歌手、类型或年代，不能编造资料库内容。
4. label 必须包含一个 emoji，随后是 4 到 9 个中文字符，像一段旅程的标题。
5. query 是点击后真正发送给音乐 AI 的完整自然语言需求，必须具体描述首尾与推进方式，建议包含数量（6 到 10 首）。
6. 不要重复同一种意图，也不要使用“猜你喜欢”之类空泛表达。

只输出 JSON：
{"suggestions":[{"label":"💿 找回旧收藏","query":"推荐5首我很久没有播放的收藏"},{"label":"...","query":"..."}]}`;

function validSuggestion(value: unknown): value is PromptSuggestion {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.label === "string" &&
    item.label.length >= 3 &&
    item.label.length <= 20 &&
    typeof item.query === "string" &&
    item.query.length >= 5 &&
    item.query.length <= 100
  );
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY 尚未配置" },
      { status: 503 },
    );
  }

  const body = (await request.json()) as { songs?: InputSong[] };
  const songs = (body.songs ?? [])
    .slice(0, 180)
    .filter(
      (song) =>
        typeof song.title === "string" && typeof song.artist === "string",
    );
  if (songs.length === 0) {
    return NextResponse.json({ error: "资料库为空" }, { status: 400 });
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
      thinking: { type: "disabled" },
      temperature: 0.75,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({ library_sample: songs }),
        },
      ],
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "暂时无法生成资料库建议" },
      { status: 502 },
    );
  }

  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = result.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: "AI 没有返回建议" }, { status: 502 });
  }

  try {
    const parsed = JSON.parse(content) as { suggestions?: unknown[] };
    const suggestions = (parsed.suggestions ?? [])
      .filter(validSuggestion)
      .slice(0, 4);
    if (suggestions.length !== 4) throw new Error("Invalid suggestions");
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ error: "AI 建议格式无效" }, { status: 502 });
  }
}
