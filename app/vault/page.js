"use client";

import { useEffect, useState } from "react";
import { getMemory, saveMemory } from "../utils/memory";

export default function VaultPage() {
  const [memory, setMemory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAZ, setSortAZ] = useState(true);

  const statuses = [
    { key: "wantToWatch", label: "🎯 Want to Watch" },
    { key: "notInterested", label: "🚫 Not Interested" },
    { key: "hardPass", label: "❌ Hard Pass" },
    { key: "meh", label: "😐 Meh" },
    { key: "loved", label: "❤️ Loved" },
  ];

  useEffect(() => {
    setMemory(getMemory());
  }, []);

  function updateMemory(newMemory) {
    setMemory(newMemory);
    saveMemory(newMemory);
  }

  function updateStatus(movie, newStatus) {
    const isSameMovie = (m) => m.title === movie.title && m.year === movie.year;

    const newMemory = memory.map((m) =>
      isSameMovie(m) ? { ...m, status: newStatus } : m
    );

    updateMemory(newMemory);
  }

  function clearMovie(movie) {
    const isSameMovie = (m) => m.title === movie.title && m.year === movie.year;

    const newMemory = memory.filter((m) => !isSameMovie(m));

    updateMemory(newMemory);
  }

  function getFilteredAndSortedMovies(statusKey) {
    return memory
      .filter((movie) => movie.status === statusKey)
      .filter((movie) =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortAZ) {
          return a.title.localeCompare(b.title);
        }

        return b.title.localeCompare(a.title);
      });
  }

  function MovieMemoryCard({ movie }) {
    return (
      <div
        style={{
          padding: "16px",
          borderRadius: "16px",
          background: "white",
          border: "1px solid #eee",
          marginBottom: "12px",
        }}
      >
        <div style={{ fontWeight: "700", marginBottom: "6px" }}>
          {movie.title}
        </div>

        <div style={{ color: "#666", fontSize: "14px", marginBottom: "12px" }}>
          {movie.year}
        </div>

        <select
          value={movie.status}
          onChange={(e) => updateStatus(movie, e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginRight: "10px",
          }}
        >
          {statuses.map((status) => (
            <option key={status.key} value={status.key}>
              {status.label}
            </option>
          ))}
        </select>

        <button onClick={() => clearMovie(movie)}>
          Clear
        </button>
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
          maxWidth: "1100px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: "38px", marginTop: 0 }}>The Vault</h1>

        <p style={{ fontSize: "17px", lineHeight: "1.5", marginBottom: "28px" }}>
          Everything you’ve watched, loved, rejected, or are still deciding on
          lives here. Your personal movie vault, fully under your control. This
          is where FlickPick learns what you actually want to watch, and what
          should never darken your screen again.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by movie title..."
            style={{
              flex: "1",
              minWidth: "240px",
              padding: "12px",
              borderRadius: "14px",
              border: "1px solid #ddd",
              fontSize: "15px",
            }}
          />

          <button
            onClick={() => setSortAZ(!sortAZ)}
            style={{
              padding: "12px 16px",
              borderRadius: "999px",
              border: "1px solid #ddd",
              background: "#f5f0ff",
              cursor: "pointer",
            }}
          >
            Sort: {sortAZ ? "A to Z" : "Z to A"}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "22px",
          }}
        >
          {statuses.map((status) => {
            const moviesForStatus = getFilteredAndSortedMovies(status.key);

            return (
              <div
                key={status.key}
                style={{
                  padding: "22px",
                  borderRadius: "20px",
                  background: "#fafafa",
                  border: "1px solid #eee",
                }}
              >
                <h2 style={{ marginTop: 0 }}>{status.label}</h2>

                {moviesForStatus.length === 0 ? (
                  <p style={{ color: "#777" }}>Nothing here yet.</p>
                ) : (
                  moviesForStatus.map((movie, index) => (
                    <MovieMemoryCard
                      key={`${status.key}-${movie.title}-${movie.year}-${index}`}
                      movie={movie}
                    />
                  ))
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
