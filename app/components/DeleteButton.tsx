"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({
  code,
  label = "Delete",
}: {
  code: string;
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    const ok = window.confirm(
      `Delete short link "${code}"?\n\nThis will also delete all click records for it.`
    );
    if (!ok) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/links/${encodeURIComponent(code)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Delete failed (${res.status})`);
      }

      // Refresh the server-rendered dashboard list
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className="btnSecondary" onClick={onDelete} disabled={busy} type="button">
      {busy ? "Deleting…" : label}
    </button>
  );
}