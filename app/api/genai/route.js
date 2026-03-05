import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// initialize server-side client using env vars; will throw if no key
const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const { system, user } = await req.json();
  const model = process.env.GEMINI_MODEL || "gemini-3-pro-preview";

  const response = await client.models.generateContent({
    model,
    contents: `${system}\n\n${user}`,
  });

  return NextResponse.json({ text: response.text || "" });
}