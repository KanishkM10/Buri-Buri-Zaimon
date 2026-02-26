import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = 'AIzaSyBPt3aQ9iNwYUb_x9ytyw2CHTR95pYA5Wg';
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }
  return new GoogleGenAI({ apiKey });
};

export async function enhancePrompt(prompt: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Rewrite the following image generation prompt to be highly detailed, professional, and artistic. Focus on lighting, texture, composition, and style. Keep it concise but descriptive.
    
    Original Prompt: ${prompt}
    
    Enhanced Prompt:`,
  });
  
  return response.text?.trim() || prompt;
}

const characterContextMap: Record<string, string> = {
  Misae: 'Permed wavy hair, light blue shirt, green skirt, angry motherly expression.',
  Hiroshi: 'Business suit, stubble on chin, tired but kind office worker look.',
  Himawari: 'Orange swirly hair, yellow baby clothes, crawling pose.',
  Kazama: 'Blue hair, sophisticated school uniform, arrogant but cute expression.',
  Masao: 'Shaved head (onigiri shape), green outfit, crying/scared expression.',
  Nene: 'Twin pigtails, pink dress, holding a stuffed rabbit.',
  'Bo-chan': 'Stolid face, single drop of mucus from nose, vertical oval head.',
  'Buri Buri Zaimon': 'Purple pig, standing on two legs, black mask, carrying a katana.',
};

export async function generateImage(prompt: string, aspectRatio: string = "1:1"): Promise<string> {
  const ai = getAI();
  
  let contextDescription = '';
  let foundCharacter = false;
  for (const [name, description] of Object.entries(characterContextMap)) {
    if (prompt.toLowerCase().includes(name.toLowerCase())) {
      contextDescription += ` ${description}`;
      foundCharacter = true;
    }
  }

  let finalPrompt = '';
  if (foundCharacter) {
    finalPrompt = `${prompt} as a character in the world of Kasukabe. Character details:${contextDescription}. Style: 1990s Japanese comedy anime, thick wobbly hand-drawn outlines, flat matte colors, minimalist facial features, tiny eyes, wide mouths, Yoshito Usui aesthetic. Do NOT include the character Shinnosuke unless specifically asked.`;
  } else {
    finalPrompt = `${prompt} as a character in the world of Kasukabe. Style: 1990s Yoshito Usui art style: wobbly thick outlines, flat colors, and minimalist facial features. Do NOT default to Shinchan's face. Do NOT include the character Shinnosuke unless specifically asked.`;
  }
  
  // Using gemini-2.5-flash-image as it's the most reliable "Nano Banana" model for general use
  // and doesn't require the mandatory key selection dialog of the Pro version.
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        { text: finalPrompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        // @ts-ignore - Adding negative prompt as requested, though it might not be in the base type definition
        negativePrompt: "Realistic, 3D, high-detail, Shinnosuke Nohara face, red shirt and yellow shorts, protagonist face.",
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data returned from Gemini API");
}
