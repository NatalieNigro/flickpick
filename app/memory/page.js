"use client";

import { useEffect, useState } from "react";

export default function MemoryPage() {
  // Saved user movie memory
  const [preferences, setPreferences] = useState({
    loved: [],
    hardPass: [],
  });

  // Load memory when page opens
  useEffect(() => {
    const saved = localStorage.getItem("flickpickPreferences");

    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  // Save memory to browser
  function savePreferences(newPreferences) {
    setPreferences(newPreferences);
    localStorage.setItem("flickpickPreferences", JSON.stringify(newPreferences));
  }

  // Move a movie between Loved and Hard Pass
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

  // Remove a movie from memory entirely
  function clearRating(movie) {
    const isSameMovie = (m) => m.title === movie.title && m.year === movie.year;

    const newPreferences = {
      loved: preferences.loved.filter((m) => !isSameMovie(m)),
      hardPass: preferences.hardPass.filter((m) => !isSameMovie(m)),
    };

    savePreferences(newPreferences);
  }

  // Reusable movie row
  function MovieMemoryItem({ movie, actionLabel, actionType }) {
    return (
      <div
        style={{
          padding: "14px",
          borderRadius: "14px",
          background: "white",
          border: "1px solid #eee",
          marginBottom: "12px",
        }}
      >
        <div style={{ fontWeight: "700", marginBottom: "10px" }}>
          {movie.title} <span style={{ color: "#666", fontWeight: "400" }}>({movie.year})</span>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={() => giveFeedback(movie, actionType)}>
            {actionLabel}
          </button>

          <button onClick={() => clearRating(movie)}>
            Clear
          </button>
        </div>
      </div>
    );
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
        <h1 style={{ fontSize: "38px", marginTop: 0 }}>FlickPick Memory</h1>

        <p style={{ fontSize: "17px", lineHeight: "1.5", marginBottom: "30px" }}>
          This is where FlickPick keeps track of your movie opinions, including the ones
          that may need a sober second thought.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          <div
            style={{
              padding: "24px",
              borderRadius: "20px",
              background: "#fafafa",
              border: "1px solid #eee",
            }}
          >
            <h2 style={{ marginTop: 0 }}>👍 Loved</h2>

            {preferences.loved.length === 0 ? (
              <p>None yet</p>
            ) : (
              preferences.loved.map((movie, index) => (
                <MovieMemoryItem
                  key={`loved-${index}`}
                  movie={movie}
                  actionLabel="Move to Hard Pass"
                  actionType="hardPass"
                />
              ))
            )}
          </div>

          <div
            style={{
              padding: "24px",
              borderRadius: "20px",
              background: "#fafafa",
              border: "1px solid #eee",
            }}
          >
            <h2 style={{ marginTop: 0 }}>👎 Hard Pass</h2>

            {preferences.hardPass.length === 0 ? (
              <p>None yet</p>
            ) : (
              preferences.hardPass.map((movie, index) => (
                <MovieMemoryItem
                  key={`hardpass-${index}`}
                  movie={movie}
                  actionLabel="Move to Loved"
                  actionType="love"
                />
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
