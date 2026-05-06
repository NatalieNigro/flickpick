"use client";

import { useEffect, useRef, useState } from "react";
import { saveToPickList, isInPickList } from "../utils/pickList";
import TagSelector from "./TagSelector";

export default function MovieCard({
  movie,
  memory,
  setMovieStatus,
  updateMovieTags,
}) {
  const [added, setAdded] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const tagSelectorRef = useRef(null);

  // Check if this movie already exists in The Vault (memory)
  const savedMovie = memory.find(
    (m) => m.title === movie.title && m.year === movie.year
  );

  // If the movie exists in memory, use its saved tags
  // Otherwise, default to an empty tag list
  const selectedTagIds = savedMovie?.tagIds || [];

  useEffect(() => {
    setAdded(isInPickList(movie));
  }, [movie]);

  useEffect(() => {
    if (!tagOpen) return;
    function handleMouseDown(e) {
      if (!tagSelectorRef.current?.contains(e.target)) {
        setTagOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [tagOpen]);

  // Controls how the Vault status buttons look (highlight selected one)
  function getButtonStyle(status) {
    const isSelected = savedMovie?.status === status;

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
        background: "#fafafa",
        boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Movie Poster (or fallback if missing) */}
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
            borderRadius: "22px 22px 0 0",
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
            borderRadius: "22px 22px 0 0",
          }}
        >
          Poster unavailable
        </div>
      )}

      {/* Main content area */}
      <div
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* Title and year */}
        <h2 style={{ marginTop: 0, fontSize: "22px" }}>
          {movie.title}
        </h2>

        <p style={{ color: "#666", marginTop: "-8px" }}>
          {movie.year}
        </p>

        {/* Basic details */}
        <p style={{ fontSize: "14px", lineHeight: "1.5", color: "#444" }}>
          <strong>Genre:</strong> {movie.genre}
        </p>

        <p style={{ fontSize: "14px", lineHeight: "1.5", color: "#444" }}>
          <strong>Actors:</strong> {movie.actors}
        </p>

        {/* IMDb rating (only if available) */}
        {movie.imdbRating && movie.imdbRating !== "N/A" && (
          <p style={{ fontSize: "14px", lineHeight: "1.5", color: "#444" }}>
            <strong>IMDb:</strong> {movie.imdbRating}
          </p>
        )}

        {/* AI explanation of why this movie fits the vibe */}
        <p style={{ lineHeight: "1.6" }}>
          {movie.why}
        </p>

        {/* Plot summary (if available) */}
        {movie.plot && (
          <p style={{ fontSize: "14px", lineHeight: "1.5", color: "#666" }}>
            <strong>Plot:</strong> {movie.plot}
          </p>
        )}

        {/* Bottom section: always stays pinned to the bottom */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "18px",
          }}
        >
          {/* Add to Pick List button */}
          <button
            onClick={() => {
              saveToPickList(movie);
              setAdded(true);
            }}
            style={{
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

          {/* Vault status buttons */}
          <div
            style={{
              marginTop: "12px",
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

          <div style={{ marginTop: "14px", display: "inline-block" }}>
            <TagSelector
              ref={tagSelectorRef}
              selectedTagIds={selectedTagIds}
              open={tagOpen}
              onToggle={() => setTagOpen((prev) => !prev)}
              onChange={(tagIds) => updateMovieTags(movie, tagIds)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
