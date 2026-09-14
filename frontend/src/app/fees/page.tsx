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
  Scale
} from 'lucide-react';

export const revalidate = 60;

export const metadata = {
  title: 'Marketplace Fees | Listme.ie',
  description: 'Official Listme.ie Marketplace Fees schedule: casual selling fees, transaction fees, optional extras, and in-trade success fees.',
};

export default function MarketplaceFeesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">Marketplace Fees</span>
        </div>

        {/* Hero Banner */}
        <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-xs relative overflow-hidden">
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

        {/* General Items */}
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
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

        {/* For Sellers */}
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              For Sellers
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              To make it simple to sell your things on Listme Marketplace, transaction fees, optional extras and withdrawal fees are clearly presented upfront.
            </p>
          </div>

          {/* Transaction Fees */}
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
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">NexyPay</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      Automatically included on listings for items up to €25,000
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      2.19% <span className="text-xs text-gray-400 font-sans block">(1.89% Top Sellers)</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">Stripe</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Seller can choose to offer</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">1.4% + €0.25 per transaction</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">Revolut</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Seller can choose to offer</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">1.3% + €0.20 per transaction</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">Cash in hand</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Seller can choose to offer</td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">No fee</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bank Transfer Notice */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 space-y-1 text-xs">
              <p className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Bank transfer is no longer a payment option.
              </p>
              <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                Unfortunately, scams involving bank transfer are on the rise. To move towards a safer Marketplace, we have removed bank transfer as a payment option.
              </p>
            </div>
          </div>

          {/* Optional Extras */}
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
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-gray-900 dark:text-white">Subtitle</td>
                    <td className="py-2.5 px-4 text-right">€0.55 <span className="text-xs text-gray-400 font-sans">(€0.15 for books and CDs)</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-gray-900 dark:text-white">10-day auction</td>
                    <td className="py-2.5 px-4 text-right">€0.25</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-gray-900 dark:text-white">Scheduled end time</td>
                    <td className="py-2.5 px-4 text-right">€0.25</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-gray-900 dark:text-white">Reserve fee</td>
                    <td className="py-2.5 px-4 text-right">€0.25</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-gray-900 dark:text-white">Second category</td>
                    <td className="py-2.5 px-4 text-right">€0.99</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-gray-900 dark:text-white">Exceed listing allowance</td>
                    <td className="py-2.5 px-4 text-right">€0.10 per listing</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-gray-900 dark:text-white">Starter/Gallery</td>
                    <td className="py-2.5 px-4 text-right">€0.55 <span className="text-xs text-gray-400 font-sans">(Books and CDs – €0.25)</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-gray-900 dark:text-white">Standard/Gallery Plus</td>
                    <td className="py-2.5 px-4 text-right">€0.65 <span className="text-xs text-gray-400 font-sans">(Books and CDs – €0.30)</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-gray-900 dark:text-white">Advanced/Feature</td>
                    <td className="py-2.5 px-4 text-right">€3.45 <span className="text-xs text-gray-400 font-sans">(Books and CDs – €0.75)</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-gray-900 dark:text-white">Premium/Feature Combo</td>
                    <td className="py-2.5 px-4 text-right">€3.95 <span className="text-xs text-gray-400 font-sans">(Books and CDs – €0.95)</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-gray-900 dark:text-white">Platinum/Super Feature</td>
                    <td className="py-2.5 px-4 text-right font-sans text-xs text-gray-500">Pricing varies by category</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Withdrawal Fees */}
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
                    <td className="py-3 px-4 text-right font-mono font-bold">€3</td>
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

        {/* Success Fees (In-Trade Sellers Only) */}
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
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

          <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <h4 className="font-bold text-gray-900 dark:text-white">How Success Fees Work:</h4>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>We charge a Success Fee when your item sells. This includes sales through auctions, Buy Now, Make an Offer, or Fixed Price Offer.</li>
              <li>We charge the fee to your Listme account as soon as the listing closes or you accept an offer.</li>
              <li>If a trade does not work out, you can apply for a Success Fee refund.</li>
            </ul>
          </div>

          {/* Success Fee Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
              Success Fee Table (In-Trade Sellers Only):
            </h4>
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
                    <td className="py-3 px-4 text-right font-mono">
                      5.9%, 7.9%, 9.9%, or 11.9% <span className="text-xs text-gray-400 block font-sans">(max fee €499. Top Sellers receive a 15% discount)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Success Fees by Category */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
              Success Fees by Category (In-Trade Sellers Only):
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              These fees are a high-level summary. Some categories may have exceptions.
            </p>

            <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-xs sm:text-sm max-h-96 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold sticky top-0">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Success Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  <tr>
                    <td className="py-2 px-4 font-medium">Antiques</td>
                    <td className="py-2 px-4 text-right font-mono font-bold">11.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">Art</td>
                    <td className="py-2 px-4 text-right font-mono font-bold">11.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">Baby Gear</td>
                    <td className="py-2 px-4 text-right font-mono font-bold">9.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">Books</td>
                    <td className="py-2 px-4 text-right font-mono font-bold">11.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">
                      Building &amp; Renovation
                      <span className="block text-[11px] text-gray-400">Air conditioning &amp; heating systems: 5.9% | Tools: 9.9%</span>
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold">7.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">
                      Business, Farming &amp; Industry
                      <span className="block text-[11px] text-gray-400">Coffee, fryers, grills, refrigeration: 5.9% | Farming/forestry: 7.9%</span>
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold">9.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">Clothing &amp; Fashion</td>
                    <td className="py-2 px-4 text-right font-mono font-bold">11.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">
                      Computers
                      <span className="block text-[11px] text-gray-400">Components, desktops, laptops, printers, servers, tablets: 5.9%</span>
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold">9.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">
                      Crafts
                      <span className="block text-[11px] text-gray-400">Sewing machines: 5.9%</span>
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold">9.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">
                      Electronics &amp; Photography
                      <span className="block text-[11px] text-gray-400">Cameras, audio, TVs: 5.9% | Binoculars, streaming: 7.9% | Cables, alarms: 9.9%</span>
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold">11.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">
                      Gaming
                      <span className="block text-[11px] text-gray-400">Gaming consoles: 5.9%</span>
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold">9.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">Health &amp; Beauty</td>
                    <td className="py-2 px-4 text-right font-mono font-bold">11.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">
                      Home &amp; Living
                      <span className="block text-[11px] text-gray-400">Appliances, dishwashers, fridges: 5.9% | Food &amp; drink: 7.9%</span>
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold">9.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">
                      Jewellery &amp; Watches
                      <span className="block text-[11px] text-gray-400">Smart watches: 5.9%</span>
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold">11.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">
                      Mobile Phones
                      <span className="block text-[11px] text-gray-400">Handsets: 5.9%</span>
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold">9.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">Movies &amp; TV</td>
                    <td className="py-2 px-4 text-right font-mono font-bold">11.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">
                      Music &amp; Instruments
                      <span className="block text-[11px] text-gray-400">PA &amp; DJ equipment: 5.9% | Instruments: 9.9%</span>
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold">11.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">Pets &amp; Animals (Supplies)</td>
                    <td className="py-2 px-4 text-right font-mono font-bold">7.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">Pottery &amp; Glass</td>
                    <td className="py-2 px-4 text-right font-mono font-bold">9.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">Sports</td>
                    <td className="py-2 px-4 text-right font-mono font-bold">9.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">Toys &amp; Models</td>
                    <td className="py-2 px-4 text-right font-mono font-bold">9.9%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">Travel, Events &amp; Activities</td>
                    <td className="py-2 px-4 text-right font-mono font-bold">9.9%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </section>

        {/* For Buyers */}
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              For Buyers
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              A standard platform Service Fee helps us keep the lights on and allows us to provide a safe, supported environment for Irish buyers and sellers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
              <span className="font-bold text-gray-900 dark:text-white block mb-0.5">Who it applies to:</span>
              <span className="text-gray-500 dark:text-gray-400">Buyers will see this fee when purchasing from a casual seller and paying with NexyPay or online card.</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
              <span className="font-bold text-gray-900 dark:text-white block mb-0.5">How it is calculated:</span>
              <span className="text-gray-500 dark:text-gray-400">The fee is calculated based on the item&apos;s purchase price (not including shipping).</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
              <span className="font-bold text-gray-900 dark:text-white block mb-0.5">Cash payments:</span>
              <span className="text-gray-500 dark:text-gray-400">If you pay in cash on pick-up, you will not be charged a Service Fee.</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
              <span className="font-bold text-gray-900 dark:text-white block mb-0.5">Automatic Refunds:</span>
              <span className="text-gray-500 dark:text-gray-400">If a trade is cancelled, your Service Fee is automatically refunded with the transaction.</span>
            </div>
          </div>

          {/* Service Fee Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
              Service Fee Table:
            </h4>
            <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-xs sm:text-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold">
                  <tr>
                    <th className="py-3 px-4">Purchase Price</th>
                    <th className="py-3 px-4 text-right">Service Fee for Buyers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-mono">
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-gray-900 dark:text-white">€10.00 – €50.00</td>
                    <td className="py-2.5 px-4 text-right"><span className="text-xs text-gray-400 font-sans">4% fee</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-gray-900 dark:text-white">€50.01 – €250.00</td>
                    <td className="py-2.5 px-4 text-right"><span className="text-xs text-gray-400 font-sans">3.5% fee</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-gray-900 dark:text-white">€250.01+</td>
                    <td className="py-2.5 px-4 text-right"><span className="text-xs text-gray-400 font-sans">3% fee</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Service Fee Exclusions */}
          <div className="space-y-2 pt-2">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
              Service Fee Exclusions:
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              There is no Service Fee for the following categories and listing types:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 text-xs text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-1.5">• Household pets (Cats, Dogs, Birds, Rabbits)</li>
              <li className="flex items-center gap-1.5">• Livestock &amp; horses (Classified only)</li>
              <li className="flex items-center gap-1.5">• Heavy machinery &amp; Earthmoving</li>
              <li className="flex items-center gap-1.5">• Businesses for sale (Classified)</li>
              <li className="flex items-center gap-1.5">• Carbon credits &amp; Domain names</li>
              <li className="flex items-center gap-1.5">• Shipping containers &amp; Tiny homes</li>
              <li className="flex items-center gap-1.5">• Boat trailers &amp; Forklifts</li>
              <li className="flex items-center gap-1.5">• Tractors &amp; Drainage diggers</li>
            </ul>
          </div>
        </section>

        {/* Summary – Marketplace Fees at a Glance */}
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Summary – Marketplace Fees at a Glance
          </h2>
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-xs sm:text-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold">
                <tr>
                  <th className="py-3 px-4">Fee Type</th>
                  <th className="py-3 px-4">Who Pays</th>
                  <th className="py-3 px-4 text-right">How Much</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-gray-700 dark:text-gray-300">
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-gray-900 dark:text-white">Listing fee (general items)</td>
                  <td className="py-2.5 px-4">Seller</td>
                  <td className="py-2.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">Free</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-gray-900 dark:text-white">Platform transaction fee (casual sellers)</td>
                  <td className="py-2.5 px-4">Seller</td>
                  <td className="py-2.5 px-4 text-right font-mono">Standard Processing Rate</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-gray-900 dark:text-white">Success fee (in-trade sellers)</td>
                  <td className="py-2.5 px-4">Seller</td>
                  <td className="py-2.5 px-4 text-right font-mono">5.9% – 11.9% (max €499)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-gray-900 dark:text-white">Service fee (buyers)</td>
                  <td className="py-2.5 px-4">Buyer</td>
                  <td className="py-2.5 px-4 text-right font-mono">€0 – €4.99 / scaled % based on price</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-gray-900 dark:text-white">Withdrawal fee (auction)</td>
                  <td className="py-2.5 px-4">Seller</td>
                  <td className="py-2.5 px-4 text-right font-mono">€3</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-gray-900 dark:text-white">Withdrawal fee (Buy Now/classified)</td>
                  <td className="py-2.5 px-4">Seller</td>
                  <td className="py-2.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">Free</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-gray-900 dark:text-white">Optional extras</td>
                  <td className="py-2.5 px-4">Seller</td>
                  <td className="py-2.5 px-4 text-right font-mono">€0.10 – €3.95+</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-gray-900 dark:text-white">NexyPay fee</td>
                  <td className="py-2.5 px-4">Seller</td>
                  <td className="py-2.5 px-4 text-right font-mono">2.19% (1.89% for Top Sellers)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-gray-900 dark:text-white">Stripe fee</td>
                  <td className="py-2.5 px-4">Seller</td>
                  <td className="py-2.5 px-4 text-right font-mono">1.4% + €0.25 per transaction</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-gray-900 dark:text-white">Revolut fee</td>
                  <td className="py-2.5 px-4">Seller</td>
                  <td className="py-2.5 px-4 text-right font-mono">1.3% + €0.20 per transaction</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-gray-900 dark:text-white">Cash in hand</td>
                  <td className="py-2.5 px-4">Seller</td>
                  <td className="py-2.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">Free</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-zinc-800">
            These fees form part of our Terms of Service.
          </p>
        </section>

      </div>
    </div>
  );
}
