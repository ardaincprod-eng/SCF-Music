
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully, but for this context, an error is fine.
  // The environment is expected to provide the API key.
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generatePromotionalText = async (
  songTitle: string,
  artistName: string,
  genre: string
): Promise<string> => {
  if (!API_KEY) {
    return "AI service is unavailable. Please check API key configuration.";
  }
  
  try {
    const prompt = `Generate a short, exciting promotional blurb (around 40-60 words) for a new music release.
    
    Song Title: "${songTitle}"
    Artist: "${artistName}"
    Genre: ${genre}
    
    The blurb should be catchy and suitable for social media or a press release. Highlight the vibe of the song based on its genre.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;

    if (!text) {
      return "Could not generate promotional text. Please try again.";
    }

    return text.trim();
  } catch (error) {
    console.error("Error generating promotional text:", error);
    return "An error occurred while generating content with AI. Please try again later.";
  }
};

export const generateArtwork = async (
  songTitle: string,
  artistName: string,
  genre: string
): Promise<string | null> => {
  if (!API_KEY) return null;

  try {
    const prompt = `Album artwork for a song titled "${songTitle}" by artist "${artistName}". Genre: ${genre}. 
    High quality, creative, square format, digital art, minimal text, visually striking 4k resolution.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating artwork:", error);
    return null;
  }
};
