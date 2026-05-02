export async function POST(req) {
  const { vibe, preferences } = await req.json();

  const loved = preferences?.loved?.map((m) => `${m.title} (${m.year})`).join(", ") || "none yet";
  const hardPass = preferences?.hardPass?.map((m) => `${m.title} (${m.year})`).join(", ") || "none yet";

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
            "You are FlickPick, a cozy, witty movie recommendation assistant. Use the user's saved preferences to make smarter suggestions. Do not recommend movies listed as hard pass. Return ONLY valid JSON with this exact shape: { \"intro\": \"short playful intro\", \"movies\": [ { \"title\": \"Movie Title\", \"year\": \"Year\", \"why\": \"Short warm explanation of why this fits the user's vibe and preferences\" } ] }. Recommend exactly 3 movies.",
        },
        {
          role: "user",
          content: `Tonight's vibe: ${vibe}

Movies the user loved: ${loved}

Movies the user marked hard pass: ${hardPass}`,
        },
      ],
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  return Response.json(JSON.parse(content));
}
