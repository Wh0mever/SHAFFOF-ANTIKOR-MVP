import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const openai = {
  async chat(model: string, system: string, user: string): Promise<string> {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 500,
    });
    return response.choices[0]?.message?.content ?? "";
  },
};
