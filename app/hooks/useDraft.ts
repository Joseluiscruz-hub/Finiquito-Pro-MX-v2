"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormState } from "../types/finiquito";
import { DRAFT_STORAGE_KEY, initialForm } from "../lib/constants";
import { sanitizeDraft, serializeDraft } from "../lib/draft";

export type DraftStatus = "idle" | "saved" | "error";

type UseDraftReturn = {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  saveDraft: () => void;
  resetForm: () => void;
  status: DraftStatus;
};

/**
 * Gestiona el estado del formulario con persistencia opcional en localStorage.
 *
 * El borrador se restaura en un `useEffect` (no en el initializer de useState)
 * para ser seguro con SSR: el servidor siempre renderiza con `initialForm` y
 * el cliente hidrata sin discrepancias antes de aplicar el borrador guardado.
 */
export function useDraft(): UseDraftReturn {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<DraftStatus>("idle");
  const statusTimer = useRef<number | null>(null);

  useEffect(() => {
    const restore = () => {
      try {
        const stored = window.localStorage.getItem(DRAFT_STORAGE_KEY);
        if (stored) setForm(sanitizeDraft(JSON.parse(stored)));
      } catch {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    };

    // Se difiere un turno para mantener idéntico el primer render de servidor y cliente.
    const restoreTimer = window.setTimeout(restore, 0);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === DRAFT_STORAGE_KEY) restore();
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearTimeout(restoreTimer);
      window.removeEventListener("storage", handleStorage);
      if (statusTimer.current !== null) window.clearTimeout(statusTimer.current);
    };
  }, []);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setStatus("idle");
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const saveDraft = useCallback(() => {
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, serializeDraft(form));
      setStatus("saved");
    } catch {
      setStatus("error");
    }

    if (statusTimer.current !== null) window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => setStatus("idle"), 2400);
  }, [form]);

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setStatus("idle");
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Restablecer el formulario no debe fallar si el almacenamiento está bloqueado.
    }
  }, []);

  return { form, update, saveDraft, resetForm, status };
}
