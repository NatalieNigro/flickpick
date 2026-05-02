"use client";

import { useEffect, useState } from "react";

export default function MemoryPage() {

  // Store memory locally
  const [preferences, setPreferences] = useState({
    loved: [],
    hardPass: [],
  });

  // Load saved memory on page load
  useEffect(() => {
    const saved = localStorage.getItem("flickpickPreferences");

    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  // Save updates
  function savePreferences(newPreferences) {
    setPreferences(newPreferences);
    localStorage.setItem(
      "flickpickPreferences",
      JSON.stringify(newPreferences)
    );
  }

  // Move movie between categories
  function giveFeedback(movie, type) {
    const isSameMovie = (m) =>
      m.title === movie.title && m.year === movie.year;

    const newPreferences = {
      loved: preferences.loved.filter((m) => !isSameMovie(m)),
      hardPass: preferences.hardPass.filter((m) => !isSameMovie(m)),
    };

    if (type === "love") newPreferences.loved.push(movie);
    if (type === "hardPass") newPreferences.hardPass.push(movie);

    savePreferences(newPreferences);
  }

  // Remove movie entirely
  function clearRating(movie) {
    const isSameMovie = (m) =>
      m.title === movie.title && m.year === movie.year;

    const newPreferences = {
      loved: preferences.loved.filter((m) => !isSameMovie(m)),
      hardPass: preferences.hardPass.filter((m) => !isSameMovie(m)),
    };

    savePreferences(newPreferences);
  }

  return (
    <main style={{ padding: "40px" }}>
      <h1>FlickPick Memory</h1>

      {/* LOVED LIST */}
      <h2>👍 Loved</h2>
      {preferences.loved.map((movie, i) => (
        <div key={i}>
          {movie.title}
          <button onClick={() => giveFeedback(movie, "hardPass")}>
            Move to Pass
          </button>
          <button onClick={() => clearRating(movie)}>Clear</button>
        </div>
      ))}

      {/* HARD PASS LIST */}
      <h2>👎 Hard Pass</h2>
      {preferences.hardPass.map((movie, i) => (
        <div key={i}>
          {movie.title}
          <button onClick={() => giveFeedback(movie, "love")}>
            Move to Loved
          </button>
          <button onClick={() => clearRating(movie)}>Clear</button>
        </div>
      ))}
    </main>
  );
}
