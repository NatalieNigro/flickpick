// -----------------------------------------------------------
// MOVIE CARD - This file is responsible for showing ONE movie
//------------------------------------------------------------

"use client";

import { saveToPickList } from "../utils/pickList";

// This component displays one movie card
export default function MovieCard({
  movie,
  memory,
  setMovieStatus,
}) {
  // This function controls how the status buttons look
  function getButtonStyle(status) {
    // Check if this movie already has this status
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
      }}
    >
      {/* Movie Poster */}
      {movie.poster ? (
        <img src={movie.poster} alt={movie.title} />
      ) : (
        <div>Poster unavailable</div>
      )}

      <div style={{ padding: "20px" }}>
        <h2>{movie.title}</h2>
        <p>{movie.year}</p>

        {/* Basic movie info */}
        <p><strong>Genre:</strong> {movie.genre}</p>
        <p><strong>Actors:</strong> {movie.actors}</p>

        {/* AI explanation */}
        <p>{movie.why}</p>

        {/* Plot */}
        <p><strong>Plot:</strong> {movie.plot}</p>

        {/* 🎯 Add to Pick List button */}
        <button onClick={() => saveToPickList(movie)}>
          ➕ Add to Pick List
        </button>

        {/* Status buttons (this is your “memory system”) */}
        <div style={{ marginTop: "12px" }}>
          <button onClick={() => setMovieStatus(movie, "wantToWatch")} style={getButtonStyle("wantToWatch")}>
            🎯 Want to Watch
          </button>

          <button onClick={() => setMovieStatus(movie, "notInterested")} style={getButtonStyle("notInterested")}>
            🚫 Not Interested
          </button>

          <button onClick={() => setMovieStatus(movie, "loved")} style={getButtonStyle("loved")}>
            ❤️ Loved
          </button>

          <button onClick={() => setMovieStatus(movie, "meh")} style={getButtonStyle("meh")}>
            😐 Meh
          </button>

          <button onClick={() => setMovieStatus(movie, "hardPass")} style={getButtonStyle("hardPass")}>
            ❌ Hard Pass
          </button>
        </div>
      </div>
    </div>
  );
}
