export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const params = new URLSearchParams(searchParams);
  params.set("apikey", process.env.OMDB_API_KEY);

  const res = await fetch(`https://www.omdbapi.com/?${params}`);
  const data = await res.json();
  return Response.json(data);
}
