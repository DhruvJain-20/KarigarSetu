export type CraftComplexity = 'simple' | 'medium' | 'high' | 'very_high';
export type CraftProductType = 'handmade' | 'traditional' | 'custom' | 'limited_edition';

export interface PricingCostInputs {
  rawMaterialCost: number;
  labourHours: number;
  labourRate: number;
  packagingCost: number;
  transportCost: number;
  otherCost: number;
  profitMarginPercent: number; // e.g. 30 for 30%
  craftComplexity: CraftComplexity;
  productType: CraftProductType;
}

export interface PricingBreakdown {
  rawMaterialCost: number;
  labourHours: number;
  labourRate: number;
  labourCost: number;
  packagingCost: number;
  transportCost: number;
  otherCost: number;
  totalProductionCost: number;
  profitMarginPercent: number;
  profitAmount: number;
  basePrice: number;
  complexityAdjustmentPercent: number;
  productTypeAdjustmentPercent: number;
  totalAdjustmentPercent: number;
  craftsmanshipAdjustmentAmount: number;
  exactSuggestedPrice: number;
  recommendedPrice: number;
  minSustainablePrice: number;
  premiumPrice: number;
  reasons: string[];
}

export const COMPLEXITY_RATES: Record<CraftComplexity, { label: string; hindiLabel: string; percent: number; desc: string }> = {
  simple: {
    label: 'Simple Craft',
    hindiLabel: 'सरल शिल्प',
    percent: 0,
    desc: 'Standard assembly or basic finishing without intricate detailing.',
  },
  medium: {
    label: 'Medium Complexity',
    hindiLabel: 'मध्यम शिल्प',
    percent: 5,
    desc: 'Moderate artisanal detailing, hand carving, or woven patterning.',
  },
  high: {
    label: 'High Craftsmanship',
    hindiLabel: 'उच्च कारीगरी',
    percent: 10,
    desc: 'Intricate hand embroidery, delicate engraving, or master heritage techniques.',
  },
  very_high: {
    label: 'Master Heritage Art',
    hindiLabel: 'मास्टर विरासत शिल्प',
    percent: 15,
    desc: 'Rare generational mastercraft requiring decades of specialized artisan skill.',
  },
};

export const PRODUCT_TYPE_RATES: Record<CraftProductType, { label: string; hindiLabel: string; percent: number; desc: string }> = {
  handmade: {
    label: 'Handmade Craft',
    hindiLabel: 'हस्तनिर्मित',
    percent: 5,
    desc: '100% created by human hands with natural tactile uniqueness.',
  },
  traditional: {
    label: 'Traditional Heritage',
    hindiLabel: 'पारंपरिक विरासत',
    percent: 8,
    desc: 'Rooted in regional GI craft traditions and indigenous cultural lineage.',
  },
  custom: {
    label: 'Custom Made-to-Order',
    hindiLabel: 'अनुकूलित / कस्टम',
    percent: 12,
    desc: 'Bespoke piece tailored to individualized client specifications.',
  },
  limited_edition: {
    label: 'Limited Edition Collectible',
    hindiLabel: 'सीमित संस्करण',
    percent: 15,
    desc: 'Exclusive, numbered batch piece with high collector and heirloom value.',
  },
};

/**
 * Rounds a price into clean customer-friendly rupee figures
 * e.g., ₹1,885 -> ₹1,900 or ₹1,899
 */
export function roundToCustomerFriendlyPrice(rawAmount: number): number {
  if (rawAmount <= 0) return 0;
  if (rawAmount < 100) {
    return Math.round(rawAmount / 5) * 5; // e.g. 83 -> 85
  }
  if (rawAmount < 500) {
    return Math.round(rawAmount / 10) * 10; // e.g. 342 -> 340 or 350
  }
  if (rawAmount < 2000) {
    // Round to nearest 50 or 99
    const nearest50 = Math.round(rawAmount / 50) * 50;
    return nearest50;
  }
  // For higher items, round to nearest 100
  return Math.round(rawAmount / 100) * 100;
}

/**
 * Calculates complete transparent deterministic artisan pricing
 */
export function calculateSmartPrice(inputs: PricingCostInputs): PricingBreakdown {
  const rawMaterialCost = Math.max(0, Number(inputs.rawMaterialCost) || 0);
  const labourHours = Math.max(0, Number(inputs.labourHours) || 0);
  const labourRate = Math.max(0, Number(inputs.labourRate) || 0);
  const packagingCost = Math.max(0, Number(inputs.packagingCost) || 0);
  const transportCost = Math.max(0, Number(inputs.transportCost) || 0);
  const otherCost = Math.max(0, Number(inputs.otherCost) || 0);
  const profitMarginPercent = Math.max(0, Math.min(100, Number(inputs.profitMarginPercent) || 30));

  const complexity = inputs.craftComplexity || 'simple';
  const prodType = inputs.productType || 'handmade';

  // 1. Labour Cost
  const labourCost = Math.round(labourHours * labourRate);

  // 2. Total Production Cost
  const totalProductionCost = rawMaterialCost + labourCost + packagingCost + transportCost + otherCost;

  // 3. Profit Amount
  const profitAmount = Math.round(totalProductionCost * (profitMarginPercent / 100));

  // 4. Base Price
  const basePrice = totalProductionCost + profitAmount;

  // 5. Craftsmanship Adjustments
  const complexityRate = COMPLEXITY_RATES[complexity]?.percent || 0;
  const prodTypeRate = PRODUCT_TYPE_RATES[prodType]?.percent || 0;
  const totalAdjustmentPercent = complexityRate + prodTypeRate;

  const craftsmanshipAdjustmentAmount = Math.round(basePrice * (totalAdjustmentPercent / 100));

  // 6. Exact Suggested Price & Friendly Rounded Prices
  const exactSuggestedPrice = basePrice + craftsmanshipAdjustmentAmount;
  const recommendedPrice = roundToCustomerFriendlyPrice(exactSuggestedPrice);

  // 7. Pricing Range
  // Minimum Sustainable Price covers total production cost + minimal 10% reserve
  const minSustainablePrice = roundToCustomerFriendlyPrice(
    totalProductionCost > 0 ? totalProductionCost + Math.round(totalProductionCost * 0.1) : 0
  );

  // Premium Price adds a 15-20% exclusive collector buffer
  const premiumPrice = roundToCustomerFriendlyPrice(
    recommendedPrice > 0 ? Math.round(recommendedPrice * 1.18) : 0
  );

  // 8. Transparent Explanation Reasons
  const reasons: string[] = [];

  if (rawMaterialCost > 0) {
    reasons.push(`Covers ₹${rawMaterialCost.toLocaleString('en-IN')} in verified raw material expenses.`);
  }

  if (labourHours > 0 && labourRate > 0) {
    reasons.push(
      `Compensates ${labourHours} hours of skilled artisan labour at a fair standard rate of ₹${labourRate}/hr (₹${labourCost.toLocaleString('en-IN')}).`
    );
  }

  if (packagingCost > 0 || transportCost > 0 || otherCost > 0) {
    const prepTotal = packagingCost + transportCost + otherCost;
    reasons.push(`Includes safe packaging and dispatch preparation logistics (₹${prepTotal.toLocaleString('en-IN')}).`);
  }

  if (profitMarginPercent > 0) {
    reasons.push(`Ensures a healthy ${profitMarginPercent}% direct artisan profit margin (₹${profitAmount.toLocaleString('en-IN')}) for business sustainability.`);
  }

  if (complexityRate > 0 || prodTypeRate > 0) {
    reasons.push(
      `Applies +${totalAdjustmentPercent}% craftsmanship valuation for ${COMPLEXITY_RATES[complexity]?.label} and ${PRODUCT_TYPE_RATES[prodType]?.label}.`
    );
  }

  if (reasons.length === 0) {
    reasons.push('Covers essential production expenses and guarantees fair artisan living wages with 0% marketplace commission.');
  }

  return {
    rawMaterialCost,
    labourHours,
    labourRate,
    labourCost,
    packagingCost,
    transportCost,
    otherCost,
    totalProductionCost,
    profitMarginPercent,
    profitAmount,
    basePrice,
    complexityAdjustmentPercent: complexityRate,
    productTypeAdjustmentPercent: prodTypeRate,
    totalAdjustmentPercent,
    craftsmanshipAdjustmentAmount,
    exactSuggestedPrice,
    recommendedPrice: recommendedPrice || (totalProductionCost > 0 ? totalProductionCost : 0),
    minSustainablePrice: minSustainablePrice || totalProductionCost,
    premiumPrice: premiumPrice || recommendedPrice,
    reasons,
  };
}
