import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Models for easy switching
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "imagen-3.0-generate-001"; 

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, numberOfImages = 1, aspectRatio = "1:1", resolution = "1k" } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Enhance prompt with resolution if needed (Imagen doesn't have a direct "4k" resolution param, but adding it to prompt helps)
    const finalPrompt = resolution && resolution !== "1k" ? `${prompt}, ${resolution} resolution, highly detailed, 8k uhd, dslr` : prompt;

    const response = await ai.models.generateImages({
      model: IMAGE_MODEL,
      prompt: finalPrompt,
      config: {
        numberOfImages: numberOfImages,
        outputMimeType: "image/jpeg",
        aspectRatio: aspectRatio,
      }
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("No image generated");
    }

    const base64Images = response.generatedImages.map((img: any) => img.image.imageBytes);

    return NextResponse.json({ imagesBase64: base64Images });
  } catch (error: any) {
    console.error("Error generating image:", error);
    
    const isSafetyError = error.message?.includes("safety") || error.status === 400; 
    
    return NextResponse.json({ 
      error: error.message || "Failed to generate image",
      isSafetyError: isSafetyError
    }, { status: 500 });
  }
}
