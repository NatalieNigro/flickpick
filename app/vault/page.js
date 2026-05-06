"use client";

import { useEffect, useRef, useState } from "react";
import { getMemory, saveMemory } from "../utils/memory";
import { getTags } from "../utils/tags";
import VaultMovieCard from "../components/VaultMovieCard";

const STATUS_OPTIONS = [
  { key: "all", label: "All Statuses" },
  { key: "wantToWatch", label: "🎯 Want to Watch" },
  { key: "notInterested", label: "🚫 Not Interested" },
  { key: "loved", label: "❤️ Loved" },
  { key: "meh", label: "😐 Meh" },
  { key: "hardPass", label: "❌ Hard Pass" },
];

const SORT_OPTIONS = [
  { key: "titleAZ", label: "Title A–Z" },
  { key: "titleZA", label: "Title Z–A" },
  { key: "yearNewest", label: "Year: Newest First" },
  { key: "yearOldest", label: "Year: Oldest First" },
  { key: "imdbHigh", label: "IMDb Rating: High to Low" },
];

const selectStyle = {
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  fontSize: "14px",
  background: "white",
  cursor: "pointer",
};

export default function VaultPage() {
  const [memory, setMemory] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [sort, setSort] = useState("titleAZ");

  // Tracks which card has an open panel and holds a ref to that panel's DOM element.
  // Only one panel can be open at a time across all cards.
  const [openPanel, setOpenPanel] = useState(null); // { movieKey, type: "tag"|"notes" }
  const openElemRef = useRef(null);      // primary element (button / tag trigger)
  const openExtraElemRef = useRef(null); // secondary element (notes textarea)

  useEffect(() => {
    if (!openPanel) return;
    function handleMouseDown(e) {
      const inPrimary = openElemRef.current?.contains(e.target);
      const inExtra   = openExtraElemRef.current?.contains(e.target);
      if (!inPrimary && !inExtra) {
        setOpenPanel(null);
        openElemRef.current = null;
        openExtraElemRef.current = null;
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [openPanel]);

  function openCardPanel(movieKey, type, elem) {
    openElemRef.current = elem;
    openExtraElemRef.current = null;
    setOpenPanel({ movieKey, type });
  }

  function registerExtraElem(elem) {
    openExtraElemRef.current = elem;
  }

  function closeCardPanel() {
    setOpenPanel(null);
    openElemRef.current = null;
    openExtraElemRef.current = null;
  }

  useEffect(() => {
    setMemory(getMemory());
    setTags(getTags());
  }, []);

  function updateMemory(newMemory) {
    setMemory(newMemory);
    saveMemory(newMemory);
  }

  function updateStatus(movie, newStatus) {
    const isSame = (m) => m.title === movie.title && m.year === movie.year;
    updateMemory(memory.map((m) => (isSame(m) ? { ...m, status: newStatus } : m)));
  }

  function updateTags(movie, tagIds) {
    const isSame = (m) => m.title === movie.title && m.year === movie.year;
    updateMemory(memory.map((m) => (isSame(m) ? { ...m, tagIds } : m)));
  }

  function updateNotes(movie, notes) {
    const isSame = (m) => m.title === movie.title && m.year === movie.year;
    updateMemory(memory.map((m) => (isSame(m) ? { ...m, notes } : m)));
  }

  const displayed = memory
    .filter((m) =>
      !search || m.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((m) => statusFilter === "all" || m.status === statusFilter)
    .filter(
      (m) => tagFilter === "all" || (m.tagIds || []).includes(tagFilter)
    )
    .sort((a, b) => {
      switch (sort) {
        case "titleAZ":
          return a.title.localeCompare(b.title);
        case "titleZA":
          return b.title.localeCompare(a.title);
        case "yearNewest":
          return (parseInt(b.year) || 0) - (parseInt(a.year) || 0);
        case "yearOldest":
          return (parseInt(a.year) || 0) - (parseInt(b.year) || 0);
        case "imdbHigh": {
          const ra = parseFloat(a.imdbRating) || 0;
          const rb = parseFloat(b.imdbRating) || 0;
          return rb - ra;
        }
        default:
          return 0;
      }
    });

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
          maxWidth: "860px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: "38px", marginTop: 0 }}>The Vault</h1>

        <p
          style={{
            fontSize: "17px",
            lineHeight: "1.5",
            marginBottom: "28px",
          }}
        >
          Everything you've watched, loved, rejected, or are still deciding on
          lives here. Your personal movie vault, fully under your control. This
          is where FlickPick learns what you actually want to watch, and what
          should never darken your screen again.
        </p>

        {/* Filter / search bar */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            style={{
              flex: "1",
              minWidth: "200px",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              fontSize: "14px",
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={selectStyle}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Result count */}
        <p style={{ color: "#999", fontSize: "13px", marginBottom: "16px" }}>
          {displayed.length} {displayed.length === 1 ? "movie" : "movies"}
        </p>

        {/* Movie list */}
        {displayed.length === 0 ? (
          <p
            style={{
              color: "#777",
              textAlign: "center",
              padding: "48px 0",
              fontSize: "16px",
            }}
          >
            Nothing here yet. Start rating movies from the home page.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {displayed.map((movie, i) => {
              const movieKey = `${movie.title}-${movie.year}`;
              const cardOpenPanel =
                openPanel?.movieKey === movieKey ? openPanel.type : null;
              return (
                <VaultMovieCard
                  key={`${movieKey}-${i}`}
                  movie={movie}
                  openPanel={cardOpenPanel}
                  onOpen={(type, elem) => openCardPanel(movieKey, type, elem)}
                  onClose={closeCardPanel}
                  onRegisterExtra={registerExtraElem}
                  onStatusChange={updateStatus}
                  onTagsChange={updateTags}
                  onNotesChange={updateNotes}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
