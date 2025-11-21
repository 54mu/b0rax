import { GoogleGenAI } from "@google/genai";
import { BoraDataPoint } from "../types";

// Initialize Gemini
// NOTE: We assume process.env.API_KEY is available for Gemini as per system instructions.
// If the user hasn't set up the proxy/env for this app specifically, this might fail gracefully.
const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateBoraAnalysis = async (data: BoraDataPoint[]): Promise<string> => {
  if (!ai) {
    return "API Key Gemini non trovata. Impossibile generare l'analisi AI.";
  }

  // Summarize data for the prompt to save tokens
  const summary = data.map(d => 
    `${d.dateStr} ${d.timeOfDay}: Diff ${d.diff}hPa`
  ).join('\n');

  const prompt = `
    Sei un esperto meteorologo di Trieste, famoso per il tuo tono ironico e preciso.
    Analizza i seguenti dati sulla differenza di pressione tra Maribor e Trieste (Delta P).
    Un Delta positivo indica Bora.
    
    Soglie:
    > 4 hPa: Bora percepibile
    > 8 hPa: Bora forte
    > 12 hPa: Bora scura/violenta

    Dati previsti (prossimi 5 giorni):
    ${summary}

    Compito:
    1. Identifica il momento peggiore (picco massimo).
    2. Dai un consiglio pratico ai triestini (es. legare il motorino, occhio ai vasi, non uscire).
    3. Usa uno stile conciso, "triestino" ma comprensibile (massimo 3 frasi).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Impossibile generare l'analisi al momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Errore nella comunicazione con l'oracolo della Bora (Gemini).";
  }
};
