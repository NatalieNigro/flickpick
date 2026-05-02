"use client";

import { useEffect, useState } from "react";

export default function Home() {
  // -----------------------------
  // USER INPUT + CURRENT RESULTS
  // -----------------------------

  const [vibe, setVibe] = useState("");
  const [intro, setIntro] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // FLICKPICK MEMORY
  // -----------------------------

  const [memory, setMemory] = useState([]);

  // Load saved memory and last results when the page opens
  useEffect(() => {
    const savedMemory = localStorage.getItem("flickpickMemory");
    const savedResults = localStorage.getItem("flickpickLastResults");

    if (savedMemory) {
      setMemory(JSON.parse(savedMemory));
    }

    if (savedResults) {
      const parsedResults = JSON.parse(savedResults);
      setIntro(parsedResults.intro || "");
      setMovies(parsedResults.movies || []);
      setVibe(parsedResults.vibe || "");
    }
  }, []);

  // Save updated memory to browser storage
  function saveMemory(newMemory) {
    setMemory(newMemory);
    localStorage.setItem("flickpickMemory", JSON.stringify(newMemory));
  }

  // Save current recommendations so they stay when navigating pages
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

  // -----------------------------
  // MOVIE STATUS HANDLING
  // -----------------------------

  // Adds a movie to memory or updates its existing status
  function setMovieStatus(movie, status) {
    const isSameMovie = (m) =>
      m.title === movie.title && m.year === movie.year;

    const existingMovie = memory.find((m) => isSameMovie(m));

    const updatedMovie = existingMovie
      ? { ...existingMovie, ...movie, status }
      : { ...movie, status };

    const newMemory = [
      ...memory.filter((m) => !isSameMovie(m)),
      updatedMovie,
    ];

    saveMemory(newMemory);
  }

  // -----------------------------
  // AI + OMDB RECOMMENDATION CALL
  // -----------------------------

  async function pickMovie() {
    setLoading(true);
    setIntro("");
    setMovies([]);

    try {
      const res = await fetch("/api/pick", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vibe, memory }),
      });

      const data = await res.json();

      const newIntro = data.intro || "";
      const newMovies = data.movies || [];

      setIntro(newIntro);
      setMovies(newMovies);
      saveLastResults(newIntro, newMovies, vibe);
    } catch (error) {
      setIntro(
        "Something went sideways. FlickPick tripped over the popcorn bucket."
      );
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  // PAGE UI
  // -----------------------------

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
          maxWidth: "1100px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div style={{ fontSize: "48px" }}>🎬</div>

        <h1 style={{ fontSize: "42px", margin: "0 0 10px" }}>
          FlickPick
        </h1>

        <p style={{ fontSize: "18px", marginBottom: "28px", lineHeight: "1.5" }}>
          Tell me your movie mood, and I’ll help pick something worth curling up for.
        </p>

        {/* User movie mood input */}
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

        {/* Main recommendation button */}
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
            boxShadow:
              loading || !vibe.trim()
                ? "none"
                : "0 8px 18px rgba(0,0,0,0.15)",
          }}
        >
          {loading ? "Consulting the popcorn gods..." : "✨ Pick My Flick"}
        </button>

        {/* FlickPick intro message */}
        {intro && (
          <p style={{ marginTop: "32px", fontSize: "18px", lineHeight: "1.5" }}>
            {intro}
          </p>
        )}

        {/* Movie recommendation cards */}
        {movies.length > 0 && (
          <div
            style={{
              marginTop: "24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "22px",
            }}
          >
            {movies.map((movie, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "22px",
                  overflow: "hidden",
                  background: "#fafafa",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
                }}
              >
                {/* Poster image */}
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={`${movie.title} poster`}
                    style={{
                      width: "100%",
                      height: "390px",
                      objectFit: "cover",
                      display: "block",
                      background: "#eee",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: "390px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#eee",
                      color: "#777",
                      padding: "20px",
                      textAlign: "center",
                    }}
                  >
                    Poster unavailable
                  </div>
                )}

                {/* Card text content */}
                <div style={{ padding: "24px" }}>
                  <h2 style={{ marginTop: 0, fontSize: "22px" }}>
                    {movie.title}
                  </h2>

                  <p style={{ color: "#666", marginTop: "-8px" }}>
                    {movie.year}
                  </p>

                  <p style={{ fontSize: "14px", lineHeight: "1.5", color: "#444" }}>
                    <strong>Genre:</strong> {movie.genre}
                  </p>

                  <p style={{ fontSize: "14px", lineHeight: "1.5", color: "#444" }}>
                    <strong>Actors:</strong> {movie.actors}
                  </p>

                  {movie.imdbRating && movie.imdbRating !== "N/A" && (
                    <p style={{ fontSize: "14px", lineHeight: "1.5", color: "#444" }}>
                      <strong>IMDb:</strong> {movie.imdbRating}
                    </p>
                  )}

                  <p style={{ lineHeight: "1.6" }}>
                    {movie.why}
                  </p>

                  {movie.plot && (
                    <p style={{ fontSize: "14px", lineHeight: "1.5", color: "#666" }}>
                      <strong>Plot:</strong> {movie.plot}
                    </p>
                  )}

                  {/* Status buttons */}
                  <div
                    style={{
                      marginTop: "18px",
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
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
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
