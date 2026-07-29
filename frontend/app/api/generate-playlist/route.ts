import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type LibrarySong = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  year?: number;
  energy?: number;
  tags?: string[];
  language?: string;
  aiSummary?: string;
  lastPlayed?: string;
};

type Selection = {
  id: string;
  reason: string;
  score: number;
};

const SYSTEM_PROMPT = `你是个人音乐资料库的歌单策划师。用户会给出一个听歌需求和一份属于他自己的歌曲资料库。

你的任务：
1. 只能从提供的资料库中选择歌曲，绝不能添加不存在的歌。
2. 理解自然语言中的场景、情绪、语言、年代、能量、排除条件和时长要求。
3. 严格遵守用户要求的歌曲数量。如果请求中提供了 target_count，必须恰好选择该数量；未提供时选择最合适的 6 到 12 首。
4. 每首歌给出针对本次需求的具体中文理由，不能复用泛化描述。
5. score 为 0 到 100 的整数，不同歌曲应有合理差异。

只输出 JSON：
{"title":"歌单名称","summary":"如何理解这次需求","selections":[{"id":"资料库原始ID","reason":"针对需求的推荐原因","score":88}]}`;

function validSelection(value: unknown): value is Selection {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.reason === "string" &&
    typeof item.score === "number" &&
    item.score >= 0 &&
    item.score <= 100
  );
}

function extractRequestedCount(query: string): number | null {
  const arabicMatch = query.match(/(\d{1,2})\s*首/);
  if (arabicMatch) return Math.min(30, Math.max(1, Number(arabicMatch[1])));

  const chineseNumbers: Record<string, number> = {
    一: 1,
    两: 2,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
    十一: 11,
    十二: 12,
    十三: 13,
    十四: 14,
    十五: 15,
    二十: 20,
  };
  const chineseMatch = query.match(
    /(二十|十五|十四|十三|十二|十一|十|一|两|二|三|四|五|六|七|八|九)\s*首/,
  );
  return chineseMatch ? chineseNumbers[chineseMatch[1]] : null;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY 尚未配置" },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    query?: string;
    songs?: LibrarySong[];
  };
  const query = body.query?.trim();
  const songs = body.songs?.slice(0, 500) ?? [];
  if (!query || songs.length === 0) {
    return NextResponse.json({ error: "缺少听歌需求或资料库" }, { status: 400 });
  }
  const targetCount = extractRequestedCount(query);

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
      thinking: { type: "disabled" },
      temperature: 0.35,
      max_tokens: 3500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            request: query,
            target_count: targetCount,
            library: songs,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("DeepSeek playlist error", response.status, detail);
    return NextResponse.json(
      { error: `AI 歌单服务暂时不可用（${response.status}）` },
      { status: 502 },
    );
  }

  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = result.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: "AI 没有返回歌单" }, { status: 502 });
  }

  try {
    const parsed = JSON.parse(content) as {
      title?: unknown;
      summary?: unknown;
      selections?: unknown[];
    };
    const validIds = new Set(songs.map((song) => song.id));
    let selections = (parsed.selections ?? [])
      .filter(validSelection)
      .filter((selection) => validIds.has(selection.id));
    if (targetCount !== null) selections = selections.slice(0, targetCount);
    if (selections.length === 0) throw new Error("No valid selections");
    return NextResponse.json({
      title: typeof parsed.title === "string" ? parsed.title : "为你找到的歌",
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      selections,
    });
  } catch {
    return NextResponse.json({ error: "AI 返回的歌单格式无效" }, { status: 502 });
  }
}
