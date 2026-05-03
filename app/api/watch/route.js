export async function POST(request) {
  try {
    const { title, year } = await request.json();

    // This pulls your secret Watchmode key from Vercel.
    // The key stays on the server and is never exposed to users.
    const apiKey = process.env.WATCHMODE_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Watchmode API key is missing." },
        { status: 500 }
      );
    }

    // Step 1: Search Watchmode for the movie by title.
    // We include the year to help Watchmode find the correct version.
    const searchUrl = `https://api.watchmode.com/v1/search/?apiKey=${apiKey}&search_field=name&search_value=${encodeURIComponent(
      `${title} ${year || ""}`
    )}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    const bestMatch = searchData.title_results?.[0];

    if (!bestMatch) {
      return Response.json({
        sources: [],
        message: "No Watchmode match found for this movie.",
      });
    }

    // Step 2: Use Watchmode's internal title ID to get streaming sources.
    // Region US keeps this focused on what a Texas/US user can access.
    const sourcesUrl = `https://api.watchmode.com/v1/title/${bestMatch.id}/sources/?apiKey=${apiKey}&regions=US`;

    const sourcesResponse = await fetch(sourcesUrl);
    const sources = await sourcesResponse.json();

    return Response.json({
      watchmodeId: bestMatch.id,
      sources,
    });
  } catch (error) {
    return Response.json(
      { error: "Could not fetch where-to-watch information." },
      { status: 500 }
    );
  }
}
