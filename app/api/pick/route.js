// This API route does two jobs:
// 1. Ask OpenAI for movie recommendations
// 2. Ask OMDb for richer movie details like poster, genre, actors, and plot

export async function POST(req) {
  const { vibe, memory } = await req.json();

  // -----------------------------
  // ORGANIZE SAVED MEMORY FOR AI
  // -----------------------------

  const loved =
    memory
      ?.filter((movie) => movie.status === "loved")
      .map((movie) => `${movie.title} (${movie.year})`)
      .join(", ") || "none yet";

  const wantToWatch =
    memory
      ?.filter((movie) => movie.status === "wantToWatch")
      .map((movie) => `${movie.title} (${movie.year})`)
      .join(", ") || "none yet";

  const notInterested =
    memory
      ?.filter((movie) => movie.status === "notInterested")
      .map((movie) => `${movie.title} (${movie.year})`)
      .join(", ") || "none yet";

  const meh =
    memory
      ?.filter((movie) => movie.status === "meh")
      .map((movie) => `${movie.title} (${movie.year})`)
      .join(", ") || "none yet";

  const hardPass =
    memory
      ?.filter((movie) => movie.status === "hardPass")
      .map((movie) => `${movie.title} (${movie.year})`)
      .join(", ") || "none yet";

  // -----------------------------
  // ASK OPENAI FOR 3 MOVIE PICKS
  // -----------------------------

  const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are FlickPick, a cozy, witty movie recommendation assistant. Use the user's saved movie memory to make smarter suggestions. Do not recommend movies marked Hard Pass or Not Interested. Avoid recommending movies already marked Want to Watch unless the user asks to revisit saved options. Return ONLY valid JSON with this exact shape: { \"intro\": \"short playful intro\", \"movies\": [ { \"title\": \"Movie Title\", \"year\": \"Year\", \"why\": \"Short warm explanation of why this fits the user's vibe and preferences\" } ] }. Recommend exactly 3 movies.",
        },
        {
          role: "user",
          content: `Tonight's vibe: ${vibe}

Movies the user loved: ${loved}

Movies the user wants to watch: ${wantToWatch}

Movies the user felt meh about: ${meh}

Movies the user is not interested in: ${notInterested}

Movies the user marked hard pass: ${hardPass}`,
        },
      ],
    }),
  });

  const openAIData = await openAIResponse.json();
  const content = openAIData.choices?.[0]?.message?.content;
  const aiResult = JSON.parse(content);

  // -----------------------------
  // ASK OMDb FOR MOVIE DETAILS
  // -----------------------------

  async function getOmdbDetails(movie) {
    const params = new URLSearchParams({
      t: movie.title,
      y: movie.year,
      apikey: process.env.OMDB_API_KEY,
    });

    const omdbResponse = await fetch(`https://www.omdbapi.com/?${params.toString()}`);
    const omdbData = await omdbResponse.json();

    // If OMDb does not find a match, keep the AI result and fill in graceful blanks
    if (omdbData.Response === "False") {
      return {
        ...movie,
        poster: "",
        genre: "Genre unavailable",
        actors: "Actors unavailable",
        plot: "",
        omdbFound: false,
      };
    }

    return {
      ...movie,
      title: omdbData.Title || movie.title,
      year: omdbData.Year || movie.year,
      poster: omdbData.Poster !== "N/A" ? omdbData.Poster : "",
      genre: omdbData.Genre || "Genre unavailable",
      actors: omdbData.Actors || "Actors unavailable",
      plot: omdbData.Plot || "",
      imdbRating: omdbData.imdbRating || "",
      omdbFound: true,
    };
  }

  const enrichedMovies = await Promise.all(
    aiResult.movies.map((movie) => getOmdbDetails(movie))
  );

  // -----------------------------
  // SEND ENRICHED RESULTS BACK
  // -----------------------------

  return Response.json({
    intro: aiResult.intro,
    movies: enrichedMovies,
  });
}
