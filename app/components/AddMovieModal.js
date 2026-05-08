"use client";

import { useEffect, useRef, useState } from "react";
import TagSelector from "./TagSelector";

const STATUSES = [
  { key: "wantToWatch", label: "🎯 Want to Watch" },
  { key: "notInterested", label: "🚫 Not Interested" },
  { key: "loved", label: "❤️ Loved" },
  { key: "meh", label: "😐 Meh" },
  { key: "hardPass", label: "❌ Hard Pass" },
];

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  marginBottom: "8px",
  color: "#333",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  fontSize: "14px",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export default function AddMovieModal({ memory, onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState(null);
  const [tagIds, setTagIds] = useState([]);
  const [notes, setNotes] = useState("");

  const [tagOpen, setTagOpen] = useState(false);
  const tagSelectorRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [duplicateOf, setDuplicateOf] = useState(null);

  // Lock background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Click-outside for TagSelector
  useEffect(() => {
    if (!tagOpen) return;
    function handleMouseDown(e) {
      if (!tagSelectorRef.current?.contains(e.target)) setTagOpen(false);
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [tagOpen]);

  async function handleSearch() {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    setSearchResults(null);
    setDuplicateOf(null);

    try {
      const params = new URLSearchParams({ s: title.trim() });
      if (year.trim()) params.set("y", year.trim());

      const res = await fetch(`/api/omdb?${params}`);
      const data = await res.json();

      if (data.Response === "False") {
        setError("No movies found. Try a different spelling, or leave the year blank.");
        setLoading(false);
        return;
      }

      // Exclude episode-level results
      const results = data.Search.filter((r) => r.Type !== "episode");
      if (results.length === 0) {
        setError("No movies or series found matching that title.");
        setLoading(false);
        return;
      }

      setSearchResults(results);
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleSelectResult(imdbId) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/omdb?i=${imdbId}`);
      const data = await res.json();

      if (data.Response === "False") {
        setError("Couldn't load movie details. Please try again.");
        setLoading(false);
        return;
      }

      const movie = {
        title: data.Title,
        year: data.Year,
        poster: data.Poster !== "N/A" ? data.Poster : "",
        genre: data.Genre || "",
        actors: data.Actors || "",
        plot: data.Plot || "",
        imdbRating: data.imdbRating || "",
        omdbFound: true,
        status,
        tagIds,
        notes,
      };

      const alreadyExists = memory.some(
        (m) => m.title === movie.title && m.year === movie.year
      );

      if (alreadyExists) {
        setDuplicateOf(movie);
        setSearchResults(null);
        setLoading(false);
        return;
      }

      onSave(movie);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 100,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(560px, calc(100vw - 48px))",
          maxHeight: "calc(100vh - 80px)",
          overflowY: "auto",
          background: "white",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
          zIndex: 101,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "22px" }}>Add Movie to Vault</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888", padding: "4px", lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>
            Movie Title <span style={{ color: "#7c3aed" }}>*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. Parasite"
            style={inputStyle}
          />
        </div>

        {/* Year */}
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>
            Year{" "}
            <span style={{ color: "#999", fontWeight: "400" }}>(optional — helps find the right version)</span>
          </label>
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. 2019"
            style={{ ...inputStyle, width: "130px" }}
          />
        </div>

        {/* Status */}
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Status</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {STATUSES.map((s) => {
              const isSelected = status === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setStatus(isSelected ? null : s.key)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "999px",
                    border: isSelected ? "2px solid #5b21b6" : "1px solid #ddd",
                    background: isSelected ? "#ede9fe" : "#fff",
                    fontWeight: isSelected ? "700" : "500",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Tags</label>
          <TagSelector
            ref={tagSelectorRef}
            selectedTagIds={tagIds}
            open={tagOpen}
            onToggle={() => setTagOpen((prev) => !prev)}
            onChange={setTagIds}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: "24px" }}>
          <label style={labelStyle}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your thoughts, reminders, or notes..."
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              fontSize: "14px",
              resize: "vertical",
              minHeight: "80px",
              boxSizing: "border-box",
              fontFamily: "inherit",
              lineHeight: "1.5",
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* Search results picker */}
        {searchResults && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#666" }}>
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found — select the right one:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "260px", overflowY: "auto" }}>
              {searchResults.map((result) => (
                <button
                  key={result.imdbID}
                  onClick={() => handleSelectResult(result.imdbID)}
                  disabled={loading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    background: "#fafafa",
                    cursor: loading ? "wait" : "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  {result.Poster && result.Poster !== "N/A" ? (
                    <img
                      src={result.Poster}
                      alt=""
                      style={{ width: "38px", height: "56px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: "38px", height: "56px", background: "#e5e7eb", borderRadius: "6px", flexShrink: 0 }} />
                  )}
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "14px", color: "#111" }}>{result.Title}</div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                      {result.Year} ·{" "}
                      {result.Type === "movie" ? "Movie" : result.Type === "series" ? "TV Series" : result.Type}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Duplicate warning */}
        {duplicateOf && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "12px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              fontSize: "14px",
              color: "#78350f",
            }}
          >
            <strong>{duplicateOf.title} ({duplicateOf.year})</strong> is already in your Vault.
            Saving will update the existing entry with your new selections.
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                onClick={() => onSave(duplicateOf, true)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "999px",
                  border: "none",
                  background: "#5b21b6",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Update entry
              </button>
              <button
                onClick={() => { setDuplicateOf(null); setSearchResults(null); }}
                style={{
                  padding: "7px 16px",
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
        )}

        {/* Submit — hidden while results or duplicate warning are showing */}
        {!searchResults && !duplicateOf && (
          <button
            onClick={handleSearch}
            disabled={loading || !title.trim()}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "999px",
              border: "none",
              background: loading || !title.trim() ? "#c4b5fd" : "#5b21b6",
              color: "white",
              fontWeight: "700",
              fontSize: "15px",
              cursor: loading || !title.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Searching..." : "Find & Add Movie"}
          </button>
        )}
      </div>
    </>
  );
}
