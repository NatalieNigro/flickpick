"use client";

import { useEffect, useRef, useState } from "react";
import { getMemory, saveMemory } from "../utils/memory";
import { getTags } from "../utils/tags";
import VaultMovieCard from "../components/VaultMovieCard";
import AddMovieModal from "../components/AddMovieModal";
import ImportMovieModal from "../components/ImportMovieModal";

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [reviewFilter, setReviewFilter] = useState(false);

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

  function handleActorClick(actorName) {
    setSearch(actorName);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  function deleteMovie(movie) {
    const isSame = (m) => m.title === movie.title && m.year === movie.year;
    updateMemory(memory.filter((m) => !isSame(m)));
  }

  function clearImportFlag(movie) {
    const isSame = (m) => m.title === movie.title && m.year === movie.year;
    updateMemory(memory.map((m) => (isSame(m) ? { ...m, importFlag: null } : m)));
  }

  function handleImport(movies) {
    updateMemory([...memory, ...movies]);
  }

  function handleExport() {
    const STATUS_LABELS = {
      wantToWatch: "Want to Watch",
      notInterested: "Not Interested",
      loved: "Loved",
      meh: "Meh",
      hardPass: "Hard Pass",
    };

    function cell(value) {
      if (value == null) return "";
      const s = String(value);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    }

    const headers = [
      "Title", "Year", "Status", "Tags", "Notes",
      "Genre", "Actors", "IMDb Rating", "FlickPick's Take",
    ];

    const rows = memory.map((m) => {
      const tagNames = (m.tagIds || [])
        .map((id) => tags.find((t) => t.id === id)?.name)
        .filter(Boolean)
        .join(";");

      const actors = (m.actors || "").split(", ").join(";");

      return [
        m.title || "",
        m.year || "",
        STATUS_LABELS[m.status] || "",
        tagNames,
        m.notes || "",
        m.genre || "",
        actors,
        m.imdbRating || "",
        m.why || "",
      ].map(cell).join(",");
    });

    const csv = [headers.map(cell).join(","), ...rows].join("\n");
    const today = new Date().toISOString().slice(0, 10);
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flickpick-vault-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleAddMovie(movie, isUpdate = false) {
    if (isUpdate) {
      const isSame = (m) => m.title === movie.title && m.year === movie.year;
      updateMemory(memory.map((m) => (isSame(m) ? { ...m, ...movie } : m)));
    } else {
      updateMemory([...memory, movie]);
    }
    setShowAddModal(false);
  }

  const flaggedCount = memory.filter((m) => m.importFlag).length;
  const activeReviewFilter = reviewFilter && flaggedCount > 0;

  const displayed = memory
    .filter((m) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        (m.actors || "").toLowerCase().includes(q)
      );
    })
    .filter((m) => statusFilter === "all" || m.status === statusFilter)
    .filter((m) => tagFilter === "all" || (m.tagIds || []).includes(tagFilter))
    .filter((m) => !activeReviewFilter || m.importFlag)
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
    <>
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
        <div style={{ marginBottom: "20px" }}>
          {/* Row 1: filters */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or actor..."
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

          {/* Row 2: Add Movie left, export actions right */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                border: "none",
                background: "#5b21b6",
                color: "white",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              + Add Movie
            </button>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleExport}
                style={{
                  padding: "10px 16px",
                  borderRadius: "12px",
                  border: "1px solid #ddd",
                  background: "white",
                  color: "#666",
                  fontWeight: "500",
                  fontSize: "14px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                ⬇ Export Vault
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "12px",
                  border: "1px solid #ddd",
                  background: "white",
                  color: "#666",
                  fontWeight: "500",
                  fontSize: "14px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                ⬆ Import Movies
              </button>

              {flaggedCount > 0 && (
                <button
                  onClick={() => setReviewFilter((prev) => !prev)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "12px",
                    border: activeReviewFilter ? "2px solid #d97706" : "1px solid #fde68a",
                    background: activeReviewFilter ? "#fffbeb" : "white",
                    color: activeReviewFilter ? "#92400e" : "#b45309",
                    fontWeight: activeReviewFilter ? "700" : "500",
                    fontSize: "14px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  ⚠️ Needs Review ({flaggedCount})
                </button>
              )}
            </div>
          </div>
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
                  onActorClick={handleActorClick}
                  onDelete={deleteMovie}
                  onClearFlag={clearImportFlag}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>

    {showAddModal && (
      <AddMovieModal
        memory={memory}
        onSave={handleAddMovie}
        onClose={() => setShowAddModal(false)}
      />
    )}
    {showImportModal && (
      <ImportMovieModal
        memory={memory}
        onImport={handleImport}
        onClose={() => setShowImportModal(false)}
      />
    )}
    </>
  );
}
