"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { buildSessionsPath } from "../query";
import type { SessionsQuery } from "../types";

export function useSessionsNavigation() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(query: SessionsQuery) {
    startTransition(() => {
      router.push(buildSessionsPath(query), { scroll: false });
    });
  }

  return { isPending, navigate };
}
