import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export async function processLensImage(base64Image: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "Identify the product in this image. Return the product name, brand, and SKU if visible. Format as JSON." }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          brand: { type: Type.STRING },
          sku: { type: Type.STRING }
        }
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "{}");
}

export async function semanticSearch(query: string, availableItems: any[]) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user is looking for: "${query}". 
    Here is a list of available items in nearby stores: ${JSON.stringify(availableItems)}.
    Return a list of the top 3 most similar or equivalent items from the list, prioritizing utility. 
    Format as JSON array of objects with {sku, confidence_score, reason}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sku: { type: Type.STRING },
            confidence_score: { type: Type.NUMBER },
            reason: { type: Type.STRING }
          }
        }
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "[]");
}

export async function googleShoppingSearch(query: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Search for product details for: "${query}". 
    Focus on finding the current market price, brand, and a brief description. 
    Format as JSON object with {name, brand, price, description}.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          brand: { type: Type.STRING },
          price: { type: Type.NUMBER },
          description: { type: Type.STRING }
        }
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "{}");
}

export async function transcribeAudio(base64Audio: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { inlineData: { data: base64Audio, mimeType: "audio/wav" } },
          { text: "Transcribe this audio search query for a product inventory system." }
        ]
      }
    ]
  });

  const response = await model;
  return response.text;
}

export async function findNearbyStores(productName: string, location: { lat: number, lng: number }) {
  const model = ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Quais lojas físicas vendem "${productName}" perto de mim?`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: location.lat,
            longitude: location.lng
          }
        }
      }
    },
  });

  const response = await model;
  
  // Extract URLs from grounding chunks as required by guidelines
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const mapsLinks = groundingChunks?.filter((chunk: any) => chunk.maps?.uri).map((chunk: any) => ({
    title: chunk.maps.title,
    uri: chunk.maps.uri
  })) || [];

  return {
    text: response.text,
    links: mapsLinks
  };
}
