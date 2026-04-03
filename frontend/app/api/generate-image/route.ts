import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Змінні для легкого перемикання моделей
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "imagen-3.0-generate-001"; // або "imagen-4.0-fast-generate-001" або "gemini-2.5-flash"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, numberOfImages = 1 } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Якщо це модель Imagen або інша спеціалізована модель для зображень
    const response = await ai.models.generateImages({
      model: IMAGE_MODEL,
      prompt: prompt,
      config: {
        numberOfImages: numberOfImages,
        outputMimeType: "image/jpeg",
        // Ви можете додати aspect_ratio: "16:9" та інші параметри
      }
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("No image generated");
    }

    const base64Images = response.generatedImages.map((img: any) => img.image.imageBytes);

    return NextResponse.json({ imagesBase64: base64Images });
  } catch (error: any) {
    console.error("Error generating image:", error);
    
    // Обробка Safety Settings / Цензури
    const isSafetyError = error.message?.includes("safety") || error.status === 400; // Це залежить від того, як SDK повертає safety
    
    return NextResponse.json({ 
      error: error.message || "Failed to generate image",
      isSafetyError: isSafetyError
    }, { status: 500 });
  }
}
