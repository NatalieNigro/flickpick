"use client";

import { useEffect, useState } from "react";
import { getPickList, removeFromPickList } from "../utils/pickList";

export default function PickListPage() {
  // This holds the movies saved to the Pick List
  const [movies, setMovies] = useState([]);

  // When the page opens, load the saved Pick List from the browser
  useEffect(() => {
    setMovies(getPickList());
  }, []);

  // Remove one movie, then refresh what shows on the page
  function handleRemove(movie) {
    removeFromPickList(movie.title, movie.year);
    setMovies(getPickList());
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
        <h1 style={{ fontSize: "38px", marginTop: 0 }}>
          🎬 Pick List
        </h1>

        <p style={{ fontSize: "17px", lineHeight: "1.5", marginBottom: "28px" }}>
          This is your “maybe tonight, maybe later” pile. Trouble would say this is
          where movies wait patiently while you pretend you’re going to make a quick
          decision.
        </p>

        {movies.length === 0 ? (
          <p style={{ color: "#777", fontSize: "16px" }}>
            No movies saved yet. Go back to FlickPick and add a few contenders.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "22px",
            }}
          >
            {movies.map((movie, index) => (
              <div
                key={`${movie.title}-${movie.year}-${index}`}
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

                <div style={{ padding: "24px" }}>
                  <h2 style={{ marginTop: 0, fontSize: "22px" }}>
                    {movie.title}
                  </h2>

                  <p style={{ color: "#666", marginTop: "-8px" }}>
                    {movie.year}
                  </p>

                  {movie.genre && (
                    <p style={{ fontSize: "14px", color: "#444" }}>
                      <strong>Genre:</strong> {movie.genre}
                    </p>
                  )}

                  {movie.imdbRating && movie.imdbRating !== "N/A" && (
                    <p style={{ fontSize: "14px", color: "#444" }}>
                      <strong>IMDb:</strong> {movie.imdbRating}
                    </p>
                  )}

                  {movie.plot && (
                    <p style={{ fontSize: "14px", lineHeight: "1.5", color: "#666" }}>
                      <strong>Plot:</strong> {movie.plot}
                    </p>
                  )}

                  <button
                    onClick={() => handleRemove(movie)}
                    style={{
                      marginTop: "12px",
                      padding: "10px 14px",
                      borderRadius: "999px",
                      border: "1px solid #ddd",
                      background: "#ffffff",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Remove from Pick List
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
