"use client";

import { forwardRef, useEffect, useState } from "react";
import { getTags } from "../utils/tags";

const TagSelector = forwardRef(function TagSelector(
  { selectedTagIds = [], onChange, open, onToggle },
  ref
) {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    setTags(getTags());
  }, []);

  function toggleTag(tagId) {
    const alreadySelected = selectedTagIds.includes(tagId);
    const updatedTagIds = alreadySelected
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    onChange(updatedTagIds);
  }

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));

  return (
    <div ref={ref} style={{ marginTop: "14px" }}>
      {/* Selected tag badges */}
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

      {/* Add Tag button */}
      <button
        onClick={onToggle}
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
                  padding: "4px 6px",
                  borderRadius: "8px",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    background: tag.color,
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {isSelected ? `✓ ${tag.name}` : tag.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default TagSelector;
