import { GoogleGenAI } from "@google/genai";

const googleAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request) {
  const { prompt } = await request.json();
  const response = await googleAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  return Response.json({ text: response.text });
}