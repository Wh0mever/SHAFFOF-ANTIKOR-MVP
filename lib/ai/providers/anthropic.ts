import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const anthropic = {
  async chat(model: string, system: string, user: string): Promise<string> {
    const response = await client.messages.create({
      model,
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: user }],
    });
    const block = response.content[0];
    return block.type === "text" ? block.text : "";
  },
};
