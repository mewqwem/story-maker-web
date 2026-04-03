import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Змінні для легкого перемикання моделей
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash"; // або gemini-2.5-flash-lite

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idea, count } = body;

    if (!idea || !count) {
      return NextResponse.json({ error: "Missing idea or count" }, { status: 400 });
    }

    const systemInstruction = `Тобі зараз прийде текст від користувача з запросом на створення картинок. Твоє завдання написати ${count} промптів в форматі JSON [{"title": "...", "prompt": "..."}] на основі інпуту користувача. Всі промпти мають бути англійською мовою та дуже детальними.`;

    const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: idea,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
        }
    });

    if (!response.text) {
      throw new Error("No response from Gemini");
    }

    const jsonText = response.text;
    const prompts = JSON.parse(jsonText);

    return NextResponse.json(prompts);
  } catch (error: any) {
    console.error("Error generating prompts:", error);
    return NextResponse.json({ error: error.message || "Failed to generate prompts" }, { status: 500 });
  }
}
