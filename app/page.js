"use client";
import { useState } from "react";

export default function Home() {
  const [vibe, setVibe] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function pickMovie() {
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/pick", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vibe }),
      });

      const data = await res.json();
      setResult(data.result || "Hmm... FlickPick got confused. Try again.");
    } catch (error) {
      setResult("Something went sideways. FlickPick tripped over the popcorn bucket.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 24px",
        fontFamily: "Arial, sans-serif",
        background: "linear-gradient(135deg, #fff7ed, #fdf2f8)",
        color: "#222",
      }}
    >
      <section
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "10px" }}>🎬</div>

        <h1 style={{ fontSize: "42px", margin: "0 0 10px" }}>FlickPick</h1>

        <p style={{ fontSize: "18px", lineHeight: "1.5", marginBottom: "28px" }}>
          Tell me your movie mood, and I’ll help pick something worth curling up for.
        </p>

        <textarea
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          placeholder="Cozy, romantic, funny... maybe something with banter, but no emotional devastation tonight."
          rows={4}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "16px",
            borderRadius: "16px",
            border: "1px solid #ddd",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={pickMovie}
          disabled={loading || !vibe.trim()}
          style={{
            marginTop: "18px",
            padding: "14px 24px",
            fontSize: "16px",
            borderRadius: "999px",
            border: "none",
            cursor: loading || !vibe.trim() ? "not-allowed" : "pointer",
            background: loading || !vibe.trim() ? "#ddd" : "#111827",
            color: "white",
          }}
        >
          {loading ? "Consulting the popcorn gods..." : "✨ Pick My Flick"}
        </button>

        {result && (
          <div
            style={{
              marginTop: "34px",
              padding: "24px",
              borderRadius: "18px",
              background: "#fafafa",
              border: "1px solid #eee",
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
              fontSize: "16px",
            }}
          >
            {result}
          </div>
        )}
      </section>
    </main>
  );
}
