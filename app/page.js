"use client";

import { useEffect, useState } from "react";

export default function Home() {
  // User input
  const [vibe, setVibe] = useState("");

  // Current AI results
  const [intro, setIntro] = useState("");
  const [movies, setMovies] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Saved user movie memory
  const [preferences, setPreferences] = useState({
    loved: [],
    hardPass: [],
  });

  // Load saved memory and last recommendations when page opens
  useEffect(() => {
    const savedPreferences = localStorage.getItem("flickpickPreferences");
    const savedResults = localStorage.getItem("flickpickLastResults");

    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }

    if (savedResults) {
      const parsedResults = JSON.parse(savedResults);
      setIntro(parsedResults.intro || "");
      setMovies(parsedResults.movies || []);
      setVibe(parsedResults.vibe || "");
    }
  }, []);

  // Save memory to browser
  function savePreferences(newPreferences) {
    setPreferences(newPreferences);
    localStorage.setItem("flickpickPreferences", JSON.stringify(newPreferences));
  }

  // Save current recommendations so they stay when user navigates away/back
  function saveLastResults(newIntro, newMovies, currentVibe) {
    localStorage.setItem(
      "flickpickLastResults",
      JSON.stringify({
        intro: newIntro,
        movies: newMovies,
        vibe: currentVibe,
      })
    );
  }

  // Love or Hard Pass a movie
  function giveFeedback(movie, type) {
    const isSameMovie = (m) => m.title === movie.title && m.year === movie.year;

    const newPreferences = {
      loved: preferences.loved.filter((m) => !isSameMovie(m)),
      hardPass: preferences.hardPass.filter((m) => !isSameMovie(m)),
    };

    if (type === "love") {
      newPreferences.loved.push(movie);
    }

    if (type === "hardPass") {
      newPreferences.hardPass.push(movie);
    }

    savePreferences(newPreferences);
  }

  // Ask AI for movie recommendations
  async function pickMovie() {
    setLoading(true);
    setIntro("");
    setMovies([]);

    try {
      const res = await fetch("/api/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe, preferences }),
      });

      const data = await res.json();

      const newIntro = data.intro || "";
      const newMovies = data.movies || [];

      setIntro(newIntro);
      setMovies(newMovies);
      saveLastResults(newIntro, newMovies, vibe);
    } catch (error) {
      setIntro("Something went sideways. FlickPick tripped over the popcorn bucket.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 24px",
        background: "linear-gradient(135deg, #f5f0ff, #faf7ff)",
        color: "#222",
      }}
    >
      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ fontSize: "48px" }}>🎬</div>

        <h1 style={{ fontSize: "42px", margin: "0 0 10px" }}>FlickPick</h1>

        <p style={{ fontSize: "18px", marginBottom: "28px", lineHeight: "1.5" }}>
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
            boxShadow: loading || !vibe.trim() ? "none" : "0 8px 18px rgba(0,0,0,0.15)",
          }}
        >
          {loading ? "Consulting the popcorn gods..." : "✨ Pick My Flick"}
        </button>

        {intro && (
          <p style={{ marginTop: "32px", fontSize: "18px", lineHeight: "1.5" }}>
            {intro}
          </p>
        )}

        {movies.length > 0 && (
          <div
            style={{
              marginTop: "24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            {movies.map((movie, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "22px",
                  padding: "24px",
                  background: "#fafafa",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
                  minHeight: "280px",
                }}
              >
                <h2 style={{ marginTop: 0, fontSize: "22px" }}>{movie.title}</h2>
                <p style={{ color: "#666", marginTop: "-8px" }}>{movie.year}</p>
                <p style={{ lineHeight: "1.6" }}>{movie.why}</p>

                <div style={{ marginTop: "18px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button onClick={() => giveFeedback(movie, "love")}>
                    👍 Love this
                  </button>

                  <button onClick={() => giveFeedback(movie, "hardPass")}>
                    👎 Hard pass
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
