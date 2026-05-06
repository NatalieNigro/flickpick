"use client";

import { useEffect, useRef, useState } from "react";
import { getTags } from "../utils/tags";

export default function TagSelector({ selectedTagIds = [], onChange }) {
  const [tags, setTags] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setTags(getTags());
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  function toggleTag(tagId) {
    const alreadySelected = selectedTagIds.includes(tagId);

    const updatedTagIds = alreadySelected
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];

    onChange(updatedTagIds);
  }

  const selectedTags = tags.filter((tag) =>
    selectedTagIds.includes(tag.id)
  );

  return (
    <div ref={containerRef} style={{ marginTop: "14px" }}>
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              style={{
                padding: "6px 10px",
                borderRadius: "999px",
                background: tag.color,
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Add Tag Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "6px 10px",
          borderRadius: "999px",
          border: "1px solid #ddd",
          background: "#ffffff",
          fontSize: "13px",
          cursor: "pointer",
        }}
      >
        + Add Tag
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            marginTop: "8px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "10px",
            background: "#fff",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            maxHeight: "160px",
            overflowY: "auto",
          }}
        >
          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);

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
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: tag.color,
                  }}
                />

                {tag.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
