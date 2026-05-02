"use client";
import { useState } from "react";

export default function Home() {
  const [vibe, setVibe] = useState("");
  const [result, setResult] = useState("");

  async function pickMovie() {
    setResult("Thinking... 🍿");

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
    }
  }

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>🎬 FlickPick</h1>
      <p>Tell me your vibe, and I’ll pick your movie for tonight.</p>

      <input
        value={vibe}
        onChange={(e) => setVibe(e.target.value)}
        placeholder="Cozy, romantic, funny..."
        style={{ padding: "10px", width: "300px", marginTop: "20px" }}
      />

      <br /><br />

      <button onClick={pickMovie} style={{ padding: "10px 20px" }}>
        ✨ Pick My Flick
      </button>

      <div style={{ marginTop: "30px", whiteSpace: "pre-wrap" }}>
        {result}
      </div>
    </main>
  );
}
