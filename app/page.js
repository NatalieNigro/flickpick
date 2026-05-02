"use client";

// Import React tools
import { useEffect, useState } from "react";

export default function Home() {

  // -----------------------------
  // STATE VARIABLES
  // -----------------------------

  // What the user types
  const [vibe, setVibe] = useState("");

  // AI intro message
  const [intro, setIntro] = useState("");

  // List of recommended movies
  const [movies, setMovies] = useState([]);

  // Loading state (while waiting on AI)
  const [loading, setLoading] = useState(false);

  // FlickPick memory stored in browser
  const [preferences, setPreferences] = useState({
    loved: [],
    hardPass: [],
  });

  // -----------------------------
  // LOAD SAVED MEMORY
  // -----------------------------

  // When the page loads, pull memory from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("flickpickPreferences");

    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  // -----------------------------
  // SAVE MEMORY
  // -----------------------------

  function savePreferences(newPreferences) {
    setPreferences(newPreferences);

    // Save to browser so it persists between sessions
    localStorage.setItem(
      "flickpickPreferences",
      JSON.stringify(newPreferences)
    );
  }

  // -----------------------------
  // HANDLE FEEDBACK BUTTONS
  // -----------------------------

  function giveFeedback(movie, type) {

    // Helper to identify same movie
    const isSameMovie = (m) =>
      m.title === movie.title && m.year === movie.year;

    // Remove movie from both lists first (prevents duplicates)
    const newPreferences = {
      loved: preferences.loved.filter((m) => !isSameMovie(m)),
      hardPass: preferences.hardPass.filter((m) => !isSameMovie(m)),
    };

    // Add movie to correct list
    if (type === "love") {
      newPreferences.loved.push(movie);
    }

    if (type === "hardPass") {
      newPreferences.hardPass.push(movie);
    }

    savePreferences(newPreferences);
  }

  // -----------------------------
  // CALL THE AI
  // -----------------------------

  async function pickMovie() {
    setLoading(true);
    setIntro("");
    setMovies([]);

    try {
      const res = await fetch("/api/pick", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send vibe + preferences to backend
        body: JSON.stringify({ vibe, preferences }),
      });

      const data = await res.json();

      setIntro(data.intro || "");
      setMovies(data.movies || []);
    } catch (error) {
      setIntro(
        "Something went sideways. FlickPick tripped over the popcorn bucket."
      );
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  // UI RENDER
  // -----------------------------

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 24px",
        background: "linear-gradient(135deg, #f5f0ff, #faf7ff)",
      }}
    >
      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          padding: "40px",
        }}
      >

        {/* HEADER */}
        <div style={{ fontSize: "48px" }}>🎬</div>
        <h1>FlickPick</h1>

        {/* USER INPUT */}
        <textarea
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          placeholder="Describe your vibe..."
          rows={4}
          style={{ width: "100%", padding: "12px" }}
        />

        {/* BUTTON */}
        <button onClick={pickMovie}>
          {loading ? "Thinking..." : "✨ Pick My Flick"}
        </button>

        {/* AI INTRO */}
        {intro && <p>{intro}</p>}

        {/* MOVIE CARDS */}
        {movies.map((movie, index) => (
          <div key={index}>
            <h2>{movie.title}</h2>
            <p>{movie.year}</p>
            <p>{movie.why}</p>

            <button onClick={() => giveFeedback(movie, "love")}>
              👍 Love
            </button>

            <button onClick={() => giveFeedback(movie, "hardPass")}>
              👎 Pass
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
