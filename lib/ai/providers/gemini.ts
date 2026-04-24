import { GoogleGenerativeAI } from "@google/generative-ai";

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const gemini = {
  async chat(model: string, system: string, user: string): Promise<string> {
    const m = client.getGenerativeModel({ model, systemInstruction: system });
    const result = await m.generateContent(user);
    return result.response.text();
  },
};
