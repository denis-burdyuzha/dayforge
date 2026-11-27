/**
 * Lazy tier assets: the polygon data of every (creature, tier) is its own chunk, loaded by a dynamic import
 * only when that creature and tier is shown. The store caches the result by key (a fallback tier shares the key
 * of the tier whose SVG it uses), so a tier is fetched once; `peekTier` reads it synchronously.
 */
import { useEffect, useState } from "react";

export interface TierRequest<D, M> {
  /** cache key of the data (creature + source tier) */
  key: string;
  /** static tier metadata (fit, counts …) — available before the data is loaded */
  meta: M;
  load: () => Promise<D>;
}

const loaded = new Map<string, unknown>();
const pending = new Map<string, Promise<unknown>>();

export function peekTier<D>(key: string): D | undefined {
  return loaded.get(key) as D | undefined;
}

export function loadTier<D>(key: string, load: () => Promise<D>): Promise<D> {
  const hit = loaded.get(key);
  if (hit !== undefined) return Promise.resolve(hit as D);
  let promise = pending.get(key) as Promise<D> | undefined;
  if (!promise) {
    promise = load().then(
      (data) => {
        loaded.set(key, data);
        pending.delete(key);
        return data;
      },
      (error: unknown) => {
        pending.delete(key); // a failed chunk may be retried
        throw error;
      },
    );
    pending.set(key, promise);
  }
  return promise;
}

/** idle-time background load (does not compete with what is on screen) */
function preloadWhenIdle(request: TierRequest<unknown, unknown>) {
  const run = () => void loadTier(request.key, request.load).catch(() => undefined);
  if (typeof requestIdleCallback === "function") requestIdleCallback(run, { timeout: 2000 });
  else setTimeout(run, 200);
}

export interface ShownTier<D, M> {
  meta: M;
  data: D;
}

/**
 * The tier to draw. Until the requested tier is loaded the PREVIOUS one stays on screen (no flicker on a tier
 * change); the very first load shows nothing (the caller draws the empty canvas with its shadow). After the
 * requested tier is shown, `next` is preloaded in the background.
 */
export function useLoadedTier<D, M>(
  request: TierRequest<D, M>,
  next?: TierRequest<D, M> | null,
): ShownTier<D, M> | null {
  const cached = peekTier<D>(request.key);
  const [last, setLast] = useState<ShownTier<D, M> | null>(
    cached !== undefined ? { meta: request.meta, data: cached } : null,
  );

  useEffect(() => {
    let cancelled = false;
    loadTier(request.key, request.load)
      .then((data) => {
        if (!cancelled) setLast({ meta: request.meta, data });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // the request object is rebuilt on every render; its key identifies it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.key]);

  const shown: ShownTier<D, M> | null =
    cached !== undefined ? { meta: request.meta, data: cached } : last;

  const nextKey = next?.key;
  const requestedShown = cached !== undefined;
  useEffect(() => {
    if (requestedShown && next && next.key !== request.key) preloadWhenIdle(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedShown, nextKey, request.key]);

  return shown;
}
