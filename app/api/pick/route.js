export async function POST(req) {
  const { vibe, memory, tasteProfile, tags } = await req.json();

  const totalMovies = (memory || []).length;
  const hasUMPP = !!(tasteProfile && tasteProfile.trim());
  const requestTasteProfile = totalMovies > 100 && !hasUMPP;

  function getTagName(id) {
    return tags?.find((t) => t.id === id)?.name || null;
  }

  // -----------------------------
  // BUILD PROMPT CONTENT BY MODE
  // -----------------------------

  let userContent;

  if (totalMovies > 100 && hasUMPP) {
    // Mode 2: >100 movies + UMPP — concise (loved + notes, not interested, hard pass, profile)
    const lovedList =
      memory
        .filter((m) => m.status === "loved")
        .map((m) =>
          m.notes ? `${m.title} (${m.year}) — "${m.notes}"` : `${m.title} (${m.year})`
        )
        .join("\n") || "none yet";

    const notInterestedList =
      memory
        .filter((m) => m.status === "notInterested")
        .map((m) => `${m.title} (${m.year})`)
        .join(", ") || "none yet";

    const hardPassList =
      memory
        .filter((m) => m.status === "hardPass")
        .map((m) =>
          m.notes ? `${m.title} (${m.year}) — "${m.notes}"` : `${m.title} (${m.year})`
        )
        .join(", ") || "none yet";

    userContent = `Tonight's vibe: ${vibe}

My taste profile: ${tasteProfile}

Movies I loved:
${lovedList}

Movies I never want to see: ${notInterestedList}

Movies that are a hard pass: ${hardPassList}`;
  } else {
    // Mode 1 (≤100 movies) or Mode 3 (>100, no UMPP): full lists
    const lovedList =
      memory
        ?.filter((m) => m.status === "loved")
        .map((m) =>
          m.notes ? `${m.title} (${m.year}) — "${m.notes}"` : `${m.title} (${m.year})`
        )
        .join("\n") || "none yet";

    const wantToWatchList =
      memory
        ?.filter((m) => m.status === "wantToWatch")
        .map((m) => `${m.title} (${m.year})`)
        .join(", ") || "none yet";

    const mehList =
      memory
        ?.filter((m) => m.status === "meh")
        .map((m) => `${m.title} (${m.year})`)
        .join(", ") || "none yet";

    const notInterestedList =
      memory
        ?.filter((m) => m.status === "notInterested")
        .map((m) => `${m.title} (${m.year})`)
        .join(", ") || "none yet";

    const hardPassList =
      memory
        ?.filter((m) => m.status === "hardPass")
        .map((m) =>
          m.notes ? `${m.title} (${m.year}) — "${m.notes}"` : `${m.title} (${m.year})`
        )
        .join(", ") || "none yet";

    const tagMoviesMap = new Map();
    memory?.filter((m) => m.status === "loved").forEach((m) => {
      (m.tagIds || []).forEach((tagId) => {
        const tagName = getTagName(tagId);
        if (tagName) {
          if (!tagMoviesMap.has(tagName)) tagMoviesMap.set(tagName, []);
          tagMoviesMap.get(tagName).push(`${m.title} (${m.year})`);
        }
      });
    });
    const tagLines = [...tagMoviesMap.entries()]
      .map(([name, movies]) => `Movies tagged "${name}": ${movies.join(", ")}`)
      .join("\n");
    const tagLine = tagLines ? `\n${tagLines}` : "";

    const umppLine = hasUMPP ? `\nMy taste profile: ${tasteProfile}\n` : "";

    userContent = `Tonight's vibe: ${vibe}
${umppLine}
Movies I loved:
${lovedList}

Movies I want to watch: ${wantToWatchList}

Movies I felt meh about: ${mehList}

Movies I'm not interested in: ${notInterestedList}

Movies that are a hard pass: ${hardPassList}${tagLine}`;
  }

  // -----------------------------
  // SYSTEM PROMPT
  // -----------------------------

  const tasteProfileInstruction = requestTasteProfile
    ? ` Also include a "tasteProfile" field: a concise plain-text paragraph (2–4 sentences) capturing what this person enjoys in movies, based on patterns in their Loved and Hard Pass lists. Write it in second person (e.g. "You tend to love...").`
    : "";

  const responseShape = requestTasteProfile
    ? `{ "intro": "...", "movies": [...], "tasteProfile": "..." }`
    : `{ "intro": "...", "movies": [...] }`;

  const systemPrompt = `You are FlickPick, a cozy, witty movie recommendation assistant. Use the user's saved movie memory to make smarter suggestions. Never recommend movies marked Hard Pass or Not Interested. NEVER recommend movies that appear in the Want to Watch list. Treat Want to Watch movies the same as Hard Pass movies — they are completely off limits for recommendations. Notes on Loved and Hard Pass movies reveal why the user feels that way — use them. Tags signal genre and mood preferences — each tag line tells you exactly which movies share that quality.${tasteProfileInstruction} Return ONLY valid JSON with this shape: ${responseShape} where movies is exactly 3 items, each with { "title": "...", "year": "...", "why": "..." }.`;

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
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  });

  const openAIData = await openAIResponse.json();
  const content = openAIData.choices?.[0]?.message?.content;
  const aiResult = JSON.parse(content);

  // -----------------------------
  // ASK OMDb FOR MOVIE DETAILS
  // -----------------------------

  async function omdbLookup(title, year) {
    const params = new URLSearchParams({ t: title, plot: "full", apikey: process.env.OMDB_API_KEY });
    if (year) params.set("y", year);
    const res = await fetch(`https://www.omdbapi.com/?${params}`);
    return res.json();
  }

  async function getOmdbDetails(movie) {
    let data = await omdbLookup(movie.title, movie.year);

    const simplifiedTitle = movie.title.split(":")[0].trim();
    if (
      (data.Response === "False" || data.Poster === "N/A") &&
      simplifiedTitle.toLowerCase() !== movie.title.toLowerCase()
    ) {
      const retry = await omdbLookup(simplifiedTitle, movie.year);
      if (retry.Response !== "False") {
        if (data.Response === "False") {
          data = retry;
        } else if (retry.Poster !== "N/A") {
          data = { ...data, Poster: retry.Poster };
        }
      }
    }

    if (data.Response === "False") {
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
      title: data.Title || movie.title,
      year: data.Year || movie.year,
      poster: data.Poster !== "N/A" ? data.Poster : "",
      genre: data.Genre || "Genre unavailable",
      actors: data.Actors || "Actors unavailable",
      plot: data.Plot || "",
      imdbRating: data.imdbRating || "",
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
    ...(aiResult.tasteProfile ? { tasteProfile: aiResult.tasteProfile } : {}),
  });
}
