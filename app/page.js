"use client";

// Import React tools.
// useEffect lets us load saved memory when the page opens.
// useState lets the app remember things while the user is using it.
import { useEffect, useState } from "react";

export default function Home() {
  // -----------------------------
  // APP STATE
  // -----------------------------

  // What the user types into the movie mood box.
  const [vibe, setVibe] = useState("");

  // The playful intro FlickPick returns before the movie cards.
  const [intro, setIntro] = useState("");

  // The list of movie recommendations returned by the AI.
  const [movies, setMovies] = useState([]);

  // Tracks whether FlickPick is currently waiting for an AI response.
  const [loading, setLoading] = useState(false);

  // FlickPick's saved memory.
  // For now, this lives in the user's browser using localStorage.
  const [preferences, setPreferences] = useState({
    loved: [],
    hardPass: [],
  });

  // -----------------------------
  // LOAD SAVED MEMORY
  // -----------------------------

  // When the page first opens, check the browser for saved FlickPick memory.
  useEffect(() => {
    const saved = localStorage.getItem("flickpickPreferences");

    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  // -----------------------------
  // SAVE MEMORY
  // -----------------------------

  // Updates FlickPick memory in both the app and the browser.
  function savePreferences(newPreferences) {
    setPreferences(newPreferences);
    localStorage.setItem("flickpickPreferences", JSON.stringify(newPreferences));
  }

  // -----------------------------
  // ADD OR CHANGE A MOVIE RATING
  // -----------------------------

  // Handles when the user clicks "Love this" or "Hard pass."
  // If the movie already exists in the opposite list, it removes it first.
  function giveFeedback(movie, type) {
    const isSameMovie = (m) => m.title === movie.title && m.year === movie.year;

    const newPreferences = {
      loved: preferences.loved.filter((m) => !isSameMovie(m)),
      hardPass: preferences.hardPass.filter((m) => !isSameMovie(m)),
    };

    if (type === "love") {
      newPreferences.loved.push(movie);
    }

    if (type === "hardPass") {
      newPreferences.hardPass.push(movie);
    }

    savePreferences(newPreferences);
  }

  // -----------------------------
  // CLEAR A MOVIE RATING
  // -----------------------------

  // Removes a movie from FlickPick memory entirely.
  // This is Trouble's "sober second thought" button.
  function clearRating(movie) {
    const isSameMovie = (m) => m.title === movie.title && m.year === movie.year;

    const newPreferences = {
      loved: preferences.loved.filter((m) => !isSameMovie(m)),
      hardPass: preferences.hardPass.filter((m) => !isSameMovie(m)),
    };

    savePreferences(newPreferences);
  }

  // -----------------------------
  // ASK AI FOR MOVIE PICKS
  // -----------------------------

  // Sends the user's vibe and saved preferences to the API route.
  async function pickMovie() {
    setLoading(true);
    setIntro("");
    setMovies([]);

    try {
      const res = await fetch("/api/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe, preferences }),
      });

      const data = await res.json();

      setIntro(data.intro || "");
      setMovies(data.movies || []);
    } catch (error) {
      setIntro("Something went sideways. FlickPick tripped over the popcorn bucket.");
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  // PAGE DESIGN
  // -----------------------------

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 24px",
        fontFamily: "Arial, sans-serif",
        background: "linear-gradient(135deg, #f5f0ff, #faf7ff)",
        color: "#222",
      }}
    >
      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div style={{ fontSize: "48px" }}>🎬</div>

        <h1 style={{ fontSize: "42px", margin: "0 0 10px" }}>
          FlickPick
        </h1>

        <p style={{ fontSize: "18px", marginBottom: "28px" }}>
          Tell me your movie mood, and I’ll help pick something worth curling up for.
        </p>

        {/* User input box */}
        <textarea
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          placeholder="Cozy, romantic, funny... maybe something with banter, but no emotional devastation tonight."
          rows={4}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "16px",
            borderRadius: "16px",
            border: "1px solid #ddd",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />

        {/* Pick button */}
        <button
          onClick={pickMovie}
          disabled={loading || !vibe.trim()}
          style={{
            marginTop: "18px",
            padding: "14px 24px",
            fontSize: "16px",
            borderRadius: "999px",
            border: "none",
            cursor: loading || !vibe.trim() ? "not-allowed" : "pointer",
            background: loading || !vibe.trim() ? "#ddd" : "#111827",
            color: "white",
          }}
        >
          {loading ? "Consulting the popcorn gods..." : "✨ Pick My Flick"}
        </button>

        {/* AI intro message */}
        {intro && (
          <p style={{ marginTop: "32px", fontSize: "18px", lineHeight: "1.5" }}>
            {intro}
          </p>
        )}

        {/* Movie recommendation cards */}
        {movies.length > 0 && (
          <div
            style={{
              marginTop: "24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            {movies.map((movie, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "22px",
                  padding: "24px",
                  background: "#fafafa",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
                  minHeight: "270px",
                }}
              >
                <h2 style={{ marginTop: 0, fontSize: "22px" }}>
                  {movie.title}
                </h2>

                <p style={{ color: "#666", marginTop: "-8px" }}>
                  {movie.year}
                </p>

                <p style={{ lineHeight: "1.6" }}>
                  {movie.why}
                </p>

                {/* Feedback buttons for current recommendations */}
                <div style={{ marginTop: "18px", display: "flex", gap: "10px" }}>
                  <button onClick={() => giveFeedback(movie, "love")}>
                    👍 Love this
                  </button>

                  <button onClick={() => giveFeedback(movie, "hardPass")}>
                    👎 Hard pass
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FlickPick memory editor */}
        {(preferences.loved.length > 0 || preferences.hardPass.length > 0) && (
          <div
            style={{
              marginTop: "34px",
              padding: "24px",
              borderRadius: "18px",
              background: "#fafafa",
              border: "1px solid #eee",
              fontSize: "14px",
              color: "#555",
            }}
          >
            <h3 style={{ marginTop: 0 }}>FlickPick memory</h3>

            {/* Loved list */}
            <h4>Loved</h4>

            {preferences.loved.length === 0 ? (
              <p>None yet</p>
            ) : (
              preferences.loved.map((movie, index) => (
                <div key={`loved-${index}`} style={{ marginBottom: "10px" }}>
                  <strong>{movie.title}</strong> ({movie.year}){" "}

                  <button onClick={() => giveFeedback(movie, "hardPass")}>
                    Move to Hard pass
                  </button>{" "}

                  <button onClick={() => clearRating(movie)}>
                    Clear
                  </button>
                </div>
              ))
            )}

            {/* Hard pass list */}
            <h4>Hard pass</h4>

            {preferences.hardPass.length === 0 ? (
              <p>None yet</p>
            ) : (
              preferences.hardPass.map((movie, index) => (
                <div key={`hardpass-${index}`} style={{ marginBottom: "10px" }}>
                  <strong>{movie.title}</strong> ({movie.year}){" "}

                  <button onClick={() => giveFeedback(movie, "love")}>
                    Move to Loved
                  </button>{" "}

                  <button onClick={() => clearRating(movie)}>
                    Clear
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}
