"use client";

import { useEffect, useState } from "react";
import PickListCard from "../components/PickListCard";
import { getPickList, removeFromPickList } from "../utils/pickList";

export default function PickListPage() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    setMovies(getPickList());
  }, []);

  function handleRemove(movie) {
    removeFromPickList(movie.title, movie.year);
    setMovies(getPickList());
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
          maxWidth: "1100px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: "38px", marginTop: 0 }}>
          🎬 Pick List
        </h1>

        <p style={{ fontSize: "17px", lineHeight: "1.5", marginBottom: "28px" }}>
          This is your “maybe tonight, maybe later” pile. Trouble would say this is
          where movies wait patiently while you pretend you’re going to make a quick
          decision.
        </p>

        {movies.length === 0 ? (
          <p style={{ color: "#777", fontSize: "16px" }}>
            No movies saved yet. Go back to FlickPick and add a few contenders.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {movies.map((movie, index) => (
              <PickListCard
                key={`${movie.title}-${movie.year}-${index}`}
                movie={movie}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
