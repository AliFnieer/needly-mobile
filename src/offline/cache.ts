import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QueryClient } from '@tanstack/react-query';

const STORAGE_KEY = 'needly:offline-cache:v1';
const WRITE_DEBOUNCE_MS = 500;

// Query keys worth persisting for offline reads. Matched by leading segments.
const PERSIST_PREFIXES: string[] = [
  'shopping:lists',
  'shopping:list',
  'households',
  'households:sync',
  'categories:list',
  'notifications:household',
  'history:household',
];

type CachedQuery = {
  key: unknown;
  data: unknown;
  dataUpdatedAt: number;
};

// Tracks timestamps hydrated from disk so we don't immediately rewrite them.
const hydratedUpdatedAt = new Map<string, number>();

function keyToSegment(key: unknown): string {
  if (!Array.isArray(key)) return '';
  return key
    .slice(0, 3)
    .map((part) => (typeof part === 'string' || typeof part === 'number' ? String(part) : ''))
    .join(':');
}

export function isPersistableQuery(key: unknown): boolean {
  const segment = keyToSegment(key);
  return PERSIST_PREFIXES.some((prefix) => segment === prefix || segment.startsWith(`${prefix}:`));
}

async function readEntries(): Promise<CachedQuery[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let pendingEntries: CachedQuery[] | null = null;

function scheduleWrite(entries: CachedQuery[]): void {
  pendingEntries = entries;
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    const snapshot = pendingEntries;
    pendingEntries = null;
    if (!snapshot) return;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)).catch(() => {});
  }, WRITE_DEBOUNCE_MS);
}

export function attachCachePersister(queryClient: QueryClient): () => void {
  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== 'added' && event.type !== 'updated') return;
    const { query } = event;
    if (query.state.status !== 'success') return;
    if (!isPersistableQuery(query.queryKey)) return;
    const segment = keyToSegment(query.queryKey);
    if (query.state.dataUpdatedAt === hydratedUpdatedAt.get(segment)) return;

    void readEntries().then((entries) => {
      if (query.state.status !== 'success') return;
      const next = entries.filter(
        (entry) => keyToSegment(entry.key) !== segment || entry.dataUpdatedAt !== query.state.dataUpdatedAt,
      );
      next.push({
        key: query.queryKey,
        data: query.state.data,
        dataUpdatedAt: query.state.dataUpdatedAt ?? 0,
      });
      scheduleWrite(next);
    });
  });
  return unsubscribe;
}

export async function hydrateQueryCache(queryClient: QueryClient): Promise<void> {
  const entries = await readEntries();
  for (const entry of entries) {
    if (!isPersistableQuery(entry.key)) continue;
    queryClient.setQueryData(entry.key as unknown[], entry.data, { updatedAt: entry.dataUpdatedAt });
    hydratedUpdatedAt.set(keyToSegment(entry.key), entry.dataUpdatedAt);
  }
}