export default function Home() {
  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>🎬 FlickPick</h1>
      <p>Tell me your vibe, and I’ll pick your movie for tonight.</p>

      <input
        placeholder="Cozy, romantic, funny..."
        style={{ padding: "10px", width: "300px", marginTop: "20px" }}
      />

      <br /><br />

      <button style={{ padding: "10px 20px" }}>
        ✨ Pick My Flick
      </button>
    </main>
  );
}
