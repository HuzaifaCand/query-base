"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Lightweight hook that caches the current Supabase user ID on mount.
 * Useful for ownership checks without redundant getUser() calls.
 */
export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  return userId;
}
