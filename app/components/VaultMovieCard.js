"use client";

import { useEffect, useRef, useState } from "react";
import { getTags } from "../utils/tags";

const STATUSES = [
  { key: "wantToWatch", label: "🎯 Want to Watch" },
  { key: "notInterested", label: "🚫 Not Interested" },
  { key: "loved", label: "❤️ Loved" },
  { key: "meh", label: "😐 Meh" },
  { key: "hardPass", label: "❌ Hard Pass" },
];

export default function VaultMovieCard({
  movie,
  openPanel,      // "tag" | "notes" | null — controlled by VaultPage
  onOpen,         // (type, domElement) => void
  onClose,        // () => void
  onStatusChange,
  onTagsChange,
  onNotesChange,
}) {
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState(movie.notes || "");

  const tagRef = useRef(null);
  const notesRef = useRef(null);

  const tagOpen = openPanel === "tag";
  const notesOpen = openPanel === "notes";

  useEffect(() => {
    setTags(getTags());
  }, []);

  function handleStatusClick(statusKey) {
    onStatusChange(movie, movie.status === statusKey ? null : statusKey);
  }

  function handleTagToggle() {
    if (tagOpen) {
      onClose();
    } else {
      onOpen("tag", tagRef.current);
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

  function toggleTag(tagId) {
    const current = movie.tagIds || [];
    const updated = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    onTagsChange(movie, updated);
  }

  const selectedTags = tags.filter((tag) => (movie.tagIds || []).includes(tag.id));

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
          {/* Title, year, IMDb */}
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

          {/* Tag badges — outside the ref so clicking them triggers outside-close */}
          {selectedTags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "6px" }}>
              {selectedTags.map((tag) => (
                <span
                  key={tag.id}
                  style={{
                    padding: "3px 10px",
                    borderRadius: "999px",
                    background: tag.color,
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Tag ref wraps only the button + dropdown — inline-block so it doesn't span the full row */}
          <div ref={tagRef} style={{ display: "inline-block", position: "relative", alignSelf: "flex-start" }}>
            <button
              onClick={handleTagToggle}
              style={{
                padding: "4px 10px",
                borderRadius: "999px",
                border: "1px solid #ddd",
                background: "#fff",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              + Add Tag
            </button>

            {tagOpen && tags.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "6px",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "8px",
                  background: "#fff",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                  maxHeight: "160px",
                  overflowY: "auto",
                  zIndex: 10,
                  minWidth: "160px",
                }}
              >
                {tags.map((tag) => {
                  const isSelected = (movie.tagIds || []).includes(tag.id);
                  return (
                    <div
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        background: isSelected ? "#ede9fe" : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                      }}
                    >
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: tag.color,
                          flexShrink: 0,
                        }}
                      />
                      {tag.name}
                    </div>
                  );
                })}
              </div>
            )}
          </div> {/* end tagRef */}

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

      {/* Notes section — outer div is for padding/layout only, not the ref */}
      <div style={{ padding: "0 16px 14px" }}>
        {/* ref wraps only the button so whitespace to its right triggers outside-close */}
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
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            onMouseDown={(e) => e.stopPropagation()}
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
    </div>
  );
}
