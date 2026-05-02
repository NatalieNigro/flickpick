export async function POST(req) {
  const { vibe } = await req.json();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            "You are FlickPick, a cozy, witty movie recommendation assistant. Return ONLY valid JSON with this exact shape: { \"intro\": \"short playful intro\", \"movies\": [ { \"title\": \"Movie Title\", \"year\": \"Year\", \"why\": \"Short warm explanation of why this fits the user's vibe\" } ] }. Recommend exactly 3 movies.",
        },
        {
          role: "user",
          content: `My movie vibe tonight is: ${vibe}`,
        },
      ],
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  return Response.json(JSON.parse(content));
}
