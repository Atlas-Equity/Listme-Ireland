export type CategoryType = 'marketplace' | 'motors' | 'property' | 'jobs' | 'services';

export interface BaseListing {
  id: string;
  category: CategoryType;
  title: string;
  image: string;
  price: string;
  location: string;
  createdAt: string;
}

export interface MarketplaceListing extends BaseListing {
  category: 'marketplace';
  type: 'auction' | 'buynow';
  bids?: string;
  timeRemaining?: string;
  condition: string;
}

export interface MotorsListing extends BaseListing {
  category: 'motors';
  make: string;
  model: string;
  year: string;
  mileage: string;
  transmission: string;
}

export interface PropertyListing extends BaseListing {
  category: 'property';
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  floorArea?: string;
}

export interface JobListing extends BaseListing {
  category: 'jobs';
  company: string;
  workType: string;
  salary: string;
}

export interface ServiceListing extends BaseListing {
  category: 'services';
  rating: string;
  reviews: string;
  availability: string;
}

export type AnyListing = MarketplaceListing | MotorsListing | PropertyListing | JobListing | ServiceListing;

export const mockMarketplace: MarketplaceListing[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `mkt-${i}`,
  category: 'marketplace',
  title: '[EXAMPLE ITEM TITLE]',
  image: '[EXAMPLE IMAGE]',
  price: '[EXAMPLE PRICE]',
  location: '[EXAMPLE LOCATION]',
  createdAt: '2 hours ago',
  type: i % 2 === 0 ? 'auction' : 'buynow',
  bids: i % 2 === 0 ? '[EXAMPLE BID]' : undefined,
  timeRemaining: i % 2 === 0 ? '[EXAMPLE TIME]' : undefined,
  condition: 'Used',
}));

export const mockMotors: MotorsListing[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `mtr-${i}`,
  category: 'motors',
  title: '[EXAMPLE CAR MODEL]',
  image: '[EXAMPLE IMAGE]',
  price: '[EXAMPLE PRICE]',
  location: '[EXAMPLE LOCATION]',
  createdAt: '1 day ago',
  make: 'Toyota',
  model: 'Corolla',
  year: '2019',
  mileage: '45,000 km',
  transmission: 'Automatic',
}));

export const mockProperty: PropertyListing[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `prp-${i}`,
  category: 'property',
  title: '[EXAMPLE PROPERTY ADDRESS]',
  image: '[EXAMPLE IMAGE]',
  price: '[EXAMPLE PRICE]',
  location: '[EXAMPLE LOCATION]',
  createdAt: '3 days ago',
  propertyType: 'House',
  bedrooms: 3,
  bathrooms: 2,
  floorArea: '120 sqm',
}));

export const mockJobs: JobListing[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `job-${i}`,
  category: 'jobs',
  title: '[EXAMPLE JOB ROLE]',
  image: '[EXAMPLE LOGO]',
  price: '', // Jobs don't use price typically, they use salary
  location: '[EXAMPLE LOCATION]',
  createdAt: 'Just now',
  company: '[EXAMPLE COMPANY]',
  workType: 'Full-time',
  salary: '[EXAMPLE SALARY]',
}));

export const mockServices: ServiceListing[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `srv-${i}`,
  category: 'services',
  title: '[EXAMPLE SERVICE OFFERED]',
  image: '[EXAMPLE IMAGE]',
  price: '[EXAMPLE RATE]',
  location: '[EXAMPLE LOCATION]',
  createdAt: '1 week ago',
  rating: '[EXAMPLE RATING]',
  reviews: '[EXAMPLE REVIEWS]',
  availability: 'Available Now',
}));

export const coolAuctions: MarketplaceListing[] = [
  {
    id: 'cool-1',
    category: 'marketplace',
    title: 'CERTIFICATE OF CROSSING THE INTERNATIONAL DATE LINE',
    image: 'Document',
    price: '$1.00',
    location: 'Wellington',
    createdAt: 'Just now',
    type: 'auction',
    timeRemaining: 'Closes: Tue, 8 Sep',
    condition: 'Used',
    bids: 'No reserve'
  },
  {
    id: 'cool-2',
    category: 'marketplace',
    title: 'Vintage Brown Ceramic Cup',
    image: 'Cup',
    price: '$22.00',
    location: 'Auckland',
    createdAt: 'Just now',
    type: 'auction',
    timeRemaining: 'Closes: Sun, 6 Sep',
    condition: 'Used',
    bids: 'Reserve met'
  },
  {
    id: 'cool-3',
    category: 'marketplace',
    title: 'Beautiful Seaside Villa',
    image: 'House',
    price: '$1.50',
    location: 'Otago',
    createdAt: 'Just now',
    type: 'auction',
    timeRemaining: 'Closes: Wed, 9 Sep',
    condition: 'Used',
    bids: 'Reserve met'
  },
  {
    id: 'cool-4',
    category: 'marketplace',
    title: 'Waterfront Property Overview',
    image: 'Beach',
    price: '$2.50',
    location: 'Otago',
    createdAt: 'Just now',
    type: 'auction',
    timeRemaining: 'Closes: Wed, 9 Sep',
    condition: 'Used',
    bids: 'Reserve met'
  }
];

export const dollarReserve: MarketplaceListing[] = [
  {
    id: 'dol-1',
    category: 'marketplace',
    title: '$1RES VICTORIAN LOOK TURQUOISE EARRINGS',
    image: 'Earrings',
    price: '$1.00',
    location: 'Wellington',
    createdAt: 'Just now',
    type: 'auction',
    timeRemaining: 'Closes: Tue, 8 Sep',
    condition: 'These are exquisite earrings at $1RES\nShipping from $12.50',
    bids: 'No reserve'
  },
  {
    id: 'dol-2',
    category: 'marketplace',
    title: 'Dell Latitude 7430 Touchscreen 14" 2-in-1 Convertible Laptop',
    image: 'Laptop',
    price: '$22.00',
    location: 'Auckland',
    createdAt: 'Just now',
    type: 'auction',
    timeRemaining: 'Closes: Sun, 6 Sep',
    condition: 'i7 Evo, 32GB Ram, 512gb Storage, 14"\nShipping from $9.00',
    bids: 'Reserve met'
  },
  {
    id: 'dol-3',
    category: 'marketplace',
    title: 'Mens Sports Chronograph Watch - 3 Time Zones Smart Alarm 50M',
    image: 'Watch',
    price: '$1.50',
    location: 'Otago',
    createdAt: 'Just now',
    type: 'auction',
    timeRemaining: 'Closes: Wed, 9 Sep',
    condition: 'Premium Quality, Must Sell, NZ Shipping\nShipping from $7.70',
    bids: 'Reserve met'
  },
  {
    id: 'dol-4',
    category: 'marketplace',
    title: "Men's 18K Gold Plated Heavy Steel Curb Bracelet - Brand New",
    image: 'Bracelet',
    price: '$2.50',
    location: 'Otago',
    createdAt: 'Just now',
    type: 'auction',
    timeRemaining: 'Closes: Wed, 9 Sep',
    condition: 'Premium Quality, Must Sell, NZ Shipping\nShipping from $6.40',
    bids: 'Reserve met'
  }
];
