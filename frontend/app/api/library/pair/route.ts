import { NextRequest, NextResponse } from "next/server";
import {
  getSyncValue,
  hasPersistentSyncStore,
  setSyncValue,
} from "@/lib/sync-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAIR_TTL_SECONDS = 60 * 60;
const LIBRARY_TTL_SECONDS = 90 * 24 * 60 * 60;

type PairRecord = {
  sessionToken: string;
  createdAt: string;
};

type SyncedLibrary = {
  songs: unknown[];
  songCount: number;
  syncedAt: string;
};

export async function POST() {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const sessionToken = crypto.randomUUID();
  const record: PairRecord = {
    sessionToken,
    createdAt: new Date().toISOString(),
  };

  await setSyncValue(`pair:${code}`, record, PAIR_TTL_SECONDS);
  await setSyncValue(
    `sync:${sessionToken}`,
    { status: "waiting", createdAt: record.createdAt },
    PAIR_TTL_SECONDS,
  );

  return NextResponse.json({
    code,
    sessionToken,
    expiresIn: PAIR_TTL_SECONDS,
    persistent: hasPersistentSyncStore(),
  });
}

export async function GET(request: NextRequest) {
  const sessionToken = request.nextUrl.searchParams.get("token");
  if (!sessionToken || !/^[0-9a-f-]{36}$/i.test(sessionToken)) {
    return NextResponse.json({ error: "无效的同步会话" }, { status: 400 });
  }

  const status = await getSyncValue<Record<string, unknown>>(
    `sync:${sessionToken}`,
  );
  if (!status) {
    return NextResponse.json(
      { status: "expired", error: "配对码已过期，请重新生成" },
      { status: 404 },
    );
  }

  if (status.status !== "complete") return NextResponse.json(status);

  const library = await getSyncValue<SyncedLibrary>(
    `library:${sessionToken}`,
  );
  if (!library) {
    return NextResponse.json(
      { status: "expired", error: "同步资料库已过期" },
      { status: 404 },
    );
  }

  // Refresh the library lifetime whenever its owner retrieves it.
  await setSyncValue(`library:${sessionToken}`, library, LIBRARY_TTL_SECONDS);
  return NextResponse.json({ status: "complete", ...library });
}
