"use client";

export default function PickListCard({ movie, onRemove }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "18px",
        alignItems: "stretch",
        padding: "16px",
        borderRadius: "22px",
        background: "#fafafa",
        border: "1px solid #eee",
        boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
      }}
    >
      {/* This is just a visual grab handle for now */}
      <div
        title="Reordering coming soon"
        style={{
          display: "flex",
          alignItems: "center",
          color: "#999",
          fontSize: "22px",
          cursor: "grab",
          userSelect: "none",
          padding: "0 4px",
        }}
      >
        ⋮⋮
      </div>

      {/* Small poster */}
      {movie.poster ? (
        <img
          src={movie.poster}
          alt={`${movie.title} poster`}
          style={{
            width: "95px",
            height: "140px",
            objectFit: "cover",
            borderRadius: "14px",
            background: "#eee",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: "95px",
            height: "140px",
            borderRadius: "14px",
            background: "#eee",
            color: "#777",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontSize: "13px",
            padding: "8px",
            flexShrink: 0,
          }}
        >
          Poster unavailable
        </div>
      )}

      {/* Movie details */}
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "22px" }}>
          {movie.title}
        </h2>

        <p style={{ color: "#666", margin: "0 0 12px" }}>
          {movie.year}
        </p>

        {movie.genre && (
          <p style={{ fontSize: "14px", color: "#444", margin: "0 0 8px" }}>
            <strong>Genre:</strong> {movie.genre}
          </p>
        )}

        {movie.imdbRating && movie.imdbRating !== "N/A" && (
          <p style={{ fontSize: "14px", color: "#444", margin: "0 0 8px" }}>
            <strong>IMDb:</strong> {movie.imdbRating}
          </p>
        )}

        {movie.plot && (
          <p style={{ fontSize: "14px", lineHeight: "1.5", color: "#666", margin: 0 }}>
            <strong>Plot:</strong> {movie.plot}
          </p>
        )}
      </div>

      {/* Remove button */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <button
          onClick={() => onRemove(movie)}
          style={{
            padding: "10px 14px",
            borderRadius: "999px",
            border: "1px solid #ddd",
            background: "#ffffff",
            cursor: "pointer",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
