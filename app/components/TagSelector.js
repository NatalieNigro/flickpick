"use client";

import MovieCard from "./MovieCard";

export default function MovieGrid({
  movies,
  memory,
  setMovieStatus,
  updateMovieTags,
}) {
  if (movies.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: "24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "22px",
      }}
    >
      {movies.map((movie, index) => (
        <MovieCard
          key={`${movie.title}-${movie.year}-${index}`}
          movie={movie}
          memory={memory}
          setMovieStatus={setMovieStatus}
          updateMovieTags={updateMovieTags}
        />
      ))}
    </div>
  );
}
