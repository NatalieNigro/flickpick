// -----------------------------------------------------------
// MOVIE CARD
// This file is responsible for showing ONE movie card.
// It handles:
// - movie poster and details
// - Add to Pick List button
// - Where to Watch lookup
// - status buttons for The Vault
// -----------------------------------------------------------

"use client";

import { useEffect, useState } from "react";
import { saveToPickList, isInPickList } from "../utils/pickList";

export default function MovieCard({ movie, memory, setMovieStatus }) {
  // Tracks whether this movie has already been added to the Pick List
  const [added, setAdded] = useState(false);

  // Stores the streaming/rental/buy options returned by our API
  const [watchSources, setWatchSources] = useState([]);

  // Stores a helpful message if no watch sources are found
  const [watchMessage, setWatchMessage] = useState("");

  // Tracks whether the Where to Watch lookup is currently running
  const [watchLoading, setWatchLoading] = useState(false);

  // When this movie card loads, check if the movie is already in the Pick List
  useEffect(() => {
    setAdded(isInPickList(movie));
  }, [movie]);

  // Controls how the Vault status buttons look when selected
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

  // Calls our server-side API route to ask where this movie can be watched
  async function findWhereToWatch() {
    setWatchLoading(true);
    setWatchMessage("");
    setWatchSources([]);

    try {
      const res = await fetch("/api/watch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: movie.title,
          year: movie.year,
        }),
      });

      const data = await res.json();

      setWatchSources(data.sources || []);
      setWatchMessage(data.message || "");
    } catch (error) {
      setWatchMessage("Couldn’t find where to watch this one.");
    } finally {
      setWatchLoading(false);
    }
  }

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "22px",
        overflow: "hidden",
        background: "#fafafa",
        boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
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

      <div
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
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

        {/* This bottom area stays pushed to the bottom of the card */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "18px",
          }}
        >
          {/* Main action buttons */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
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

            <button
              onClick={findWhereToWatch}
              disabled={watchLoading}
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                border: "1px solid #ddd",
                background: watchLoading ? "#ede9fe" : "#ffffff",
                color: "#5b21b6",
                fontWeight: "600",
                cursor: watchLoading ? "wait" : "pointer",
              }}
            >
              {watchLoading ? "Searching..." : "📺 Where to Watch"}
            </button>
          </div>

          {/* Where to Watch results */}
          {watchMessage && (
            <p style={{ marginTop: "12px", fontSize: "14px", color: "#666" }}>
              {watchMessage}
            </p>
          )}

          {watchSources.length > 0 && (
            <div style={{ marginTop: "12px" }}>
              <p style={{ fontWeight: "700", marginBottom: "8px" }}>
                Available on:
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {watchSources.slice(0, 6).map((source, index) => (
                  <a
                    key={`${source.name}-${source.type}-${index}`}
                    href={source.web_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "7px 10px",
                      borderRadius: "999px",
                      background: "#ede9fe",
                      color: "#5b21b6",
                      fontSize: "13px",
                      fontWeight: "600",
                      textDecoration: "none",
                    }}
                  >
                    {source.name} {source.type ? `(${source.type})` : ""}
                  </a>
                ))}
              </div>
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
}
