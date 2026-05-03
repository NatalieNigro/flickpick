// -----------------------------------------------------------
// TAG STORAGE
// This file handles saving and loading user-defined tags.
// For now, tags live in the browser using localStorage.
// Later, this can be swapped to Supabase without every page
// needing to know how the data is stored.
// -----------------------------------------------------------

const TAGS_KEY = "flickpickTags";

// These are starter color choices for tags.
// Keeping colors preset prevents unreadable neon chaos.
export const TAG_COLORS = [
  { name: "Purple", value: "#ede9fe" },
  { name: "Pink", value: "#fce7f3" },
  { name: "Blue", value: "#dbeafe" },
  { name: "Green", value: "#dcfce7" },
  { name: "Yellow", value: "#fef3c7" },
  { name: "Orange", value: "#ffedd5" },
  { name: "Red", value: "#fee2e2" },
  { name: "Sky Blue", value: "#e0f2fe" },
];;

// Load all saved tags from the browser
export function getTags() {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(TAGS_KEY);
  return data ? JSON.parse(data) : [];
}

// Save the full tag list to the browser
export function saveTags(tags) {
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
}

// Create a simple ID from the tag name.
// Example: "Watch with Trouble" becomes "watch-with-trouble"
export function createTagId(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Create a new tag object
export function createTag(name, color) {
  return {
    id: createTagId(name),
    name: name.trim(),
    color,
  };
}
