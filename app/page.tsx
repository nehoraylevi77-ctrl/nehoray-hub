"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface App {
  id: string;
  name: string;
  icon: string;
}

export default function Desktop() {
  const [apps, setApps] = useState<App[]>([]);
  const [selected, setSelected] = useState<App | null>(null);
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [time, setTime] = useState("");
  const [bootLine, setBootLine] = useState("> scanning filesystem...");
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/apps")
      .then((r) => r.json())
      .then((data) => {
        setApps(data);
        setBootLine(`> ${data.length} application(s) found. select to authenticate.`);
      })
      .catch(() => setBootLine("> error: failed to load applications."));
  }, []);

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const openApp = (app: App) => {
    setSelected(app);
    setPasscode("");
    setError(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeModal = useCallback(() => {
    setSelected(null);
    setPasscode("");
    setError(false);
  }, []);

  const submit = useCallback(async () => {
    if (!passcode.trim() || loading || !selected) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app: selected.id, passcode: passcode.trim() }),
      });
      if (!res.ok) {
        setError(true);
        setPasscode("");
        if (modalRef.current) {
          modalRef.current.classList.remove("shake");
          void modalRef.current.offsetWidth;
          modalRef.current.classList.add("shake");
          setTimeout(() => modalRef.current?.classList.remove("shake"), 600);
        }
        return;
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setError(true);
      setPasscode("");
    } finally {
      setLoading(false);
    }
  }, [passcode, loading, selected]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeModal]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#050a05",
        color: "#00ff41",
        fontFamily: "'Courier New', Courier, monospace",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 9999,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
        }}
      />

      {/* Top status bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 24px",
          borderBottom: "1px solid rgba(0,255,65,0.15)",
          background: "rgba(0,0,0,0.5)",
          fontSize: 11,
          letterSpacing: 1,
        }}
      >
        <span style={{ color: "#00ff41" }}>
          root@nehoray-hub:~$<span className="cursor">▌</span>
        </span>
        <span style={{ color: "rgba(0,255,65,0.4)" }}>
          NEHORAY SYSTEMS v1.0
        </span>
        <span style={{ color: "rgba(0,255,65,0.6)" }}>{time}</span>
      </div>

      {/* Desktop area */}
      <div style={{ padding: "32px 48px", height: "calc(100vh - 74px)", overflowY: "auto" }}>
        <div
          style={{
            fontSize: 11,
            color: "rgba(0,255,65,0.35)",
            marginBottom: 28,
            letterSpacing: 1,
          }}
        >
          {bootLine}
        </div>

        {/* App icons grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => openApp(app)}
              style={{
                background: "rgba(0,255,65,0.03)",
                border: "1px solid rgba(0,255,65,0.18)",
                borderRadius: 6,
                width: 110,
                padding: "22px 12px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                transition: "all 0.15s",
                color: "#00ff41",
                fontFamily: "'Courier New', Courier, monospace",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = "rgba(0,255,65,0.07)";
                el.style.borderColor = "rgba(0,255,65,0.45)";
                el.style.boxShadow = "0 0 14px rgba(0,255,65,0.12)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = "rgba(0,255,65,0.03)";
                el.style.borderColor = "rgba(0,255,65,0.18)";
                el.style.boxShadow = "none";
              }}
            >
              <span style={{ fontSize: 34, lineHeight: 1 }}>{app.icon}</span>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: "rgba(0,255,65,0.75)",
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                {app.name}
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: "rgba(0,255,65,0.3)",
                  letterSpacing: 1,
                  border: "1px solid rgba(0,255,65,0.15)",
                  padding: "2px 6px",
                  borderRadius: 3,
                }}
              >
                LOCKED
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "7px 24px",
          borderTop: "1px solid rgba(0,255,65,0.1)",
          background: "rgba(0,0,0,0.6)",
          fontSize: 10,
          color: "rgba(0,255,65,0.22)",
          letterSpacing: 1,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>NEHORAY-HUB // SECURE TERMINAL</span>
        <span>ENC: AES-256 // STATUS: ONLINE</span>
      </div>

      {/* Auth modal */}
      {selected && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            ref={modalRef}
            style={{
              background: "#060c06",
              border: "1px solid rgba(0,255,65,0.28)",
              borderRadius: 6,
              width: 480,
              maxWidth: "92vw",
              boxShadow:
                "0 0 40px rgba(0,255,65,0.08), 0 0 80px rgba(0,0,0,0.8)",
              overflow: "hidden",
            }}
          >
            {/* Terminal title bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                background: "rgba(0,255,65,0.04)",
                borderBottom: "1px solid rgba(0,255,65,0.12)",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#ff5f56",
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#ffbd2e",
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#27c93f",
                }}
              />
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 10,
                  color: "rgba(0,255,65,0.45)",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                secure-shell — auth
              </span>
            </div>

            {/* Terminal body */}
            <div style={{ padding: "24px 24px 20px", fontSize: 13 }}>
              <div style={{ color: "rgba(0,255,65,0.35)", marginBottom: 6 }}>
                $ ./authenticate --app {selected.id}
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: "rgba(0,255,65,0.45)" }}>&gt; </span>
                <span style={{ color: "rgba(0,255,65,0.6)" }}>
                  loading module:{" "}
                </span>
                <span style={{ color: "#00ff41" }}>
                  {selected.icon} {selected.name}
                </span>
              </div>
              <div
                style={{ marginBottom: 20, color: "rgba(0,255,65,0.35)" }}
              >
                &gt; awaiting authentication...
              </div>

              {error && (
                <div
                  style={{
                    color: "#ff4444",
                    marginBottom: 14,
                    fontSize: 12,
                    letterSpacing: 1,
                  }}
                >
                  ✗ ACCESS DENIED — invalid passcode
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    color: "rgba(0,255,65,0.55)",
                    flexShrink: 0,
                    fontSize: 13,
                  }}
                >
                  passcode:
                </span>
                <input
                  ref={inputRef}
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                    if (e.key === "Escape") closeModal();
                  }}
                  autoComplete="off"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    borderBottom: `1px solid ${
                      error ? "rgba(255,68,68,0.5)" : "rgba(0,255,65,0.25)"
                    }`,
                    color: "#00ff41",
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: 15,
                    padding: "4px 0",
                    outline: "none",
                    caretColor: "#00ff41",
                    letterSpacing: 4,
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 22,
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={closeModal}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(0,255,65,0.18)",
                    color: "rgba(0,255,65,0.45)",
                    padding: "8px 16px",
                    borderRadius: 3,
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: 11,
                    letterSpacing: 1,
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  [esc] cancel
                </button>
                <button
                  onClick={submit}
                  disabled={!passcode.trim() || loading}
                  style={{
                    background:
                      passcode.trim() && !loading
                        ? "rgba(0,255,65,0.08)"
                        : "transparent",
                    border: `1px solid ${
                      passcode.trim() && !loading
                        ? "rgba(0,255,65,0.4)"
                        : "rgba(0,255,65,0.1)"
                    }`,
                    color:
                      passcode.trim() && !loading
                        ? "#00ff41"
                        : "rgba(0,255,65,0.22)",
                    padding: "8px 20px",
                    borderRadius: 3,
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: 11,
                    letterSpacing: 2,
                    cursor:
                      passcode.trim() && !loading ? "pointer" : "default",
                    textTransform: "uppercase",
                    transition: "all 0.15s",
                  }}
                >
                  {loading ? "authenticating..." : "[enter] authenticate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
