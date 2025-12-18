
import { GoogleGenAI } from "@google/genai";

export const generatePromotionalText = async (
  songTitle: string,
  artistName: string,
  genre: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const prompt = `Generate a short, exciting promotional blurb (around 40-60 words) for a new music release.
    Song Title: "${songTitle}", Artist: "${artistName}", Genre: ${genre}. Catchy and suitable for social media.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text?.trim() || "Promosyon metni oluşturulamadı.";
  } catch (error) {
    return "AI ile içerik oluşturulurken bir hata oluştu.";
  }
};

export const generateArtwork = async (
  songTitle: string,
  artistName: string,
  genre: string
): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const prompt = `Professional album artwork for "${songTitle}" by "${artistName}". Genre: ${genre}. 4k resolution, square, artistic.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};
