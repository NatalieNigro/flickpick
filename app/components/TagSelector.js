"use client";

import { useEffect, useState } from "react";
import { getTags } from "../utils/tags";

export default function TagSelector({ selectedTagIds = [], onChange }) {
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

  if (!Array.isArray(tags) || tags.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "#777", marginTop: "12px" }}>
        No tags yet. Create tags in Settings.
      </p>
    );
  }

  return (
    <div style={{ marginTop: "14px" }}>
      <p style={{ fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>
        Tags:
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);

          return (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              style={{
                padding: "7px 10px",
                borderRadius: "999px",
                border: isSelected ? "2px solid #5b21b6" : "1px solid #ddd",
                background: tag.color,
                fontWeight: isSelected ? "700" : "500",
                cursor: "pointer",
              }}
            >
              {tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
