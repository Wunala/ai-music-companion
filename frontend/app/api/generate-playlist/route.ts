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
  journey_stage?: string;
};

type ExternalSuggestion = {
  title: string;
  artist: string;
  reason: string;
};

const SYSTEM_PROMPT = `你是个人音乐资料库的歌单策划师。用户会给出一个听歌需求和一份属于他自己的歌曲资料库。

你的任务：
1. 只能从提供的资料库中选择歌曲，绝不能添加不存在的歌。
2. 理解自然语言中的场景、情绪、语言、年代、能量、排除条件和时长要求。
3. 艺人、语言、年代、数量和明确的排除词属于硬条件，不能用不符合的歌曲凑数。
4. 严格遵守用户要求的歌曲数量。如果符合条件的歌曲少于 target_count，就只返回实际符合的数量；绝不能为了凑数放宽条件。未提供数量时选择 6 到 10 首。
5. 你不只是在选歌，也是在编排一段完整的聆听旅程。selections 的顺序就是播放顺序，必须考虑相邻歌曲的能量、速度、情绪、声音质感与叙事衔接。
6. 歌单应有清晰弧线：建立氛围的开场、自然推进、一个情绪转折或高点，以及让体验完整的收束。不要简单按匹配分数、标题、艺人或资料库顺序排列。
7. 每首歌给出针对它在整段旅程中所处位置的具体中文理由，说明它如何承接上一首或带向下一首，不能复用泛化描述。
8. journey_stage 用 2 到 6 个中文字符标记该曲在旅程中的作用，例如“启程”“渐入”“转折”“高点”“余韵”；同一阶段可以覆盖相邻多首歌。
9. score 为 0 到 100 的整数，不同歌曲应有合理差异。
10. 如果资料库没有任何符合硬条件的歌曲，selections 必须是空数组，match_status 为 "no_match"。同时可以在 external_suggestions 中推荐最多 3 首真实存在、但不在资料库中的歌曲。
11. external_suggestions 只能在 selections 为空时返回；这些歌曲必须明确属于用户指定的艺人或条件。
12. 当用户要求“随机、随便、惊喜”时，不要根据输入顺序、标题首字母或艺人首字母选择；应在整份候选资料库中分散挑选，但仍然要编排出完整弧线。

只输出 JSON：
{"title":"歌单名称","summary":"用一句话描述这段旅程的起点、变化和终点","match_status":"matched或no_match","selections":[{"id":"资料库原始ID","reason":"这首歌在此处如何承上启下","journey_stage":"启程","score":88}],"external_suggestions":[{"title":"资料库外歌曲名","artist":"艺人","reason":"为什么可以作为资料库外选择"}]}`;

function validSelection(value: unknown): value is Selection {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.reason === "string" &&
    (item.journey_stage === undefined ||
      typeof item.journey_stage === "string") &&
    typeof item.score === "number" &&
    item.score >= 0 &&
    item.score <= 100
  );
}

function validExternalSuggestion(value: unknown): value is ExternalSuggestion {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.title === "string" &&
    typeof item.artist === "string" &&
    typeof item.reason === "string"
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

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function selectCandidates(query: string, library: LibrarySong[]): LibrarySong[] {
  const normalizedQuery = query.toLocaleLowerCase();
  const randomIntent = /随机|随便|惊喜|盲选|shuffle|random/.test(
    normalizedQuery,
  );

  if (randomIntent) return shuffled(library).slice(0, 500);

  // Keep explicitly named songs or artists, then fill the remaining context
  // with a uniform sample from the entire library instead of its A–Z prefix.
  const explicitMatches = library.filter((song) => {
    const title = song.title.trim().toLocaleLowerCase();
    const artist = song.artist.trim().toLocaleLowerCase();
    return (
      (title.length >= 2 && normalizedQuery.includes(title)) ||
      (artist.length >= 2 && normalizedQuery.includes(artist))
    );
  });
  const matchedIds = new Set(explicitMatches.map((song) => song.id));
  const remaining = library.filter((song) => !matchedIds.has(song.id));
  return [...shuffled(explicitMatches), ...shuffled(remaining)].slice(0, 500);
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
  const library = body.songs?.slice(0, 10000) ?? [];
  if (!query || library.length === 0) {
    return NextResponse.json({ error: "缺少听歌需求或资料库" }, { status: 400 });
  }
  const songs = selectCandidates(query, library);
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
      external_suggestions?: unknown[];
    };
    const validIds = new Set(songs.map((song) => song.id));
    let selections = (parsed.selections ?? [])
      .filter(validSelection)
      .filter((selection) => validIds.has(selection.id));
    if (targetCount !== null) selections = selections.slice(0, targetCount);
    const externalSuggestions =
      selections.length === 0
        ? (parsed.external_suggestions ?? [])
            .filter(validExternalSuggestion)
            .slice(0, 3)
        : [];
    return NextResponse.json({
      title: typeof parsed.title === "string" ? parsed.title : "为你找到的歌",
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      selections,
      match_status: selections.length > 0 ? "matched" : "no_match",
      external_suggestions: externalSuggestions,
    });
  } catch {
    return NextResponse.json({ error: "AI 返回的歌单格式无效" }, { status: 502 });
  }
}
