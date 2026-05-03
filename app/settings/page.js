"use client";

import { useEffect, useState } from "react";
import { getTags, saveTags, createTag, TAG_COLORS } from "../utils/tags";

export default function SettingsPage() {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);

  useEffect(() => {
    setTags(getTags());
  }, []);

  function updateTags(newTags) {
    setTags(newTags);
    saveTags(newTags);
  }

  function handleAddTag() {
    const trimmedName = newTagName.trim();

    if (!trimmedName) return;

    const newTag = createTag(trimmedName, newTagColor);

    const alreadyExists = tags.some((tag) => tag.id === newTag.id);

    if (alreadyExists) {
      alert("That tag already exists.");
      return;
    }

    updateTags([...tags, newTag]);
    setNewTagName("");
    setNewTagColor(TAG_COLORS[0].value);
  }

  function handleRenameTag(tagId, newName) {
    const trimmedName = newName.trim();

    if (!trimmedName) return;

    const updatedTags = tags.map((tag) =>
      tag.id === tagId ? { ...tag, name: trimmedName } : tag
    );

    updateTags(updatedTags);
  }

  function handleChangeColor(tagId, newColor) {
    const updatedTags = tags.map((tag) =>
      tag.id === tagId ? { ...tag, color: newColor } : tag
    );

    updateTags(updatedTags);
  }

  function handleDeleteTag(tagId) {
    const updatedTags = tags.filter((tag) => tag.id !== tagId);
    updateTags(updatedTags);
  }

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
          maxWidth: "900px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: "38px", marginTop: 0 }}>Settings</h1>

        <p style={{ fontSize: "17px", lineHeight: "1.5", marginBottom: "28px" }}>
          Create and manage your movie tags here. Later, this page can also hold
          your genre preferences, streaming services, and other FlickPick settings.
        </p>

        <h2>Tags</h2>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Example: Watch with Trouble"
            style={{
              flex: "1",
              minWidth: "240px",
              padding: "12px",
              borderRadius: "14px",
              border: "1px solid #ddd",
              fontSize: "15px",
            }}
          />

          <select
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "14px",
              border: "1px solid #ddd",
            }}
          >
            {TAG_COLORS.map((color) => (
              <option key={color.value} value={color.value}>
                {color.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddTag}
            style={{
              padding: "12px 16px",
              borderRadius: "999px",
              border: "none",
              background: "#5b21b6",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Add Tag
          </button>
        </div>

        {tags.length === 0 ? (
          <p style={{ color: "#777" }}>
            No tags yet. Add your first one and give your Vault a little personality.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {tags.map((tag) => (
              <div
                key={tag.id}
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  alignItems: "center",
                  padding: "16px",
                  borderRadius: "18px",
                  background: "#fafafa",
                  border: "1px solid #eee",
                }}
              >
                <span
                  style={{
                    padding: "8px 12px",
                    borderRadius: "999px",
                    background: tag.color,
                    fontWeight: "700",
                  }}
                >
                  {tag.name}
                </span>

                <input
                  defaultValue={tag.name}
                  onBlur={(e) => handleRenameTag(tag.id, e.target.value)}
                  style={{
                    flex: "1",
                    minWidth: "200px",
                    padding: "10px",
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                  }}
                />

                <select
                  value={tag.color}
                  onChange={(e) => handleChangeColor(tag.id, e.target.value)}
                  style={{
                    padding: "10px",
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                  }}
                >
                  {TAG_COLORS.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "999px",
                    border: "1px solid #ddd",
                    background: "white",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
