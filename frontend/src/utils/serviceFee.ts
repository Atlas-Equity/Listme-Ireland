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
  let fee = Math.round((cleanPrice * (basePercentage / 100)) * 100) / 100;

  if (isVerifiedBuyer) {
    percentage = basePercentage * 0.5;
    fee = Math.round((cleanPrice * (percentage / 100)) * 100) / 100;
  } else if (isCreditPayment) {
    const discountAmount = cleanPrice > 250 ? 5.00 : 1.00;
    fee = Math.max(0, Math.round((fee - discountAmount) * 100) / 100);
    percentage = cleanPrice > 0 ? Math.round(((fee / cleanPrice) * 100) * 100) / 100 : 0;
  }

  const total = Math.round((cleanPrice + fee) * 100) / 100;

  return {
    price: cleanPrice,
    percentage,
    fee,
    total,
    percentageFormatted: isCreditPayment ? `Credit Discount` : `${percentage}%`,
    tierLabel,
    isCreditDiscountApplied: isCreditPayment && !isVerifiedBuyer,
    isVerifiedDiscountApplied: isVerifiedBuyer,
  };
}

export const SERVICE_FEE_TIERS = [
  { range: '€10 – €50', feePercent: '4%', creditDiscount: '-€1 off base total (rounded down to 0 if less than €1)', verifiedPercent: '2%' },
  { range: '€50.01 – €250', feePercent: '3.5%', creditDiscount: '-€1 off base total', verifiedPercent: '1.75%' },
  { range: '€250.01+', feePercent: '3%', creditDiscount: '-€5 off base total', verifiedPercent: '1.5%' },
];
