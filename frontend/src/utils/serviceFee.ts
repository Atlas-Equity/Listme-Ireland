/**
 * Listme Service Fee Calculation Utility
 * 
 * Fee Tiers:
 * - €0.00 – €50.00: 0% fee (Completely fee-free!)
 * - €50.01 – €150.00: 3.5% fee
 * - €150.01+: 3% fee
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

  let percentage = 0.0;
  let tierLabel = '€0.00 – €50.00 (0% Fee Free)';

  if (cleanPrice <= 50) {
    percentage = 0.0;
    tierLabel = '€0.00 – €50.00 (0% Fee Free)';
  } else if (cleanPrice <= 150) {
    percentage = 3.5;
    tierLabel = '€50.01 – €150.00 (3.5%)';
  } else {
    percentage = 3.0;
    tierLabel = '€150.01+ (3%)';
  }

  const fee = cleanPrice <= 50 ? 0 : Math.round((cleanPrice * (percentage / 100)) * 100) / 100;
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
  { range: '€0.00 – €50.00', feePercent: '0%', example: 'First €50 is completely fee-free (€0.00 fee)' },
  { range: '€50.01 – €150.00', feePercent: '3.5%', example: 'e.g. €80.00 purchase = €2.80 fee' },
  { range: '€150.01+', feePercent: '3%', example: 'e.g. €250.00 purchase = €7.50 fee' },
];

