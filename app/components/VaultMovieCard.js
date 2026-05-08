"use client";

import { useRef, useState } from "react";
import TagSelector from "./TagSelector";

const STATUSES = [
  { key: "wantToWatch", label: "🎯 Want to Watch" },
  { key: "notInterested", label: "🚫 Not Interested" },
  { key: "loved", label: "❤️ Loved" },
  { key: "meh", label: "😐 Meh" },
  { key: "hardPass", label: "❌ Hard Pass" },
];

export default function VaultMovieCard({
  movie,
  openPanel,        // "tag" | "notes" | null — controlled by VaultPage
  onOpen,           // (type, domElement) => void
  onClose,          // () => void
  onRegisterExtra,  // (domElement | null) => void — registers textarea with parent listener
  onStatusChange,
  onTagsChange,
  onNotesChange,
  onActorClick,
  onDelete,
  onClearFlag,
  onEdit,
  onPickVersion,
}) {
  const [notes, setNotes] = useState(movie.notes || "");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [trashHovered, setTrashHovered] = useState(false);
  const [picking, setPicking] = useState(false);
  const [pickLoading, setPickLoading] = useState(false);

  async function handlePickVersion(imdbId) {
    setPickLoading(true);
    try {
      const res = await fetch(`/api/omdb?i=${encodeURIComponent(imdbId)}&plot=full`);
      const data = await res.json();
      if (data.Response !== "False") {
        onPickVersion(movie, {
          title: data.Title,
          year: data.Year,
          poster: data.Poster !== "N/A" ? data.Poster : "",
          genre: data.Genre || "",
          actors: data.Actors || "",
          plot: data.Plot || "",
          imdbRating: data.imdbRating || "",
          omdbFound: true,
        });
        setPicking(false);
      }
    } catch {
      // stay in picking mode on error
    }
    setPickLoading(false);
  }

  const tagSelectorRef = useRef(null);
  const notesRef = useRef(null);

  const tagOpen = openPanel === "tag";
  const notesOpen = openPanel === "notes";
  const hasTags = (movie.tagIds || []).length > 0;

  function handleStatusClick(statusKey) {
    onStatusChange(movie, movie.status === statusKey ? null : statusKey);
  }

  function handleTagToggle() {
    if (tagOpen) {
      onClose();
    } else {
      onOpen("tag", tagSelectorRef.current);
    }
  }

  function handleNotesToggle() {
    if (notesOpen) {
      onNotesChange(movie, notes);
      onClose();
    } else {
      onOpen("notes", notesRef.current);
    }
  }

  function handleNotesBlur() {
    onNotesChange(movie, notes);
  }

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid #eee",
        background: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        position: "relative",
      }}
    >
      {/* Trash button */}
      <button
        onClick={() => setConfirming(true)}
        onMouseEnter={() => setTrashHovered(true)}
        onMouseLeave={() => setTrashHovered(false)}
        title="Remove from Vault"
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          zIndex: 2,
          color: trashHovered ? "#dc2626" : "#bbb",
          lineHeight: 0,
        }}
      >
        <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Handle */}
          <path d="M4.5 1h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Lid */}
          <path d="M1 3.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Body */}
          <path d="M2 3.5l1 10h7l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Inner lines */}
          <path d="M5 6.5v5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          <path d="M8 6.5v5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Horizontal row: poster + details */}
      <div style={{ display: "flex" }}>
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            style={{
              width: "90px",
              minWidth: "90px",
              height: "135px",
              objectFit: "cover",
              display: "block",
              borderRadius: "16px 0 0 0",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: "90px",
              minWidth: "90px",
              height: "135px",
              background: "#eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              color: "#999",
              textAlign: "center",
              padding: "8px",
              boxSizing: "border-box",
              borderRadius: "16px 0 0 0",
              flexShrink: 0,
            }}
          >
            No poster
          </div>
        )}

        {/* Details */}
        <div
          style={{
            flex: 1,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: "700", fontSize: "16px" }}>{movie.title}</span>
            <span style={{ color: "#888", fontSize: "13px" }}>{movie.year}</span>
            {movie.imdbRating && movie.imdbRating !== "N/A" && (
              <span style={{ color: "#888", fontSize: "13px" }}>⭐ {movie.imdbRating}</span>
            )}
          </div>

          {movie.genre && (
            <div style={{ color: "#666", fontSize: "13px" }}>{movie.genre}</div>
          )}

          <TagSelector
            ref={tagSelectorRef}
            selectedTagIds={movie.tagIds || []}
            open={tagOpen}
            onToggle={handleTagToggle}
            onChange={(tagIds) => onTagsChange(movie, tagIds)}
          />

          {/* Status buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "auto", paddingTop: "4px" }}>
            {STATUSES.map((status) => {
              const isSelected = movie.status === status.key;
              return (
                <button
                  key={status.key}
                  onClick={() => handleStatusClick(status.key)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    border: isSelected ? "2px solid #5b21b6" : "1px solid #ddd",
                    background: isSelected ? "#ede9fe" : "#fff",
                    fontWeight: isSelected ? "700" : "500",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {status.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Version picker — replaces all bottom sections when active */}
      {picking ? (
        <div
          style={{
            borderTop: "1px solid #ede9fe",
            background: "#faf7ff",
            borderRadius: "0 0 16px 16px",
            padding: "14px 16px 16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#5b21b6" }}>
              Select the correct version:
            </span>
            <button
              onClick={() => setPicking(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "13px", padding: 0, lineHeight: 1 }}
            >
              Cancel
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "220px", overflowY: "auto" }}>
            {(movie.omdbAlternatives || []).map((result) => (
              <button
                key={result.imdbID}
                onClick={() => handlePickVersion(result.imdbID)}
                disabled={pickLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  background: pickLoading ? "#f9fafb" : "white",
                  cursor: pickLoading ? "wait" : "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                {result.Poster && result.Poster !== "N/A" ? (
                  <img src={result.Poster} alt="" style={{ width: "30px", height: "44px", objectFit: "cover", borderRadius: "4px", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: "30px", height: "44px", background: "#e5e7eb", borderRadius: "4px", flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontWeight: "600", fontSize: "13px", color: "#111" }}>{result.Title}</div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                    {result.Year} · {result.Type === "movie" ? "Movie" : result.Type === "series" ? "TV Series" : result.Type}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : confirming ? (
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid #fee2e2",
            background: "#fef2f2",
            borderRadius: "0 0 16px 16px",
          }}
        >
          <p style={{ margin: "0 0 12px", fontSize: "14px", color: "#991b1b", fontWeight: "500" }}>
            Remove this movie from your Vault?
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => onDelete(movie)}
              style={{
                padding: "6px 16px",
                borderRadius: "999px",
                border: "none",
                background: "#dc2626",
                color: "white",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{
                padding: "6px 16px",
                borderRadius: "999px",
                border: "1px solid #ddd",
                background: "white",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
      {/* Notes section */}
      <div style={{ padding: `${hasTags ? 0 : 10}px 16px 8px` }}>
        <span ref={notesRef} style={{ display: "inline-block" }}>
          <button
            onClick={handleNotesToggle}
            style={{
              padding: "4px 10px",
              borderRadius: "999px",
              border: notesOpen ? "2px solid #5b21b6" : "1px solid #ddd",
              background: notesOpen ? "#ede9fe" : "#fff",
              fontWeight: notesOpen ? "700" : "500",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            📝 Notes{notes ? " ·" : ""}
          </button>
        </span>

        {notesOpen && (
          <textarea
            ref={(el) => onRegisterExtra(el)}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add your thoughts, reminders, or notes..."
            style={{
              display: "block",
              marginTop: "8px",
              width: "100%",
              minHeight: "80px",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              fontSize: "14px",
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
              lineHeight: "1.5",
            }}
          />
        )}
      </div>

      {/* Details section */}
      <div style={{ borderTop: "1px solid #ede9fe", padding: "10px 16px 14px" }}>
        <button
          onClick={() => setDetailsOpen((prev) => !prev)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            color: "#111",
            fontSize: "12px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {detailsOpen ? "▲ Details" : "▼ Details"}
        </button>

        {detailsOpen && (
          <div
            style={{
              marginTop: "10px",
              background: "#faf7ff",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {movie.why && (
              <div>
                <div style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#5b21b6", marginBottom: "6px" }}>
                  FlickPick's Take
                </div>
                <div style={{ borderLeft: "2px solid #c4b5fd", paddingLeft: "12px", fontStyle: "italic", color: "#111", lineHeight: "1.6", fontSize: "13px" }}>
                  {movie.why}
                </div>
              </div>
            )}
            {movie.plot && (
              <div>
                <div style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#5b21b6", marginBottom: "6px" }}>
                  Plot
                </div>
                <div style={{ fontSize: "12px", color: "#222", lineHeight: "1.5" }}>
                  {movie.plot}
                </div>
              </div>
            )}
            {movie.actors && movie.actors !== "Actors unavailable" && (
              <div>
                <div style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#5b21b6", marginBottom: "6px" }}>
                  Actors
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {movie.actors.split(", ").map((actor) => (
                    <span
                      key={actor}
                      onClick={() => onActorClick(actor)}
                      style={{
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: "#e5e7eb",
                        fontSize: "11px",
                        color: "#222",
                        cursor: "pointer",
                      }}
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review section — only on flagged movies */}
      {movie.importFlag && (
        <div
          style={{
            borderTop: "1px solid #ede9fe",
            background: "#faf7ff",
            padding: "14px 16px 16px",
            borderRadius: "0 0 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* Row 1: Review Reason */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#5b21b6", whiteSpace: "nowrap" }}>
              Review Reason
            </span>
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: "600",
                background: movie.importFlag === "needsReview" ? "#fffbeb" : "#fef2f2",
                color: movie.importFlag === "needsReview" ? "#92400e" : "#991b1b",
                border: `1px solid ${movie.importFlag === "needsReview" ? "#fde68a" : "#fecaca"}`,
              }}
            >
              {movie.importFlag === "needsReview" ? "⚠️ Multiple versions exist... verify we have the right one" : "❌ Not in OMDB"}
            </span>
          </div>

          {/* Row 2: How to Resolve */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#5b21b6", whiteSpace: "nowrap" }}>
              How to Resolve
            </span>
            <button
              onClick={() => onClearFlag(movie)}
              style={{
                padding: "5px 12px",
                borderRadius: "999px",
                border: "1px solid #86efac",
                background: "#f0fdf4",
                color: "#166534",
                fontWeight: "600",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              ✓ Looks Good
            </button>
            <button
              onClick={() => {
                if (movie.importFlag === "needsReview" && movie.omdbAlternatives?.length) {
                  setPicking(true);
                } else {
                  onEdit(movie);
                }
              }}
              style={{
                padding: "5px 12px",
                borderRadius: "999px",
                border: "1px solid #c4b5fd",
                background: "#ede9fe",
                color: "#5b21b6",
                fontWeight: "600",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onDelete(movie)}
              style={{
                padding: "5px 12px",
                borderRadius: "999px",
                border: "1px solid #fecaca",
                background: "#fef2f2",
                color: "#dc2626",
                fontWeight: "600",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              🗑 Delete
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
