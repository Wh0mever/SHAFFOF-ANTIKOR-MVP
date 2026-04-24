export const perplexity = {
  async chat(model: string, system: string, user: string): Promise<string> {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 1500,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
  },
};
