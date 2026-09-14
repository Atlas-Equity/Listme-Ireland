/**
 * Listme Service Fee Calculation Utility
 * 
 * Fee Tiers:
 * - 4% for €10 – €50 (all purchases up to €50 incur 4%)
 * - 3.5% for €50.01 – €250
 * - 3% for €250+
 */

export interface ServiceFeeResult {
  price: number;
  percentage: number;
  fee: number;
  total: number;
  percentageFormatted: string;
  tierLabel: string;
}

export function calculateServiceFee(price: number | string): ServiceFeeResult {
  const numericPrice = typeof price === 'string' 
    ? parseFloat(price.replace(/[^0-9.]/g, '')) || 0 
    : (Number(price) || 0);

  const cleanPrice = Math.max(0, numericPrice);

  let percentage = 4.0;
  let tierLabel = '€10 – €50 (4%)';

  if (cleanPrice <= 50) {
    percentage = 4.0;
    tierLabel = '€10 – €50 (4%)';
  } else if (cleanPrice <= 250) {
    percentage = 3.5;
    tierLabel = '€50.01 – €250.00 (3.5%)';
  } else {
    percentage = 3.0;
    tierLabel = '€250.01+ (3%)';
  }

  const fee = Math.round((cleanPrice * (percentage / 100)) * 100) / 100;
  const total = Math.round((cleanPrice + fee) * 100) / 100;

  return {
    price: cleanPrice,
    percentage,
    fee,
    total,
    percentageFormatted: `${percentage}%`,
    tierLabel,
  };
}

export const SERVICE_FEE_TIERS = [
  { range: '€10 – €50', feePercent: '4%', example: 'e.g. €25.00 purchase = €1.00 fee' },
  { range: '€50.01 – €250', feePercent: '3.5%', example: 'e.g. €100.00 purchase = €3.50 fee' },
  { range: '€250.01+', feePercent: '3%', example: 'e.g. €300.00 purchase = €9.00 fee' },
];
