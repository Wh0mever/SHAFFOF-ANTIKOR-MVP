import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export const anthropic = {
  async chat(model: string, system: string, user: string): Promise<string> {
    const response = await getClient().messages.create({
      model,
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: user }],
    });
    const block = response.content[0];
    return block && block.type === "text" ? block.text : "";
  },
};
