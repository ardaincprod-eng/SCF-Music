
import { GoogleGenAI } from "@google/genai";

const getEnv = (key: string): string | undefined => {
  try {
    return (window as any).process?.env?.[key] || (import.meta as any).env?.[key] || undefined;
  } catch {
    return undefined;
  }
};

const API_KEY = getEnv('API_KEY');

const ai = new GoogleGenAI({ apiKey: API_KEY || "" });

export const generatePromotionalText = async (
  songTitle: string,
  artistName: string,
  genre: string
): Promise<string> => {
  if (!API_KEY) {
    return "AI servisi şu an yapılandırılmamış. Lütfen çevre değişkenlerini kontrol edin.";
  }
  
  try {
    const prompt = `Generate a short, exciting promotional blurb (around 40-60 words) for a new music release.
    
    Song Title: "${songTitle}"
    Artist: "${artistName}"
    Genre: ${genre}
    
    The blurb should be catchy and suitable for social media or a press release. Highlight the vibe of the song based on its genre.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    const text = response.text;

    if (!text) {
      return "Promosyon metni oluşturulamadı.";
    }

    return text.trim();
  } catch (error) {
    console.error("Error generating promotional text:", error);
    return "AI ile içerik oluşturulurken bir hata oluştu.";
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
