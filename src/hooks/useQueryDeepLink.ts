import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PARAM = "query";

/**
 * Syncs the "open query" state with the `?query=<id>` URL search param.
 *
 * - Opening a query pushes `?query=<id>` into the URL (preserving other params).
 * - Closing removes the param via router.replace (no history entry).
 * - On page load / param change, the hook returns the ID so the parent can
 *   auto-open the matching panel once their query list has loaded.
 */
export function useQueryDeepLink() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(
    () => searchParams.get(PARAM) ?? null,
  );

  // Keep local state in sync when the URL param changes externally
  // (e.g. browser back/forward).
  useEffect(() => {
    const fromUrl = searchParams.get(PARAM) ?? null;
    setSelectedQueryId(fromUrl);
  }, [searchParams]);

  const openQuery = useCallback(
    (id: string) => {
      setSelectedQueryId(id);
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set(PARAM, id);
      router.replace(`?${current.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const closeQuery = useCallback(() => {
    setSelectedQueryId(null);
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete(PARAM);
    const qs = current.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname, {
      scroll: false,
    });
  }, [router, searchParams]);

  return { selectedQueryId, openQuery, closeQuery };
}
