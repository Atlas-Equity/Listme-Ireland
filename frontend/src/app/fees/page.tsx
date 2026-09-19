import React from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  Coins, 
  Tag, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight,
  Info,
  Clock,
  Scale
} from 'lucide-react';

export const revalidate = 60;

export const metadata = {
  title: 'Marketplace Fees | Listme.ie',
  description: 'Official Listme.ie Marketplace Fees schedule: platform fees, Stripe transaction fees, duration fees, withdrawal fees, and success fees.',
};

export default function MarketplaceFeesPage() {
  const optionalExtras = [
    { extra: 'Subtitle', fee: '€0.55 (€0.15 for books and CDs)' },
    { extra: '10-day auction', fee: '€0.25' },
    { extra: 'Scheduled end time', fee: '€0.25' },
    { extra: 'Reserve fee', fee: '€0.25' },
    { extra: 'Second category', fee: '€0.99' },
    { extra: 'Exceed listing allowance', fee: '€0.10 per listing' },
    { extra: 'Starter/Gallery', fee: '€0.55 (Books and CDs – €0.25)' },
    { extra: 'Standard/Gallery Plus', fee: '€0.65 (Books and CDs – €0.30)' },
    { extra: 'Advanced/Feature', fee: '€3.45 (Books and CDs – €0.75)' },
    { extra: 'Premium/Feature Combo', fee: '€3.95 (Books and CDs – €0.95)' },
    { extra: 'Platinum/Super Feature', fee: 'Pricing varies by category' },
  ];

  const durationFees = [
    { duration: 'Standard (up to 7 days)', fee: 'Free' },
    { duration: '14 days', fee: '€0.10' },
    { duration: '30 days', fee: '€0.10' },
  ];

  const categorySuccessFees = [
    { category: 'Antiques', fee: '11.9%' },
    { category: 'Art', fee: '11.9%' },
    { category: 'Baby Gear', fee: '9.9%' },
    { category: 'Books', fee: '11.9%' },
    { category: 'Building & Renovation', fee: 'Air conditioning & heating systems: 5.9% | Tools: 9.9% | All other: 7.9%' },
    { category: 'Business, Farming & Industry', fee: 'Coffee, fryers, grills, refrigeration: 5.9% | Farming/forestry: 7.9% | All other: 9.9%' },
    { category: 'Clothing & Fashion', fee: '11.9%' },
    { category: 'Computers', fee: 'Components, desktops, laptops, printers, servers, tablets: 5.9% | All other: 9.9%' },
    { category: 'Crafts', fee: 'Sewing machines: 5.9% | All other: 9.9%' },
    { category: 'Electronics & Photography', fee: 'Cameras, audio, TVs: 5.9% | Binoculars, streaming: 7.9% | Cables, alarms: 9.9% | All other: 11.9%' },
    { category: 'Gaming', fee: 'Gaming consoles: 5.9% | All other: 9.9%' },
    { category: 'Health & Beauty', fee: '11.9%' },
    { category: 'Home & Living', fee: 'Appliances, dishwashers, fridges: 5.9% | Food & drink: 7.9% | All other: 9.9%' },
    { category: 'Jewellery & Watches', fee: 'Smart watches: 5.9% | All other: 11.9%' },
    { category: 'Mobile Phones', fee: 'Handsets: 5.9% | All other: 9.9%' },
    { category: 'Movies & TV', fee: '11.9%' },
    { category: 'Music & Instruments', fee: 'PA & DJ equipment: 5.9% | Instruments: 9.9% | All other: 11.9%' },
    { category: 'Pets & Animals (Supplies)', fee: '7.9%' },
    { category: 'Pottery & Glass', fee: '9.9%' },
    { category: 'Sports', fee: '9.9%' },
    { category: 'Toys & Models', fee: '9.9%' },
    { category: 'Travel, Events & Activities', fee: '9.9%' },
  ];

  const serviceFeeTiers = [
    { range: '€10.00 – €50.00', fee: '4% fee' },
    { range: '€50.01 – €250.00', fee: '3.5% fee' },
    { range: '€250.01+', fee: '3% fee' },
  ];

  const serviceFeeExclusions = [
    'Household pets (Cats, Dogs, Birds, Rabbits)',
    'Livestock & horses (Classified only)',
    'Heavy machinery & Earthmoving',
    'Businesses for sale (Classified)',
    'Carbon credits & Domain names',
    'Shipping containers & Tiny homes',
    'Boat trailers & Forklifts',
    'Tractors & Drainage diggers',
  ];

  const summaryRows = [
    { type: 'Listing fee (general items)', who: 'Seller', cost: 'Free' },
    { type: 'Platform transaction fee (casual sellers)', who: 'Seller', cost: 'Standard Processing Rate' },
    { type: 'Success fee (in-trade sellers)', who: 'Seller', cost: '5.9% – 11.9% (max €499)' },
    { type: 'Service fee (buyers)', who: 'Buyer', cost: '€0 – €4.99 / scaled % based on price' },
    { type: 'Withdrawal fee (auction)', who: 'Seller', cost: '€3' },
    { type: 'Withdrawal fee (Buy Now/classified)', who: 'Seller', cost: 'Free' },
    { type: 'Optional extras', who: 'Seller', cost: '€0.10 – €3.95+' },
    { type: 'Listing duration (14 or 30 days)', who: 'Seller', cost: '€0.10' },
    { type: 'Stripe fee', who: 'Seller', cost: '1.4% + €0.25 per transaction' },
    { type: 'Cash in hand', who: 'Seller', cost: 'Free' },
    { type: 'No payment method selected', who: 'Seller', cost: 'No fee (buyers arrange payment directly)' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-black py-10 text-gray-800 dark:text-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">Marketplace Fees</span>
        </div>

        <div className="bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 mb-4">
              <Coins className="w-4 h-4 text-primary" />
              <span>Transparent Pricing</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Listme.ie – Marketplace Fees
            </h1>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
              Find out what fees you may see when you buy or sell on Listme. Review transparent platform fees, payment processing, and seller options.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold">
              <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Transparent Low Platform Fees
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Buyer Protection Coverage up to €5,000
              </span>
            </div>
          </div>
        </div>

        <section className="bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            General Items
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Most Marketplace categories are &apos;general items&apos; or stuff you&apos;d find around home and the office. When you list a general item, you can:
          </p>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 pl-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>Choose to run an auction or set a Buy Now price.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>List and relist for free, unless you select optional extras.</span>
            </li>
          </ul>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            If your item doesn&apos;t fit into a &apos;general items&apos; category, a listing fee may apply.
          </p>
        </section>

        <section className="bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              For Sellers
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              To make it simple to sell your things on Listme Marketplace, transaction fees, optional extras and withdrawal fees are clearly presented upfront.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Transaction Fees
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              The table below shows how different payment options affect your final costs.
            </p>

            <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-xs sm:text-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold">
                  <tr>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4 text-right">Fee for the Seller</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  <tr>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" /> Stripe
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Seller can choose to offer</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">1.4% + €0.25 per transaction</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">Cash in hand</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Seller can choose to offer</td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">No fee</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">Not offering any payment method</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Seller can choose to opt out</td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">No fee (buyers arrange payment directly)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <strong className="text-gray-900 dark:text-white">If you don&apos;t select Stripe:</strong> You can still list and sell on Listme.ie. However, you will not have access to our integrated payment system. Buyers will need to arrange payment directly with you (e.g., cash in hand). We strongly recommend offering Stripe for buyer confidence and Buyer Protection eligibility.
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Optional Extras
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              We charge extras and promotion fees to your Listme account as soon as your listing goes live.
            </p>

            <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-xs sm:text-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold">
                  <tr>
                    <th className="py-3 px-4">Extra</th>
                    <th className="py-3 px-4 text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-mono">
                  {optionalExtras.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-4 font-sans font-medium text-gray-900 dark:text-white">{row.extra}</td>
                      <td className="py-2.5 px-4 text-right">{row.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Listing Duration Fee</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              When you list an item, you can choose how long your listing stays up. The longer your post is up, the more views it gets and the further it will be pushed in search results and category pages.
            </p>

            <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-xs sm:text-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold">
                  <tr>
                    <th className="py-3 px-4">Listing Duration</th>
                    <th className="py-3 px-4 text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {durationFees.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-4 font-medium text-gray-900 dark:text-white">{row.duration}</td>
                      <td className={`py-2.5 px-4 text-right font-mono font-bold ${row.fee === 'Free' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                        {row.fee}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <strong className="text-gray-900 dark:text-white">Why choose a longer listing?</strong> The longer your post is up, the more views and exposure it gets. Listings with longer durations are pushed further in search results and category pages, giving you more chances to sell.
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Withdrawal Fees
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can withdraw your listing at any time, unless it is in its final hour.
            </p>

            <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-xs sm:text-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold">
                  <tr>
                    <th className="py-3 px-4">Listing Type</th>
                    <th className="py-3 px-4 text-right">Withdrawal Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Auction</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">€3</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Buy Now only, multiple quantity, and classified</td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">No fee</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Listings withdrawn within one hour of being listed (all categories)</td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">No fee</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              All listing fees are refunded to your Listme account.
            </p>
          </div>
        </section>

        <section className="bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Commercial Sellers
              </span>
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Success Fees (In-Trade Sellers Only)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Success Fees still apply for in-trade sellers (businesses and professional sellers). Buyers will not pay a Service Fee when purchasing from an in-trade seller.
            </p>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">How Success Fees Work:</h4>
            <ul className="space-y-1.5 pl-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <span>We charge a Success Fee when your item sells. This includes sales through auctions, Buy Now, Make an Offer, or Fixed Price Offer.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <span>We charge the fee to your Listme account as soon as the listing closes or you accept an offer.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <span>If a trade does not work out, you can apply for a Success Fee refund.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Success Fee Table (In-Trade Sellers Only):</h4>
            <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-xs sm:text-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold">
                  <tr>
                    <th className="py-3 px-4">Item + Shipping Price</th>
                    <th className="py-3 px-4 text-right">Success Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">€1 or less</td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">Free</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">More than €1</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                      5.9%, 7.9%, 9.9%, or 11.9% <span className="text-xs font-sans text-gray-500 font-normal">(max fee €499. Top Sellers receive a 15% discount)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Success Fees by Category (In-Trade Sellers Only):</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">These fees are a high-level summary. Some categories may have exceptions.</p>
            <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-xs sm:text-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Success Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {categorySuccessFees.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-4 font-medium text-gray-900 dark:text-white">{row.category}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">{row.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Buyers
              </span>
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              For Buyers
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              A standard platform Service Fee helps us keep the lights on and allows us to provide a safe, supported environment for Irish buyers and sellers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
              <strong className="text-gray-900 dark:text-white block mb-1">Who it applies to:</strong>
              <p className="text-gray-600 dark:text-gray-400">Buyers will see this fee when purchasing from a casual seller and paying with online card.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
              <strong className="text-gray-900 dark:text-white block mb-1">How it is calculated:</strong>
              <p className="text-gray-600 dark:text-gray-400">The fee is calculated based on the item&apos;s purchase price (not including shipping).</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
              <strong className="text-gray-900 dark:text-white block mb-1">Cash payments:</strong>
              <p className="text-gray-600 dark:text-gray-400">If you pay in cash on pick-up, you will not be charged a Service Fee.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
              <strong className="text-gray-900 dark:text-white block mb-1">Automatic Refunds:</strong>
              <p className="text-gray-600 dark:text-gray-400">If a trade is cancelled, your Service Fee is automatically refunded with the transaction.</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Service Fee Table:</h4>
            <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-xs sm:text-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold">
                  <tr>
                    <th className="py-3 px-4">Purchase Price</th>
                    <th className="py-3 px-4 text-right">Service Fee for Buyers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {serviceFeeTiers.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-4 font-medium text-gray-900 dark:text-white">{row.range}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">{row.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Service Fee Exclusions:</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">There is no Service Fee for the following categories and listing types:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
              {serviceFeeExclusions.map((excl, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{excl}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Summary – Marketplace Fees at a Glance
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              High-level overview of buyer and seller fee structures across Listme.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-xs sm:text-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold">
                <tr>
                  <th className="py-3 px-4">Fee Type</th>
                  <th className="py-3 px-4">Who Pays</th>
                  <th className="py-3 px-4 text-right">How Much</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {summaryRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-gray-900 dark:text-white">{row.type}</td>
                    <td className="py-2.5 px-4 text-gray-600 dark:text-gray-400">{row.who}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 italic pt-2">
            These fees form part of our{' '}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
