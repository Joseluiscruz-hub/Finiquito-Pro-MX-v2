"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CalculationResult, FormState } from "../types/finiquito";
import {
  CASES_STORAGE_KEY,
  removeCase,
  sanitizeCases,
  serializeCases,
  upsertCase,
  type StoredCase,
} from "../lib/cases";

export type CaseStatus = "idle" | "saved" | "error";

type UseCasesReturn = {
  cases: StoredCase[];
  status: CaseStatus;
  saveCase: (form: FormState, result: CalculationResult) => void;
  deleteCase: (id: string) => void;
};

export function useCases(): UseCasesReturn {
  const [cases, setCases] = useState<StoredCase[]>([]);
  const [status, setStatus] = useState<CaseStatus>("idle");
  const statusTimer = useRef<number | null>(null);

  useEffect(() => {
    const restore = () => {
      try {
        const stored = window.localStorage.getItem(CASES_STORAGE_KEY);
        if (stored) setCases(sanitizeCases(JSON.parse(stored)));
      } catch {
        window.localStorage.removeItem(CASES_STORAGE_KEY);
      }
    };

    const restoreTimer = window.setTimeout(restore, 0);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CASES_STORAGE_KEY) restore();
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearTimeout(restoreTimer);
      window.removeEventListener("storage", handleStorage);
      if (statusTimer.current !== null) window.clearTimeout(statusTimer.current);
    };
  }, []);

  const persist = useCallback((next: StoredCase[]) => {
    try {
      window.localStorage.setItem(CASES_STORAGE_KEY, serializeCases(next));
      setStatus("saved");
    } catch {
      setStatus("error");
    }
    if (statusTimer.current !== null) window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => setStatus("idle"), 2400);
  }, []);

  const saveCase = useCallback(
    (form: FormState, result: CalculationResult) => {
      setCases((current) => {
        const next = upsertCase(current, form, result);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const deleteCase = useCallback(
    (id: string) => {
      setCases((current) => {
        const next = removeCase(current, id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return { cases, status, saveCase, deleteCase };
}
