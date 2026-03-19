"use client";

import { useState, useRef, useCallback } from "react";

export default function Hub() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const triggerShake = useCallback(() => {
    setError(true);
    const box = boxRef.current;
    if (!box) return;
    box.classList.remove("shake");
    void box.offsetWidth; // reflow
    box.classList.add("shake");
    setTimeout(() => { setError(false); box.classList.remove("shake"); }, 600);
  }, []);

  const submit = useCallback(async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (!res.ok) { triggerShake(); setCode(""); return; }
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      triggerShake();
      setCode("");
    } finally {
      setLoading(false);
    }
  }, [code, loading, triggerShake]);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }}>

      {/* Logo */}
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "linear-gradient(135deg, #d4865a, #e8a07a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, fontWeight: 900, color: "#0c0c0e",
          margin: "0 auto 16px",
        }}>N</div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", color: "#fff" }}>
          NEHORAY
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6, letterSpacing: 2, textTransform: "uppercase" }}>
          Enter access code
        </div>
      </div>

      {/* Input box */}
      <div ref={boxRef} style={{ width: "100%", maxWidth: 360 }}>
        <input
          ref={inputRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="_ _ _ _ _ _"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          style={{
            width: "100%",
            background: error ? "rgba(248,113,113,0.07)" : "rgba(255,255,255,0.05)",
            border: `1.5px solid ${error ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 14,
            padding: "16px 20px",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 8,
            color: "#fff",
            textAlign: "center",
            outline: "none",
            transition: "border-color 0.2s, background 0.2s",
          }}
          onFocus={(e) => {
            if (!error) e.currentTarget.style.borderColor = "rgba(212,134,90,0.6)";
          }}
          onBlur={(e) => {
            if (!error) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }}
        />

        <button
          onClick={submit}
          disabled={loading || !code.trim()}
          style={{
            width: "100%",
            marginTop: 12,
            padding: "14px 0",
            borderRadius: 12,
            background: code.trim() ? "linear-gradient(135deg, #d4865a, #e8a07a)" : "rgba(255,255,255,0.05)",
            color: code.trim() ? "#0c0c0e" : "rgba(255,255,255,0.2)",
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: 1,
            border: "none",
            cursor: code.trim() ? "pointer" : "default",
            transition: "all 0.2s",
          }}
        >
          {loading ? "..." : "ENTER"}
        </button>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 48, fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: 2, textTransform: "uppercase" }}>
        nehoraylevi.com
      </div>
    </div>
  );
}
