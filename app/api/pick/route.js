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
      messages: [
        {
          role: "system",
          content:
            "You are FlickPick, a cozy, witty movie recommendation assistant. Suggest 3 movies based on the user's vibe. Keep tone warm, slightly playful, and conversational. Include a short explanation for each.",
        },
        {
          role: "user",
          content: `My movie vibe tonight is: ${vibe}`,
        },
      ],
    }),
  });

  const data = await response.json();

  return Response.json({
    result: data.choices[0].message.content,
  });
}
