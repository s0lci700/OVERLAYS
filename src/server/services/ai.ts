import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Summarizes session logs into a "Chronicle".
 */
export async function summarizeChronicle(logs: string[]): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `
    You are the Chronologist of the TableRelay project.
    Your task is to take these event logs from a D&D session and synthesize them into a single, cohesive, evocative narrative paragraph.
    Use a "Digital Grimoire" tone: archaic yet concise. Avoid filler.
    
    Logs:
    ${logs.join('\n')}
    
    Chronicle:
  `;
  
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

/**
 * Formats a single event into a human-readable "Scribe's Ghost" summary.
 */
export async function formatGhostSummary(event: string, data: any): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `
    Summarize this D&D game event into a single, short bullet point for a session log.
    Focus on what actually happened to the characters.
    
    Event: ${event}
    Data: ${JSON.stringify(data)}
    
    Bullet point:
  `;
  
  const result = await model.generateContent(prompt);
  return result.response.text().trim().replace(/^[*-]\s*/, '');
}

/**
 * Generates an NPC/Location image description (Portrait of Nameless).
 */
export async function generateVisualPrompt(description: string): Promise<string> {
  // We use Gemini to refine the prompt for an image generator (like Imagen/DALL-E)
  // Even if we don't have an image generator hooked up yet, we prepare the prompt.
  const styleLock = "Charcoal and ink on aged vellum, high contrast, sketch-book style, dark fantasy aesthetic.";
  return `${styleLock} ${description}`;
}
