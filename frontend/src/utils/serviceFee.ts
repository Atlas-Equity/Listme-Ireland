
export interface ServiceFeeResult {
  price: number;
  percentage: number;
  fee: number;
  total: number;
  percentageFormatted: string;
  tierLabel: string;
  isCreditDiscountApplied?: boolean;
  isVerifiedDiscountApplied?: boolean;
}

export function calculateServiceFee(
  price: number | string,
  isCreditPayment: boolean = false,
  isVerifiedBuyer: boolean = false
): ServiceFeeResult {
  const numericPrice = typeof price === 'string' 
    ? parseFloat(price.replace(/[^0-9.]/g, '')) || 0 
    : (Number(price) || 0);

  const cleanPrice = Math.max(0, numericPrice);

  let basePercentage = 4.0;
  let tierLabel = '€10 – €50 (4%)';

  if (cleanPrice <= 50) {
    basePercentage = 4.0;
    tierLabel = '€10 – €50 (4%)';
  } else if (cleanPrice <= 250) {
    basePercentage = 3.5;
    tierLabel = '€50.01 – €250.00 (3.5%)';
  } else {
    basePercentage = 3.0;
    tierLabel = '€250.01+ (3%)';
  }

  let percentage = basePercentage;
  if (isVerifiedBuyer) {
    percentage = basePercentage * 0.5;
  } else if (isCreditPayment) {
    percentage = Math.max(0, basePercentage - 0.5);
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
    isCreditDiscountApplied: isCreditPayment && !isVerifiedBuyer,
    isVerifiedDiscountApplied: isVerifiedBuyer,
  };
}

export const SERVICE_FEE_TIERS = [
  { range: '€10 – €50', feePercent: '4%', example: 'e.g. €25.00 purchase = €1.00 fee' },
  { range: '€50.01 – €250', feePercent: '3.5%', example: 'e.g. €100.00 purchase = €3.50 fee' },
  { range: '€250.01+', feePercent: '3%', example: 'e.g. €300.00 purchase = €9.00 fee' },
];
