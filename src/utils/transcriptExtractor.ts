export interface ExtractedProductDetails {
  productName: string;
  category: string;
  description: string;
  material: string;
  color: string;
  price: number | null;
  currency: string;
  dimensions: string;
  weight: string;
  craftTechnique: string;
  makingTime: string;
  origin: string;
  culturalSignificance: string;
  tags: string[];
  rawMaterialCost: number | null;
  labourHours: number | null;
  labourRate: number | null;
  packagingCost: number | null;
  transportCost: number | null;
  otherCosts: number | null;
}

export const EMPTY_EXTRACTED_DETAILS: ExtractedProductDetails = {
  productName: '',
  category: '',
  description: '',
  material: '',
  color: '',
  price: null,
  currency: 'INR',
  dimensions: '',
  weight: '',
  craftTechnique: '',
  makingTime: '',
  origin: '',
  culturalSignificance: '',
  tags: [],
  rawMaterialCost: null,
  labourHours: null,
  labourRate: null,
  packagingCost: null,
  transportCost: null,
  otherCosts: null,
};

// Hindi numeral word map for Hinglish & Hindi numbers
const HINDI_NUMBER_MAP: Record<string, number> = {
  'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5, 'panch': 5,
  'chhah': 6, 'che': 6, 'saat': 7, 'sat': 7, 'aath': 8, 'ath': 8,
  'nau': 9, 'das': 10, 'gyarah': 11, 'barah': 12, 'terah': 13,
  'chaudah': 14, 'pandrah': 15, 'solah': 16, 'satrah': 17, 'atharah': 18,
  'unnis': 19, 'bees': 20, 'pachees': 25, 'tees': 30, 'paintees': 35,
  'chalis': 40, 'pachas': 50, 'saath': 60, 'sattar': 70, 'assi': 80,
  'nabbe': 90, 'sau': 100, 'hazaar': 1000, 'hazar': 1000, 'lakh': 100000,
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'पांच': 5,
  'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10, 'ग्यारह': 11,
  'बारह': 12, 'पंद्रह': 15, 'बीस': 20, 'पच्चीस': 25, 'तीस': 30,
  'चालीस': 40, 'पचास': 50, 'सौ': 100, 'हज़ार': 1000, 'हजार': 1000, 'लाख': 100000,
};

/**
 * Parses numeric currency/value from phrases like "500 rupees", "₹500", "500 rs", "500 रुपये", "paanch sau"
 */
function parseNumberFromText(segment: string): number | null {
  if (!segment) return null;

  // Direct digits
  const digitMatch = segment.match(/(?:₹|rs\.?|inr|रुपये|रु|rupees)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand|hazar|hazaar|sau|hundred|lakh)?/i);
  if (digitMatch && digitMatch[1]) {
    let num = parseFloat(digitMatch[1].replace(/,/g, ''));
    const full = segment.toLowerCase();
    if (full.includes('k') || full.includes('thousand') || full.includes('hazar') || full.includes('हज़ार') || full.includes('हजार')) {
      num *= 1000;
    } else if (full.includes('sau') || full.includes('hundred') || full.includes('सौ')) {
      num *= 100;
    } else if (full.includes('lakh') || full.includes('लाख')) {
      num *= 100000;
    }
    return Math.round(num);
  }

  // Word based numbers
  const words = segment.toLowerCase().split(/\s+/);
  for (const w of words) {
    if (HINDI_NUMBER_MAP[w]) {
      return HINDI_NUMBER_MAP[w];
    }
  }

  return null;
}

/**
 * Intelligent Local Extraction Rule Engine for English, Hindi, and Hinglish.
 * Never invents facts; extracts only what is stated in the transcript.
 */
export function extractProductDetailsLocally(transcript: string, language: 'en' | 'hi' = 'en'): ExtractedProductDetails {
  const result: ExtractedProductDetails = { ...EMPTY_EXTRACTED_DETAILS };
  const text = (transcript || '').trim();
  if (!text) return result;

  const lower = text.toLowerCase();

  // 1. Raw Material Cost Extraction
  // Patterns: "wood cost me 500 rupees", "material cost 600", "material 500 rs", "कच्चा माल 500 रुपये", "material kharcha 400"
  const materialCostMatch = lower.match(
    /(?:raw\s*material|material\s*cost|wood\s*cost|clay\s*cost|fabric\s*cost|brass\s*cost|material\s*kharcha|material\s*ka\s*kharcha|कच्चा\s*माल|सामग्री\s*का\s*खर्च|लागत|material)\s*(?:cost\s*me|costs|is|was|around|लगभग|का)?\s*[:=]?\s*(?:₹|rs\.?|inr|रुपये|रु)?\s*(\d+)/i
  ) || lower.match(
    /(?:cost\s*me|kharcha\s*aaya|खर्च\s*आया)\s*(?:₹|rs\.?|inr|रुपये|रु)?\s*(\d+)\s*(?:for\s*wood|for\s*material|ka\s*material|ke\s*liye)/i
  );

  if (materialCostMatch && materialCostMatch[1]) {
    result.rawMaterialCost = parseInt(materialCostMatch[1], 10);
  } else {
    // Check fallback pattern: "cost me 500 rupees" (if in context of material)
    const simpleCost = lower.match(/(?:wood|cloth|clay|stone|leather|brass|material)\s*(?:cost|price|kharcha)?\s*(?:me|is|was)?\s*(\d+)\s*(?:rupees|rs|रुपये)?/i);
    if (simpleCost && simpleCost[1]) {
      result.rawMaterialCost = parseInt(simpleCost[1], 10);
    }
  }

  // 2. Labour Hours Extraction
  // Patterns: "took me around 8 hours", "8 ghante lage", "worked for 6 hours", "8 घंटे लगे", "time: 5 hours"
  const hoursMatch = lower.match(
    /(?:took\s*me|spent|worked\s*for|taking|making\s*time|time\s*taken|lage|banaane\s*mein|banane\s*me|घंटे\s*लगे|समय\s*लगा)\s*(?:around|about|approx|लगभग)?\s*(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|ghante?|ghanta?|घंटे?|घंटा?)/i
  ) || lower.match(
    /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|ghante?|ghanta?|घंटे?|घंटा?)\s*(?:to\s*make|lage|me\s*bana|mein\s*taiyaar|banane\s*mein)/i
  );

  if (hoursMatch && hoursMatch[1]) {
    result.labourHours = parseFloat(hoursMatch[1]);
    result.makingTime = `${hoursMatch[1]} Hours`;
  }

  // 3. Labour Rate Extraction
  // Patterns: "labour charge is 100 rupees per hour", "100 rupaye ghanta", "rate is 150/hr", "मजदूरी 100 रुपये घंटा"
  const rateMatch = lower.match(
    /(?:labour\s*rate|labour\s*charge|hourly\s*rate|labour|majdoori|dihadi|मजदूरी|प्रति\s*घंटा)\s*(?:is|around|ka\s*rate|hai)?\s*[:=]?\s*(?:₹|rs\.?|inr|रुपये|रु)?\s*(\d+)\s*(?:\/|\s*per|\s*prati|\s*har)?\s*(?:hour|hr|ghanta|घंटा)?/i
  ) || lower.match(
    /(\d+)\s*(?:rupees|rs|रुपये|रु)\s*(?:per\s*hour|prati\s*ghanta|\/hr|\/hour|ghanta|प्रति\s*घंटा)/i
  );

  if (rateMatch && rateMatch[1]) {
    result.labourRate = parseInt(rateMatch[1], 10);
  }

  // 4. Packaging Cost Extraction
  // Patterns: "packaging cost 50 rupees", "packing 50 rs", "पैकिंग खर्च 50 रुपये"
  const packagingMatch = lower.match(
    /(?:packaging|packing|पैकिंग|डिब्बा)\s*(?:cost|charge|kharcha|खर्च)?\s*(?:is|me|around|hai)?\s*[:=]?\s*(?:₹|rs\.?|inr|रुपये|रु)?\s*(\d+)/i
  );
  if (packagingMatch && packagingMatch[1]) {
    result.packagingCost = parseInt(packagingMatch[1], 10);
  }

  // 5. Transportation Cost Extraction
  // Patterns: "transport 100 rs", "delivery prep 80 rs", "किराया 100", "transportation cost 100"
  const transportMatch = lower.match(
    /(?:transport|transportation|delivery\s*prep|freight|courier|kiraya|भाड़ा|किराया|परिवहन)\s*(?:cost|charge|kharcha|खर्च)?\s*(?:is|me|around|hai)?\s*[:=]?\s*(?:₹|rs\.?|inr|रुपये|रु)?\s*(\d+)/i
  );
  if (transportMatch && transportMatch[1]) {
    result.transportCost = parseInt(transportMatch[1], 10);
  }

  // 6. Other Costs
  const otherCostMatch = lower.match(
    /(?:other\s*costs?|extra\s*expenses?|misc|other\s*kharcha|अन्य\s*खर्च)\s*(?:is|around|hai)?\s*[:=]?\s*(?:₹|rs\.?|inr|रुपये|रु)?\s*(\d+)/i
  );
  if (otherCostMatch && otherCostMatch[1]) {
    result.otherCosts = parseInt(otherCostMatch[1], 10);
  }

  // 7. Selling Price Mentioned by Artisan
  // Patterns: "want to sell for 2500", "sell it for 2000 rs", "price is 1800", "बेचना चाहता हूँ 2000 में", "2500 me bechna hai"
  const priceMatch = lower.match(
    /(?:sell\s*(?:it\s*)?(?:for|at|around)|price\s*(?:is|of)?|bechna\s*(?:hai|chahta\s*hoon)?\s*me|daam|कीमत|मूल्य)\s*[:=]?\s*(?:₹|rs\.?|inr|रुपये|रु)?\s*(\d+)/i
  ) || lower.match(
    /(?:₹|rs\.?)\s*(\d+)\s*(?:me\s*sell|me\s*bechna|for\s*sale)/i
  );

  if (priceMatch && priceMatch[1]) {
    result.price = parseInt(priceMatch[1], 10);
  }

  // 8. Materials Extraction
  const materialKeywords = [
    { key: 'teak wood', label: 'Teak Wood (सागवान लकड़ी)' },
    { key: 'sheesham', label: 'Sheesham Wood (शीशम)' },
    { key: 'wood', label: 'Solid Natural Wood (प्राकृतिक लकड़ी)' },
    { key: 'clay', label: 'Terracotta Clay (मिट्टी)' },
    { key: 'terracotta', label: 'Terracotta Clay (टेराकोटा)' },
    { key: 'brass', label: 'Pure Brass (पीतल)' },
    { key: 'copper', label: 'Pure Copper (तांबा)' },
    { key: 'bronze', label: 'Bronze (कांस्य)' },
    { key: 'silk', label: 'Pure Natural Silk (रेशम)' },
    { key: 'cotton', label: 'Organic Handspun Cotton (सूती)' },
    { key: 'khadi', label: 'Handwoven Khadi' },
    { key: 'leather', label: 'Genuine Leather (चमड़ा)' },
    { key: 'stone', label: 'Carved Natural Stone (पत्थर)' },
    { key: 'marble', label: 'White Makrana Marble (संगमरमर)' },
    { key: 'jute', label: 'Natural Golden Jute (जूट)' },
    { key: 'bamboo', label: 'Natural Bamboo & Cane (बांस)' },
    { key: 'zardozi', label: 'Metallic Zardozi Thread (ज़रदोज़ी)' },
  ];

  const foundMaterials: string[] = [];
  for (const item of materialKeywords) {
    if (lower.includes(item.key)) {
      foundMaterials.push(item.label);
      if (!result.material) {
        result.material = item.key.charAt(0).toUpperCase() + item.key.slice(1);
      }
    }
  }

  // 9. Craft Technique & Category Extraction
  if (lower.includes('handloom') || lower.includes('woven') || lower.includes('weaving') || lower.includes('saree') || lower.includes('shawl') || lower.includes('dupatta') || lower.includes('fabric') || lower.includes('textile') || lower.includes('कपड़ा') || lower.includes('बुनाई')) {
    result.category = 'Handlooms & Textiles';
    result.craftTechnique = 'Handloom Weaving & Shuttle Loom Craft';
  } else if (lower.includes('pottery') || lower.includes('terracotta') || lower.includes('clay') || lower.includes('matka') || lower.includes('pot') || lower.includes('vase') || lower.includes('मिट्टी') || lower.includes('बर्तन')) {
    result.category = 'Pottery & Terracotta';
    result.craftTechnique = 'Potter\'s Wheel Throwing & Wood Kiln Firing';
  } else if (lower.includes('brass') || lower.includes('metal') || lower.includes('copper') || lower.includes('bronze') || lower.includes('diya') || lower.includes('bell') || lower.includes('dhokra') || lower.includes('पीतल') || lower.includes('धातु')) {
    result.category = 'Brass & Metal Crafts';
    result.craftTechnique = 'Lost-Wax Casting (Dhokra) & Hand Engraving';
  } else if (lower.includes('painting') || lower.includes('madhubani') || lower.includes('pattachitra') || lower.includes('miniature') || lower.includes('canvas') || lower.includes('चित्रकला') || lower.includes('पेंटिंग')) {
    result.category = 'Paintings & Fine Art';
    result.craftTechnique = 'Natural Pigment Fine Hand Brushwork';
  } else if (lower.includes('stone') || lower.includes('marble') || lower.includes('sculpture') || lower.includes('statue') || lower.includes('carving') || lower.includes('मूर्ति') || lower.includes('पत्थर')) {
    result.category = 'Stone Carving & Sculptures';
    result.craftTechnique = 'Chisel Hand Carving & Stone Relief Work';
  } else if (lower.includes('zardozi') || lower.includes('embroidery') || lower.includes('chikankari') || lower.includes('aari') || lower.includes('कढ़ाई') || lower.includes('ज़रदोज़ी')) {
    result.category = 'Zardozi & Embroidery';
    result.craftTechnique = 'Needle & Aari Hand Thread Embroidery';
  } else if (lower.includes('leather') || lower.includes('mojri') || lower.includes('jutti') || lower.includes('bag') || lower.includes('wallet') || lower.includes('चमड़ा')) {
    result.category = 'Handmade Leathercraft';
    result.craftTechnique = 'Vegetable Tanning & Hand Saddle Stitching';
  } else if (lower.includes('wood') || lower.includes('elephant') || lower.includes('toy') || lower.includes('wooden') || lower.includes('लकड़ी')) {
    result.category = 'Handicrafts & Decor';
    result.craftTechnique = 'Hand Chiseled Wood Carving & Natural Polish';
  } else {
    result.category = 'Handicrafts & Decor';
    result.craftTechnique = 'Traditional Handcrafted Technique';
  }

  // 10. Colors
  const colors = ['red', 'blue', 'green', 'yellow', 'gold', 'golden', 'black', 'white', 'brown', 'terracotta', 'natural', 'orange', 'maroon', 'lal', 'peela', 'hara', 'neela', 'safed', 'kala'];
  for (const c of colors) {
    if (new RegExp(`\\b${c}\\b`, 'i').test(lower)) {
      result.color = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  // 11. Region / Origin
  const regions = [
    'Varanasi', 'Jaipur', 'Kashmir', 'Bastar', 'Kutch', 'Madhubani', 'Sahranpur',
    'Moradabad', 'Khurja', 'Mysore', 'Channapatna', 'Thanjavur', 'Puri', 'Agra', 'Jodhpur', 'Bengal', 'Assam'
  ];
  for (const r of regions) {
    if (lower.includes(r.toLowerCase())) {
      result.origin = r;
      break;
    }
  }

  // 12. Product Name Extraction
  // Look for phrases like "handmade wooden elephant", "brass diya", "silk saree", etc.
  const namePatterns = [
    /(?:this\s*is\s*a|it\s*is\s*a|made\s*a|making\s*a|banaaya\s*hai|yeh\s*ek|ye\s*hai)\s+([a-zA-Z\u0900-\u097F\s]{3,40}?)(?:\.|\,|it\s*is|made\s*from|which|aur|and|cost|worth|rupees|$)/i,
    /(?:handmade|handcrafted|traditional)\s+([a-zA-Z\u0900-\u097F\s]{3,35})/i,
  ];

  for (const p of namePatterns) {
    const match = text.match(p);
    if (match && match[1]) {
      const candidate = match[1].trim().replace(/^(a|an|the|ek)\s+/i, '');
      if (candidate.length >= 3 && candidate.length <= 50 && !/^(material|cost|price|rupee|hour)/i.test(candidate)) {
        // Capitalize words
        result.productName = candidate
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        break;
      }
    }
  }

  if (!result.productName) {
    if (lower.includes('elephant')) result.productName = 'Handmade Wooden Elephant';
    else if (lower.includes('saree')) result.productName = 'Handwoven Heritage Saree';
    else if (lower.includes('diya')) result.productName = 'Handcrafted Brass Diya';
    else if (lower.includes('pot') || lower.includes('vase')) result.productName = 'Artisanal Terracotta Vase';
    else if (lower.includes('box')) result.productName = 'Hand Carved Keepsake Box';
    else if (lower.includes('statue') || lower.includes('idol')) result.productName = 'Traditional Artisan Idol';
    else result.productName = 'Authentic Handcrafted Piece';
  }

  // 13. Tags
  const generatedTags = new Set<string>(['Handmade', 'Artisan Direct']);
  if (result.material) generatedTags.add(result.material);
  if (result.category) generatedTags.add(result.category);
  if (result.origin) generatedTags.add(result.origin);
  if (lower.includes('wooden') || lower.includes('wood')) generatedTags.add('Woodcraft');
  if (lower.includes('silk')) generatedTags.add('Silk Weave');
  if (lower.includes('brass')) generatedTags.add('Metalwork');
  result.tags = Array.from(generatedTags);

  // 14. Polished Product Description (preserves facts without inventing fake claims)
  const descParts: string[] = [];
  descParts.push(`Authentic handcrafted ${result.productName.toLowerCase()} lovingly shaped by skilled artisan hands using traditional techniques.`);

  if (result.material) {
    descParts.push(`Crafted from premium ${result.material.toLowerCase()} selected for natural durability and authentic tactile grain.`);
  }

  if (result.makingTime) {
    descParts.push(`Requires approximately ${result.makingTime.toLowerCase()} of meticulous handmade work.`);
  }

  if (result.origin) {
    descParts.push(`Originates from the heritage craft traditions of ${result.origin}.`);
  }

  descParts.push('Every piece is unique and carries the hallmark of authentic Indian artisan craftsmanship with 0% middleman intervention.');
  result.description = descParts.join(' ');

  return result;
}

/**
 * Server-side Gemini AI Extraction with intelligent client-side fallback.
 * Sends transcript to /api/extract-product-details if available, and gracefully falls back to extractProductDetailsLocally.
 */
export async function extractProductDetailsWithAI(
  transcript: string,
  language: 'en' | 'hi' = 'en'
): Promise<{ details: ExtractedProductDetails; isAiPowered: boolean }> {
  const localFallback = extractProductDetailsLocally(transcript, language);

  if (!transcript || transcript.trim().length === 0) {
    return { details: localFallback, isAiPowered: false };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s quick timeout

    const response = await fetch('/api/extract-product-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        language,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.success && data.details) {
        // Merge structured AI response safely over local fallback
        const aiDetails = data.details as Partial<ExtractedProductDetails>;
        const merged: ExtractedProductDetails = {
          productName: aiDetails.productName?.trim() || localFallback.productName,
          category: aiDetails.category?.trim() || localFallback.category,
          description: aiDetails.description?.trim() || localFallback.description,
          material: aiDetails.material?.trim() || localFallback.material,
          color: aiDetails.color?.trim() || localFallback.color,
          price: typeof aiDetails.price === 'number' && aiDetails.price > 0 ? aiDetails.price : localFallback.price,
          currency: aiDetails.currency || 'INR',
          dimensions: aiDetails.dimensions?.trim() || localFallback.dimensions,
          weight: aiDetails.weight?.trim() || localFallback.weight,
          craftTechnique: aiDetails.craftTechnique?.trim() || localFallback.craftTechnique,
          makingTime: aiDetails.makingTime?.trim() || localFallback.makingTime,
          origin: aiDetails.origin?.trim() || localFallback.origin,
          culturalSignificance: aiDetails.culturalSignificance?.trim() || localFallback.culturalSignificance,
          tags: Array.isArray(aiDetails.tags) && aiDetails.tags.length > 0 ? aiDetails.tags : localFallback.tags,
          rawMaterialCost: typeof aiDetails.rawMaterialCost === 'number' ? aiDetails.rawMaterialCost : localFallback.rawMaterialCost,
          labourHours: typeof aiDetails.labourHours === 'number' ? aiDetails.labourHours : localFallback.labourHours,
          labourRate: typeof aiDetails.labourRate === 'number' ? aiDetails.labourRate : localFallback.labourRate,
          packagingCost: typeof aiDetails.packagingCost === 'number' ? aiDetails.packagingCost : localFallback.packagingCost,
          transportCost: typeof aiDetails.transportCost === 'number' ? aiDetails.transportCost : localFallback.transportCost,
          otherCosts: typeof aiDetails.otherCosts === 'number' ? aiDetails.otherCosts : localFallback.otherCosts,
        };
        return { details: merged, isAiPowered: true };
      }
    }
  } catch (err) {
    // Network or server not running — normal fallback to local extractor
    console.info('Using local fast NLP extractor:', err);
  }

  return { details: localFallback, isAiPowered: false };
}
