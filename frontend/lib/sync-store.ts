type StoredValue = {
  value: string;
  expiresAt: number;
};

const memoryStore = globalThis as typeof globalThis & {
  __musicCompanionSyncStore?: Map<string, StoredValue>;
};

function getMemoryStore() {
  memoryStore.__musicCompanionSyncStore ??= new Map<string, StoredValue>();
  return memoryStore.__musicCompanionSyncStore;
}

function redisConfig() {
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function redisCommand(command: Array<string | number>) {
  const config = redisConfig();
  if (!config) return null;

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Sync storage request failed (${response.status})`);
  }
  return (await response.json()) as { result?: unknown };
}

export async function setSyncValue(
  key: string,
  value: unknown,
  ttlSeconds: number,
) {
  const serialized = JSON.stringify(value);
  const result = await redisCommand(["SET", key, serialized, "EX", ttlSeconds]);
  if (result) return;

  getMemoryStore().set(key, {
    value: serialized,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function getSyncValue<T>(key: string): Promise<T | null> {
  const result = await redisCommand(["GET", key]);
  if (result) {
    if (typeof result.result !== "string") return null;
    return JSON.parse(result.result) as T;
  }

  const stored = getMemoryStore().get(key);
  if (!stored) return null;
  if (stored.expiresAt < Date.now()) {
    getMemoryStore().delete(key);
    return null;
  }
  return JSON.parse(stored.value) as T;
}

export async function deleteSyncValue(key: string) {
  const result = await redisCommand(["DEL", key]);
  if (result) return;
  getMemoryStore().delete(key);
}

export function hasPersistentSyncStore() {
  return Boolean(redisConfig());
}
