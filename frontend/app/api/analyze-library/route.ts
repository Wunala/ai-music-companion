import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type InputSong = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  year?: number;
};

type SongAnalysis = {
  id: string;
  language: string;
  energy: number;
  tags: string[];
  ai_summary: string;
};

const SYSTEM_PROMPT = `你是个人音乐资料库分析师。根据歌曲元数据和你对歌曲的知识，为每首歌生成适合个人音乐检索的中文标签。

只输出 JSON，格式必须是：
{"analyses":[{"id":"原始ID","language":"语言","energy":0到100的整数,"tags":["4到7个简洁中文标签"],"ai_summary":"一句中文说明，解释适合什么情绪或场景"}]}

标签要覆盖情绪、场景、声音质感和听歌需求，例如：夜晚、通勤、克制、力量、释然、女声、情绪递进。不要虚构歌曲事实；不确定时根据现有元数据保守判断。必须为输入中的每个 id 返回一项。`;

function isValidAnalysis(value: unknown): value is SongAnalysis {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.language === "string" &&
    typeof item.energy === "number" &&
    item.energy >= 0 &&
    item.energy <= 100 &&
    Array.isArray(item.tags) &&
    item.tags.every((tag) => typeof tag === "string") &&
    typeof item.ai_summary === "string"
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
  const songs = body.songs?.slice(0, 40) ?? [];
  if (songs.length === 0) {
    return NextResponse.json({ error: "没有可分析的歌曲" }, { status: 400 });
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
      temperature: 0.2,
      max_tokens: 5000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `请分析以下歌曲：\n${JSON.stringify(songs)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("DeepSeek API error", response.status, detail);
    return NextResponse.json(
      { error: `AI 分析服务暂时不可用（${response.status}）` },
      { status: 502 },
    );
  }

  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = result.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: "AI 没有返回分析结果" }, { status: 502 });
  }

  try {
    const parsed = JSON.parse(content) as { analyses?: unknown[] };
    const analyses = (parsed.analyses ?? []).filter(isValidAnalysis);
    if (analyses.length === 0) throw new Error("No valid analyses");
    return NextResponse.json({ analyses });
  } catch {
    return NextResponse.json({ error: "AI 返回的数据格式无效" }, { status: 502 });
  }
}
