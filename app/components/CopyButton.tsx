"use client";

import React, { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 900);
  }

  return (
    <button className="btnSecondary" onClick={onCopy} type="button">
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}