import { GoogleGenAI, Type } from "@google/genai";
import { PortfolioConfig } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert web designer assisting Congolese creatives.
Generate a JSON configuration for their portfolio website based on their description.
Target audience: local clients in DRC. Prices in USD.
`;

export const generatePortfolioConfig = async (
  userDescription: string, 
  currentConfig?: PortfolioConfig
): Promise<PortfolioConfig> => {
  
  const model = "gemini-3-flash-preview";
  // Logic preserved for future real implementation, currently the UI uses mock data.
  // Returning a rejected promise or basic object to satisfy type checker if called.
  return Promise.resolve({
      theme: { primaryColor: 'text-gold-400', style: 'modern' },
      sections: []
  });
};