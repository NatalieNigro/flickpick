"use client";

import { useEffect, useRef, useState } from "react";
import { getTags } from "../utils/tags";

const STATUS_LABEL_MAP = {
  "want to watch": "wantToWatch",
  "not interested": "notInterested",
  "loved": "loved",
  "meh": "meh",
  "hard pass": "hardPass",
};

function parseCSV(text) {
  const cleaned = text.replace(/^﻿/, "");
  const lines = cleaned.split(/\r?\n/);
  if (lines.length < 2) return [];

  function parseLine(line) {
    const fields = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        fields.push(field);
        field = "";
      } else {
        field += ch;
      }
    }
    fields.push(field);
    return fields;
  }

  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseLine(line);
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (values[idx] ?? "").trim(); });
    rows.push(obj);
  }
  return rows;
}

async function omdbSearch(title, year) {
  const params = new URLSearchParams({ s: title });
  if (year) params.set("y", year);
  const res = await fetch(`/api/omdb?${params}`);
  return res.json();
}

async function omdbDetail(query, byId, year) {
  const params = byId
    ? new URLSearchParams({ i: query, plot: "full" })
    : new URLSearchParams({ t: query, plot: "full" });
  if (!byId && year) params.set("y", year);
  const res = await fetch(`/api/omdb?${params}`);
  return res.json();
}

function buildNotFoundMovie(title, year, status, tagIds, notes) {
  return {
    title, year: year || "", poster: "", genre: "", actors: "",
    plot: "", imdbRating: "", omdbFound: false,
    importFlag: "notFound", status, tagIds, notes,
  };
}

async function resolveMovie(title, year, status, tagIds, notes) {
  const searchData = await omdbSearch(title, year);

  let imdbId = null;
  let needsReview = false;
  let omdbAlternatives = null;

  if (searchData.Response === "False") {
    const direct = await omdbDetail(title, false, year);
    if (direct.Response === "False") {
      return { type: "notFound", movie: buildNotFoundMovie(title, year, status, tagIds, notes) };
    }
    imdbId = direct.imdbID;
  } else {
    const results = (searchData.Search || []).filter((r) => r.Type !== "episode");
    if (results.length === 0) {
      return { type: "notFound", movie: buildNotFoundMovie(title, year, status, tagIds, notes) };
    } else if (results.length === 1) {
      imdbId = results[0].imdbID;
    } else if (year) {
      const match = results.find((r) => r.Year === year || r.Year.startsWith(year));
      imdbId = (match || results[0]).imdbID;
    } else {
      // Multiple results, no year — auto-pick first but flag for review and store all options
      imdbId = results[0].imdbID;
      needsReview = true;
      omdbAlternatives = results;
    }
  }

  const detail = await omdbDetail(imdbId, true);
  if (detail.Response === "False") {
    return { type: "notFound", movie: buildNotFoundMovie(title, year, status, tagIds, notes) };
  }

  return {
    type: needsReview ? "needsReview" : "success",
    movie: {
      title: detail.Title || title,
      year: detail.Year || year || "",
      poster: detail.Poster !== "N/A" ? detail.Poster : "",
      genre: detail.Genre || "",
      actors: detail.Actors || "",
      plot: detail.Plot || "",
      imdbRating: detail.imdbRating || "",
      omdbFound: true,
      importFlag: needsReview ? "needsReview" : null,
      omdbAlternatives,
      status, tagIds, notes,
    },
  };
}

function SummaryRow({ bg, border, color, children }) {
  return (
    <div style={{ padding: "12px 16px", borderRadius: "12px", background: bg, border: `1px solid ${border}`, fontSize: "14px", color, fontWeight: "500" }}>
      {children}
    </div>
  );
}

export default function ImportMovieModal({ memory, onImport, onClose }) {
  const [tags] = useState(() => getTags());
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState("welcome");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [summary, setSummary] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleFilePick(f) {
    if (f?.name.toLowerCase().endsWith(".csv")) setFile(f);
  }

  function downloadTemplate() {
    function cell(v) {
      const s = String(v ?? "");
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"` : s;
    }
    const rows = [
      ["Title", "Year", "Status", "Tags", "Notes"],
      ["The Shawshank Redemption", "1994", "Loved", "Drama;Classics", "One of the greatest films ever made"],
      ["Parasite", "", "", "", ""],
      ["# Valid Status values: Loved, Meh, Hard Pass, Want to Watch, Not Interested  —  Separate multiple Tags with semicolons e.g. Action;Comedy", "", "", "", ""],
    ];
    const csv = rows.map((r) => r.map(cell).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flickpick-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  }

  async function handleImport() {
    if (!file) return;
    const text = await file.text();
    const rows = parseCSV(text).filter((r) => r["title"]?.trim() && !r["title"].trim().startsWith("#"));
    if (rows.length === 0) return;

    setPhase("processing");
    setProgress({ current: 0, total: rows.length });

    const added = [];
    const needsReview = [];
    const notFound = [];
    const duplicates = [];
    const seen = new Set();

    for (let i = 0; i < rows.length; i++) {
      setProgress({ current: i + 1, total: rows.length });

      const row = rows[i];
      const title = row["title"].trim();
      const year = row["year"]?.trim() || "";
      const status = STATUS_LABEL_MAP[(row["status"] || "").trim().toLowerCase()] || null;
      const notes = row["notes"]?.trim() || "";
      const tagNames = (row["tags"] || "").split(";").map((s) => s.trim()).filter(Boolean);
      const tagIds = tagNames
        .map((name) => tags.find((t) => t.name.toLowerCase() === name.toLowerCase())?.id)
        .filter(Boolean);

      const key = `${title.toLowerCase()}|${year}`;
      const inMemory = memory.some(
        (m) => m.title.toLowerCase() === title.toLowerCase() && (!year || m.year === year)
      );
      if (seen.has(key) || inMemory) {
        duplicates.push(title);
        continue;
      }
      seen.add(key);

      const result = await resolveMovie(title, year, status, tagIds, notes);
      if (result.type === "success") added.push(result.movie);
      else if (result.type === "needsReview") needsReview.push(result.movie);
      else notFound.push(result.movie);
    }

    const allNew = [...added, ...needsReview, ...notFound];
    if (allNew.length > 0) onImport(allNew);

    setSummary({ added, needsReview, notFound, duplicates });
    setPhase("done");
  }

  const canClose = phase !== "processing";

  return (
    <>
      <div
        onClick={canClose ? onClose : undefined}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100 }}
      />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(520px, calc(100vw - 48px))",
          maxHeight: "calc(100vh - 80px)",
          overflowY: "auto",
          background: "white",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
          zIndex: 101,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "22px" }}>Import Movies to Your Vault</h2>
          {canClose && (
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888", padding: "4px", lineHeight: 1 }}
            >
              ✕
            </button>
          )}
        </div>

        {phase === "welcome" && (
          <>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px", lineHeight: "1.6" }}>
              Download the template to see the exact format expected, then fill it in and import.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={downloadTemplate}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  borderRadius: "14px",
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: "26px", lineHeight: 1 }}>⬇</span>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "15px", color: "#111" }}>Download Template</div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "3px" }}>
                    CSV with correct columns and example rows
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPhase("upload")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  borderRadius: "14px",
                  border: "1px solid #c4b5fd",
                  background: "#ede9fe",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: "26px", lineHeight: 1 }}>⬆</span>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "15px", color: "#5b21b6" }}>Choose File to Import</div>
                  <div style={{ fontSize: "13px", color: "#7c3aed", marginTop: "3px" }}>
                    Upload your CSV and add movies to your Vault
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {phase === "upload" && (
          <>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px", lineHeight: "1.6" }}>
              Upload a CSV with columns: <strong>Title</strong> (required), Year, Status, Tags
              (semicolon-separated tag names), Notes. This matches the <strong>Export Vault</strong> format.
            </p>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFilePick(e.dataTransfer.files[0]); }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? "#5b21b6" : "#ddd"}`,
                borderRadius: "16px",
                padding: "40px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: dragging ? "#f5f0ff" : "#fafafa",
                transition: "border-color 0.15s, background 0.15s",
                marginBottom: "20px",
              }}
            >
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>📂</div>
              {file ? (
                <>
                  <div style={{ fontWeight: "600", fontSize: "15px", color: "#111" }}>{file.name}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Click to change file</div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: "600", fontSize: "15px", color: "#333" }}>Drop your CSV file here</div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>or click to browse</div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={(e) => handleFilePick(e.target.files[0])}
              />
            </div>

            <button
              onClick={handleImport}
              disabled={!file}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "999px",
                border: "none",
                background: file ? "#5b21b6" : "#c4b5fd",
                color: "white",
                fontWeight: "700",
                fontSize: "15px",
                cursor: file ? "pointer" : "not-allowed",
              }}
            >
              Import Movies
            </button>
          </>
        )}

        {phase === "processing" && (
          <div style={{ textAlign: "center", padding: "12px 0 24px" }}>
            <div style={{ fontSize: "14px", color: "#555", marginBottom: "16px" }}>
              Processing movie {progress.current} of {progress.total}...
            </div>
            <div style={{ background: "#f3f4f6", borderRadius: "999px", height: "8px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.round((progress.current / progress.total) * 100)}%`,
                  background: "#5b21b6",
                  borderRadius: "999px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "12px", color: "#aaa", marginTop: "10px" }}>
              Looking up movies in OMDB — this may take a moment for large imports.
            </div>
          </div>
        )}

        {phase === "done" && summary && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {summary.added.length > 0 && (
                <SummaryRow bg="#f0fdf4" border="#bbf7d0" color="#166534">
                  ✅ {summary.added.length} movie{summary.added.length !== 1 ? "s" : ""} added successfully
                </SummaryRow>
              )}
              {summary.needsReview.length > 0 && (
                <SummaryRow bg="#fffbeb" border="#fde68a" color="#78350f">
                  ⚠️ {summary.needsReview.length} movie{summary.needsReview.length !== 1 ? "s" : ""} added but need your review
                </SummaryRow>
              )}
              {summary.notFound.length > 0 && (
                <SummaryRow bg="#fef2f2" border="#fecaca" color="#991b1b">
                  ❌ {summary.notFound.length} movie{summary.notFound.length !== 1 ? "s" : ""} not found in OMDB
                </SummaryRow>
              )}
              {summary.duplicates.length > 0 && (
                <SummaryRow bg="#f8fafc" border="#e2e8f0" color="#475569">
                  🔄 {summary.duplicates.length} movie{summary.duplicates.length !== 1 ? "s" : ""} already in your Vault and skipped
                </SummaryRow>
              )}
              {summary.added.length === 0 && summary.needsReview.length === 0 && summary.notFound.length === 0 && (
                <SummaryRow bg="#f8fafc" border="#e2e8f0" color="#475569">
                  No new movies were added.
                </SummaryRow>
              )}
            </div>

            {(summary.needsReview.length > 0 || summary.notFound.length > 0) && (
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px", lineHeight: "1.5" }}>
                Use the <strong style={{ color: "#92400e" }}>⚠️ Needs Review</strong> filter in your Vault to find and correct, or delete, these movies.
              </p>
            )}

            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "999px",
                border: "none",
                background: "#5b21b6",
                color: "white",
                fontWeight: "700",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </>
        )}
      </div>
    </>
  );
}
