// -----------------------------------------------------------
// MOVIE CARD - This file is responsible for showing ONE movie
//------------------------------------------------------------

"use client";

import { saveToPickList, isInPickList } from "../utils/pickList";
import { useEffect, useState } from "react";

export default function MovieCard({ movie, memory, setMovieStatus }) {
  // This remembers whether this movie has already been added to the Pick List
  const [added, setAdded] = useState(false);

  // When this movie card loads, check the browser storage
  // and see if this movie is already in the Pick List
  useEffect(() => {
    setAdded(isInPickList(movie));
  }, [movie]);
  
  function getButtonStyle(status) {
    const isSelected =
      memory.find(
        (m) => m.title === movie.title && m.year === movie.year
      )?.status === status;

    return {
      padding: "8px 12px",
      borderRadius: "999px",
      border: isSelected ? "2px solid #5b21b6" : "1px solid #ddd",
      background: isSelected ? "#ede9fe" : "#ffffff",
      fontWeight: isSelected ? "700" : "500",
      cursor: "pointer",
    };
  }

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "22px",
        overflow: "hidden",
        background: "#fafafa",
        boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
      }}
    >
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

        <button
          onClick={() => {
            saveToPickList(movie);
            setAdded(true);
          }}
          style={{
            marginTop: "10px",
            padding: "8px 12px",
            borderRadius: "999px",
            border: added ? "1px solid #5b21b6" : "1px solid #ddd",
            background: added ? "#ede9fe" : "#ffffff",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {added ? "✓ Added" : "➕ Add to Pick List"}
        </button>

        <div
          style={{
            marginTop: "18px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            style={getButtonStyle("wantToWatch")}
            onClick={() => setMovieStatus(movie, "wantToWatch")}
          >
            🎯 Want to Watch
          </button>

          <button
            style={getButtonStyle("notInterested")}
            onClick={() => setMovieStatus(movie, "notInterested")}
          >
            🚫 Not Interested
          </button>

          <button
            style={getButtonStyle("loved")}
            onClick={() => setMovieStatus(movie, "loved")}
          >
            ❤️ Loved
          </button>

          <button
            style={getButtonStyle("meh")}
            onClick={() => setMovieStatus(movie, "meh")}
          >
            😐 Meh
          </button>

          <button
            style={getButtonStyle("hardPass")}
            onClick={() => setMovieStatus(movie, "hardPass")}
          >
            ❌ Hard Pass
          </button>
        </div>
      </div>
    </div>
  );
}
