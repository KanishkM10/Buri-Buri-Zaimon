import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
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

  const facialDiversityInstruction = `
  Facial Diversity Rules:
  1. 'Shinchan anime style' refers to the overall aesthetic (thick wobbly lines, flat colors), NOT just Shinnosuke’s face.
  2. Assign unique facial features to each character:
     - Varying head shapes: round, oval, square, 'onigiri' triangle.
     - Different eye styles: dot eyes, large sparkly eyes, squinted eyes, as seen in the wider Yoshito Usui universe.
  3. Ensure each character in the scene has a distinct, unique face and hairstyle. 
  4. Do NOT repeat the protagonist's (Shinnosuke) face on other boys or girls unless specifically requested.
  `;

  const negativeInstruction = `
  NEGATIVE PROMPT (Do NOT include these): Realistic, 3D, high-detail, Shinnosuke Nohara face, red shirt and yellow shorts, protagonist face, repetitive faces, same face syndrome.
  `;

  let finalPrompt = '';
  if (foundCharacter) {
    finalPrompt = `${prompt} as a character in the world of Kasukabe. Character details:${contextDescription}. 
    Style: 1990s Japanese comedy anime, thick wobbly hand-drawn outlines, flat matte colors, minimalist facial features, tiny eyes, wide mouths, Yoshito Usui aesthetic. 
    ${facialDiversityInstruction}
    ${negativeInstruction}`;
  } else {
    finalPrompt = `${prompt} as a character in the world of Kasukabe. 
    Style: 1990s Yoshito Usui art style: wobbly thick outlines, flat colors, and minimalist facial features. 
    ${facialDiversityInstruction}
    ${negativeInstruction}`;
  }
  
  try {
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
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    
    // First, look for image data
    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // If no image, check if there's a text response (refusal or error message)
    for (const part of parts) {
      if (part.text) {
        throw new Error(`AI Refusal: ${part.text}`);
      }
    }

    throw new Error("No image data or explanation returned from Gemini API.");
  } catch (error: any) {
    console.error("Gemini Image Generation Error:", error);
    if (error.message?.includes("Refusal")) {
      throw error;
    }
    throw new Error(`Generation failed: ${error.message || "Unknown error"}`);
  }
}
