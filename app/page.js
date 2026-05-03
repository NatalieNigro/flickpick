"use client";

import { useEffect, useState } from "react";
import MovieCard from "./components/MovieCard";

export default function Home() {
  // What the user types
  const [vibe, setVibe] = useState("");

  // AI intro text
  const [intro, setIntro] = useState("");

  // Movies returned from AI
  const [movies, setMovies] = useState([]);

  // Loading state (while AI is thinking)
  const [loading, setLoading] = useState(false);

  // Stored user preferences (memory)
  const [memory, setMemory] = useState([]);

  // When the page loads, grab saved data from browser
  useEffect(() => {
    const savedMemory = localStorage.getItem("flickpickMemory");

    if (savedMemory) {
      setMemory(JSON.parse(savedMemory));
    }
  }, []);

  // Save updated memory
  function saveMemory(newMemory) {
    setMemory(newMemory);
    localStorage.setItem("flickpickMemory", JSON.stringify(newMemory));
  }

  // Update a movie’s status (Want to Watch, Loved, etc.)
  function setMovieStatus(movie, status) {
    const updated = [...memory.filter(
      (m) => !(m.title === movie.title && m.year === movie.year)
    ), { ...movie, status }];

    saveMemory(updated);
  }

  // Call your backend to get recommendations
  async function pickMovie() {
    setLoading(true);

    const res = await fetch("/api/pick", {
      method: "POST",
      body: JSON.stringify({ vibe, memory }),
    });

    const data = await res.json();

    setIntro(data.intro);
    setMovies(data.movies);

    setLoading(false);
  }

  return (
    <main>
      <h1>FlickPick</h1>

      {/* User types their vibe */}
      <textarea
        value={vibe}
        onChange={(e) => setVibe(e.target.value)}
      />

      <button onClick={pickMovie}>
        {loading ? "Thinking..." : "Pick My Flick"}
      </button>

      {/* AI intro */}
      <p>{intro}</p>

      {/* Movie list */}
      <div>
        {movies.map((movie, index) => (
          <MovieCard
            key={index}
            movie={movie}
            memory={memory}
            setMovieStatus={setMovieStatus}
          />
        ))}
      </div>
    </main>
  );
}
