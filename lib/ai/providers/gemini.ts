import { GoogleGenerativeAI } from "@google/generative-ai";

let _client: GoogleGenerativeAI | null = null;
function getClient(): GoogleGenerativeAI {
  if (!_client) {
    if (!process.env.GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY is not set");
    _client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }
  return _client;
}

export const gemini = {
  async chat(model: string, system: string, user: string): Promise<string> {
    const m = getClient().getGenerativeModel({ model, systemInstruction: system });
    const result = await m.generateContent(user);
    return result.response.text();
  },
};
