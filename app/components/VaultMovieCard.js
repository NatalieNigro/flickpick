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
}) {
  const [notes, setNotes] = useState(movie.notes || "");
  const [detailsOpen, setDetailsOpen] = useState(false);

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
      }}
    >
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
      <div style={{ padding: "0 16px 14px" }}>
        <button
          onClick={() => setDetailsOpen((prev) => !prev)}
          style={{
            padding: "4px 10px",
            borderRadius: "999px",
            border: detailsOpen ? "2px solid #5b21b6" : "1px solid #ddd",
            background: detailsOpen ? "#ede9fe" : "#fff",
            fontWeight: detailsOpen ? "700" : "500",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          {detailsOpen ? "▲ Details" : "▼ Details"}
        </button>

        {detailsOpen && (
          <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {movie.why && (
              <div style={{ fontSize: "13px", lineHeight: "1.5", color: "#444" }}>
                <strong style={{ color: "#222", display: "block", marginBottom: "2px" }}>FlickPick's Take</strong>
                {movie.why}
              </div>
            )}
            {movie.plot && (
              <div style={{ fontSize: "13px", lineHeight: "1.5", color: "#444" }}>
                <strong style={{ color: "#222", display: "block", marginBottom: "2px" }}>Plot</strong>
                {movie.plot}
              </div>
            )}
            {movie.actors && movie.actors !== "Actors unavailable" && (
              <div style={{ fontSize: "13px", lineHeight: "1.5", color: "#444" }}>
                <strong style={{ color: "#222", display: "block", marginBottom: "2px" }}>Actors</strong>
                {movie.actors}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
