"use client";

import { useEffect, useState } from "react";
import MovieGrid from "./components/MovieGrid";
import {
  getMemory,
  saveMemory,
  getLastResults,
  saveLastResults,
} from "./utils/memory";

export default function Home() {
  const [vibe, setVibe] = useState("");
  const [intro, setIntro] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [memory, setMemory] = useState([]);

  useEffect(() => {
    const savedMemory = getMemory();
    const savedResults = getLastResults();

    setMemory(savedMemory);

    if (savedResults) {
      setIntro(savedResults.intro || "");
      setMovies(savedResults.movies || []);
      setVibe(savedResults.vibe || "");
    }
  }, []);

  // This updates BOTH React state and browser storage
  function updateMemory(newMemory) {
    setMemory(newMemory);
    saveMemory(newMemory);
  }

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

    updateMemory(newMemory);
  }

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
      setIntro("Something went sideways. FlickPick tripped over the popcorn bucket.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
  
          @keyframes pulseGlow {
            0% { box-shadow: 0 0 0 rgba(124, 58, 237, 0.25); }
            50% { box-shadow: 0 0 22px rgba(124, 58, 237, 0.65); }
            100% { box-shadow: 0 0 0 rgba(124, 58, 237, 0.25); }
          }
  
          @keyframes popcornBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}
      </style>
    
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
        <div style={{ fontSize: "48px" }}>🎬</div>

        <h1 style={{ fontSize: "42px", margin: "0 0 10px" }}>
          FlickPick
        </h1>

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
              color: "white",
              fontWeight: "600",
          
              // ✨ Animated gradient when loading
              background: loading
                ? "linear-gradient(270deg, #5b21b6, #7c3aed, #5b21b6)"
                : "#111827",
          
              backgroundSize: loading ? "200% 200%" : "auto",
          
              animation: loading
                ? "gradientShift 1.2s linear infinite, pulseGlow 1.4s ease-in-out infinite"
                : "none",
          
              boxShadow:
                loading || !vibe.trim()
                  ? "0 6px 14px rgba(124, 58, 237, 0.25)"
                  : "0 8px 18px rgba(0,0,0,0.15)",
            }}
          >
            {loading ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      animation: "popcornBounce 0.7s ease-in-out infinite",
                      marginRight: "6px",
                    }}
                  >
                    🍿
                  </span>
                  Consulting the popcorn gods...
                </>
              ) : (
                "✨ Pick My Flick"
              )}
          </button>

        {intro && (
          <p style={{ marginTop: "32px", fontSize: "18px", lineHeight: "1.5" }}>
            {intro}
          </p>
        )}

        <MovieGrid
          movies={movies}
          memory={memory}
          setMovieStatus={setMovieStatus}
        />
      </section>
      </main>
  </>
);
}
