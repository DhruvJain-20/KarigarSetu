import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --------------------------------------------------------------------------
  // API Routes
  // --------------------------------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Product Details & Cost Extraction Endpoint
  app.post('/api/extract-product-details', async (req, res) => {
    const { transcript, language } = req.body || {};

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Gracefully signal client to use local fallback
      return res.json({
        success: false,
        fallback: true,
        message: 'GEMINI_API_KEY not configured, using smart local parser',
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are the Karigar Setu AI Artisan Assistant. Your task is to extract accurate, structured product facts and production cost breakdowns from the following speech transcript spoken by an Indian artisan.

TRANSCRIPT:
"${transcript}"

LANGUAGE CONTEXT: ${language === 'hi' ? 'Hindi / Hinglish' : 'English / Hinglish'}

STRICT EXTRACTION RULES:
1. NEVER invent or fabricate facts not mentioned in the transcript.
2. If a specific field was NOT mentioned or implied, leave it as null (for numbers) or empty string "" (for text).
3. Extract raw numbers for costs: rawMaterialCost, labourHours, labourRate, packagingCost, transportCost, otherCosts, price.
4. Improve grammar, elegance, and clarity ONLY when composing the "description" field. Preserve cultural, geographical, and traditional craft significance.
5. Accurately categorize into one of: 'Handlooms & Textiles', 'Pottery & Terracotta', 'Paintings & Fine Art', 'Brass & Metal Crafts', 'Stone Carving & Sculptures', 'Zardozi & Embroidery', 'Handmade Leathercraft', 'Handicrafts & Decor'.
6. Return valid structured JSON conforming to the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING, description: 'Concise descriptive product title' },
              category: { type: Type.STRING, description: 'Matched trade category' },
              description: { type: Type.STRING, description: 'Polished product description' },
              material: { type: Type.STRING, description: 'Primary materials used' },
              color: { type: Type.STRING, description: 'Primary color(s)' },
              price: { type: Type.NUMBER, description: 'Artisan intended selling price in INR if mentioned' },
              currency: { type: Type.STRING, description: 'Currency code, default INR' },
              dimensions: { type: Type.STRING, description: 'Dimensions or size if mentioned' },
              weight: { type: Type.STRING, description: 'Weight if mentioned' },
              craftTechnique: { type: Type.STRING, description: 'Craft method / technique' },
              makingTime: { type: Type.STRING, description: 'Time taken to make' },
              origin: { type: Type.STRING, description: 'Place / region of origin' },
              culturalSignificance: { type: Type.STRING, description: 'Heritage or cultural significance' },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Relevant search tags',
              },
              rawMaterialCost: { type: Type.NUMBER, description: 'Raw material expense in INR' },
              labourHours: { type: Type.NUMBER, description: 'Artisan labour hours' },
              labourRate: { type: Type.NUMBER, description: 'Labour rate per hour in INR' },
              packagingCost: { type: Type.NUMBER, description: 'Packaging cost in INR' },
              transportCost: { type: Type.NUMBER, description: 'Transportation cost in INR' },
              otherCosts: { type: Type.NUMBER, description: 'Miscellaneous costs in INR' },
            },
            required: ['productName', 'category', 'description'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from Gemini');
      }

      const parsedData = JSON.parse(responseText);

      return res.json({
        success: true,
        details: parsedData,
      });
    } catch (err: any) {
      console.warn('Gemini extraction notice:', err?.message || err);
      // Fallback to local parsing on client
      return res.json({
        success: false,
        fallback: true,
        error: err?.message || 'AI extraction failed',
      });
    }
  });

  // --------------------------------------------------------------------------
  // Vite Middleware (Dev) / Static Files (Prod)
  // --------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Karigar Setu server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
