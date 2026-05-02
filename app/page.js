"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [vibe, setVibe] = useState("");
  const [intro, setIntro] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  // New memory format:
  // one list of movies, each with a status
  const [memory, setMemory] = useState([]);

  useEffect(() => {
    const savedMemory = localStorage.getItem("flickpickMemory");
    const oldPreferences = localStorage.getItem("flickpickPreferences");
    const savedResults = localStorage.getItem("flickpickLastResults");

    // Load new memory format if it exists
    if (savedMemory) {
      setMemory(JSON.parse(savedMemory));
    }

    // Migrate old Loved and Hard Pass memory if needed
    if (!savedMemory && oldPreferences) {
      const parsed = JSON.parse(oldPreferences);

      const migratedMemory = [
        ...(parsed.loved || []).map((movie) => ({ ...movie, status: "loved" })),
        ...(parsed.hardPass || []).map((movie) => ({ ...movie, status: "hardPass" })),
      ];

      setMemory(migratedMemory);
      localStorage.setItem("flickpickMemory", JSON.stringify(migratedMemory));
    }

    // Reload last recommendations when returning to home page
    if (savedResults) {
      const parsedResults = JSON.parse(savedResults);
      setIntro(parsedResults.intro || "");
      setMovies(parsedResults.movies || []);
      setVibe(parsedResults.vibe || "");
    }
  }, []);

  function saveMemory(newMemory) {
    setMemory(newMemory);
    localStorage.setItem("flickpickMemory", JSON.stringify(newMemory));
  }

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

  // Adds or updates a movie's status
  function setMovieStatus(movie, status) {
    const isSameMovie = (m) => m.title === movie.title && m.year === movie.year;

    const existingMovie = memory.find((m) => isSameMovie(m));

    let updatedMovie;

    if (existingMovie) {
      updatedMovie = { ...existingMovie, ...movie, status };
    } else {
      updatedMovie = { ...movie, status };
    }

    const newMemory = [
      ...memory.filter((m) => !isSameMovie(m)),
      updatedMovie,
    ];

    saveMemory(newMemory);
  }

  async function pickMovie() {
    setLoading(true);
    setIntro("");
    setMovies([]);

    try {
      const res = await fetch("/api/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe, memory }),
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
                  minHeight: "300px",
                }}
              >
                <h2 style={{ marginTop: 0, fontSize: "22px" }}>{movie.title}</h2>

                <p style={{ color: "#666", marginTop: "-8px" }}>{movie.year}</p>

                <p style={{ lineHeight: "1.6" }}>{movie.why}</p>

                <div style={{ marginTop: "18px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button onClick={() => setMovieStatus(movie, "wantToWatch")}>
                    🎯 Want to Watch
                  </button>

                  <button onClick={() => setMovieStatus(movie, "notInterested")}>
                    🚫 Not Interested
                  </button>

                  <button onClick={() => setMovieStatus(movie, "loved")}>
                    ❤️ Loved
                  </button>

                  <button onClick={() => setMovieStatus(movie, "meh")}>
                    😐 Meh
                  </button>

                  <button onClick={() => setMovieStatus(movie, "hardPass")}>
                    ❌ Hard Pass
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
