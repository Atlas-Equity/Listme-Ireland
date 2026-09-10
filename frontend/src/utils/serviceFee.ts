/**
 * Listme Service Fee Calculation Utility
 * 
 * Fee Tiers:
 * - €0.00 – €20.00: 4% fee
 * - €20.01 – €100.00: 3.5% fee
 * - €100.01 – €250.00: 3% fee
 * - €250.01+: 3% fee
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

  let percentage = 3.0;
  let tierLabel = '€250.01+ (3%)';

  if (cleanPrice <= 20) {
    percentage = 4.0;
    tierLabel = '€0.00 – €20.00 (4%)';
  } else if (cleanPrice <= 100) {
    percentage = 3.5;
    tierLabel = '€20.01 – €100.00 (3.5%)';
  } else if (cleanPrice <= 250) {
    percentage = 3.0;
    tierLabel = '€100.01 – €250.00 (3%)';
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
  { range: '€0.00 – €20.00', feePercent: '4%', example: 'e.g. €15.00 purchase = €0.60 fee' },
  { range: '€20.01 – €100.00', feePercent: '3.5%', example: 'e.g. €50.00 purchase = €1.75 fee' },
  { range: '€100.01 – €250.00', feePercent: '3%', example: 'e.g. €200.00 purchase = €6.00 fee' },
  { range: '€250.01+', feePercent: '3%', example: 'e.g. €700.00 purchase = €21.00 fee' },
];
