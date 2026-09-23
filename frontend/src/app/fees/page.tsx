import React from 'react';
import Link from 'next/link';
import {
  Coins,
  Tag,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Clock,
  Banknote,
  Package,
  Layers,
  Scale
} from 'lucide-react';

export const revalidate = 60;

export const metadata = {
  title: 'Marketplace Fees | Listme.ie',
  description: 'Official Listme.ie Marketplace Fees schedule: transparent pricing, payment processing, seller options, and buyer service fees.',
};

export default function MarketplaceFeesPage() {
  const listingLimits = [
    { type: 'Personal (Unverified)', allowed: '30 listings', notes: 'Standard limit' },
    { type: 'Personal (Verified)', allowed: '100 listings', notes: 'Verified badge and benefits apply' },
    { type: 'Business Page (Unverified)', allowed: '50 listings', notes: 'Business storefront limit' },
    { type: 'Business Page (Verified)', allowed: '250 listings', notes: 'Verified Business Page limit' },
  ];

  const transactionFees = [
    { method: 'ListMe Account Credit (buyer pays with credit)', availability: 'Seller can choose to offer', fee: '1.4% + €0.25 per transaction' },
    { method: 'Euro in Hand / Cash on Collection', availability: 'Seller can choose to offer', fee: 'No fee' },
    { method: 'No payment method selected', availability: 'Seller can choose to opt out', fee: 'No fee (buyers arrange payment directly)' },
  ];

  const optionalExtras = [
    { extra: 'Reserve fee', fee: '€0.25' },
    { extra: 'Exceed listing allowance', fee: '€0.10 per listing' },
  ];

  const durationFees = [
    { duration: '3 days', fee: 'Free' },
    { duration: '5 days', fee: 'Free' },
    { duration: '7 days (Standard)', fee: 'Free' },
    { duration: '14 days', fee: '€0.10' },
    { duration: '30 days', fee: '€0.10' },
  ];

  const withdrawalFees = [
    { type: 'Auction', fee: '€3' },
    { type: 'Buy Now only, multiple quantity, and classified', fee: 'No fee' },
    { type: 'Listings withdrawn within one hour of being listed (all categories)', fee: 'No fee' },
  ];

  const serviceFeeTiers = [
    { price: '€10 – €50', standard: '4%', credit: '-€1 off base total (rounded down to 0 if less than €1)', verified: '2%' },
    { price: '€50.01 – €250', standard: '3.5%', credit: '-€1 off base total', verified: '1.75%' },
    { price: '€250.01+', standard: '3%', credit: '-€5 off base total', verified: '1.5%' },
  ];

  const summaryRows = [
    { type: 'Listing fee (general items)', who: 'Seller', cost: 'Free' },
    { type: 'Success fee', who: 'Seller', cost: 'None. You keep 100% of everything you sell' },
    { type: 'Platform transaction fee (when buyer pays with Account Credit)', who: 'Seller', cost: '1.4% + €0.25 per transaction' },
    { type: 'Service fee (buyers)', who: 'Buyer', cost: 'Scaled % based on purchase price' },
    { type: 'Service fee (Verified buyers)', who: 'Buyer', cost: '50% off standard rate' },
    { type: 'Service fee (Account Credit)', who: 'Buyer', cost: '-€1 off base total (up to €250), -€5 off base total (above €250)' },
    { type: 'Withdrawal fee (auction)', who: 'Seller', cost: '€3' },
    { type: 'Withdrawal fee (Buy Now/classified)', who: 'Seller', cost: 'Free' },
    { type: 'Reserve fee (auction)', who: 'Seller', cost: '€0.25' },
    { type: 'Listing duration (14 or 30 days)', who: 'Seller', cost: '€0.10' },
    { type: 'Account Credit processing fee', who: 'Seller', cost: '1.4% + €0.25 per transaction' },
    { type: 'Cash in hand', who: 'Seller', cost: 'Free' },
    { type: 'No payment method selected', who: 'Seller', cost: 'No fee (buyers arrange payment directly)' },
    { type: 'Exceed listing allowance', who: 'Seller', cost: '€0.10 per listing' },
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
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Transparent Low Platform Fees
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Buyer Protection Coverage up to €5,000 (up to €10,000 for Verified members)
              </span>
            </div>
          </div>
        </div>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Listing Limits
            </h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4 font-bold">Account Type</th>
                  <th className="py-3 px-4 font-bold">Active Listings Allowed</th>
                  <th className="py-3 px-4 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {listingLimits.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30">
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{item.type}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.allowed}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
            If you need to exceed your listing allowance, you can add more listings for <strong>€0.10 per listing</strong>.
          </p>
        </section>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              General Items
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Most Marketplace categories are &apos;general items&apos; or stuff you&apos;d find around home and the office. When you list a general item, you can:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Choose to run an auction or set a Buy Now price.</li>
            <li>List and relist for free, unless you select optional extras.</li>
            <li>If your item does not fit into a &apos;general items&apos; category, a listing fee may apply (such as Other &amp; Miscellaneous: €0.50 upload fee).</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              For Sellers
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              To make it simple to sell your things on Listme Marketplace, transaction fees, optional extras and withdrawal fees are clearly presented upfront.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Transaction Fees
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              The table below shows how different payment options affect your final costs.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Payment Method</th>
                    <th className="py-3 px-4 font-bold">Availability</th>
                    <th className="py-3 px-4 font-bold">Fee for the Seller</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {transactionFees.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30">
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{row.method}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{row.availability}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{row.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              <strong>If you do not offer ListMe Account Credit as a payment option:</strong> You can still list and sell on Listme.ie. However, buyers will not be able to pay you using their ListMe Account Credit — they will need to arrange payment directly with you (for example, Euro in Hand / Cash on Collection). We strongly recommend enabling ListMe Account Credit for buyer confidence and Buyer Protection eligibility.
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Optional Extras
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              We charge extras and promotion fees to your Listme account as soon as your listing goes live.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Extra</th>
                    <th className="py-3 px-4 font-bold">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {optionalExtras.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{item.extra}</td>
                      <td className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-400">{item.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Reserve Auctions
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              You can choose to set a reserve price on your auction. If the reserve price is not met by the time the auction ends, the item is automatically withdrawn from sale and no trade takes place.
            </p>
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
              <strong>Reserve fee: €0.25 per reserve auction.</strong>
              <p className="mt-1">This gives you control over the minimum price you are willing to accept. If bidding does not reach your reserve, the listing is pulled and you are not obligated to sell.</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Listing Duration Fee
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              When you list an item, you can choose how long your listing stays up. The longer your post is up, the more views it gets and the further it will be pushed in search results and category pages.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Listing Duration</th>
                    <th className="py-3 px-4 font-bold">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {durationFees.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{row.duration}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{row.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Why choose a longer listing?</strong> The longer your post is up, the more views and exposure it gets. Listings with longer durations are pushed further in search results and category pages, giving you more chances to sell.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Withdrawal Fees
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can withdraw your listing at any time, unless it is in its final hour.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Listing Type</th>
                    <th className="py-3 px-4 font-bold">Withdrawal Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {withdrawalFees.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{row.type}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{row.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              All listing fees are refunded to your Listme account.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
            <h3 className="text-sm font-bold mb-1">You Keep 100% of Everything You Sell</h3>
            <p className="leading-relaxed">
              Listme.ie does NOT charge any Success Fee. When your item sells, you keep 100% of the sale price.
            </p>
            <p className="mt-1 font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
              Example: You sell an item for €499.99. You keep €499.99. No Success Fee. No commission. No hidden cuts.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Shipping
            </h3>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              Listme.ie does <strong>NOT</strong> handle shipping. Shipping, postage, and delivery are arranged directly between the buyer and the seller. This is entirely between the two parties. We do not set shipping prices, arrange couriers, or mediate shipping disputes.
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              For Buyers
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              A standard platform Service Fee helps us keep the lights on and allows us to provide a safe, supported environment for Irish buyers and sellers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700 dark:text-gray-300">
            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
              <strong className="block text-gray-900 dark:text-white mb-1">Who it applies to:</strong>
              Buyers will see this fee when purchasing from a casual seller and paying with online card.
            </div>
            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
              <strong className="block text-gray-900 dark:text-white mb-1">How it is calculated:</strong>
              The fee is calculated based on the item purchase price (not including shipping).
            </div>
            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
              <strong className="block text-gray-900 dark:text-white mb-1">Cash payments:</strong>
              If you pay in cash on pick up, you will not be charged a Service Fee.
            </div>
            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
              <strong className="block text-gray-900 dark:text-white mb-1">Automatic Refunds:</strong>
              If a trade is cancelled, your Service Fee is automatically refunded with the transaction.
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              What is the Service Fee?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Our Service Fee helps keep our platform operating and means we can continue to offer local support and Buyer Protection up to €5,000 (up to €10,000 for Verified members). The fee is charged to buyers for payments made on Listme and is calculated based on the purchase price.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Purchase Price</th>
                    <th className="py-3 px-4 font-bold">Standard</th>
                    <th className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">With Credit</th>
                    <th className="py-3 px-4 font-bold text-primary">Verified (50% Off)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {serviceFeeTiers.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{row.price}</td>
                      <td className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{row.standard}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">{row.credit}</td>
                      <td className="py-3 px-4 font-bold text-primary">{row.verified}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <p><strong>ListMe Account Credit Discount:</strong> Pay using your ListMe Account Credit at checkout and you get a flat discount off your Service Fee:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>-€1 off the base total on purchases up to €250</li>
                <li>-€5 off the base total on purchases above €250</li>
                <li>If the -€1 discount is more than the Service Fee itself, the fee is rounded down to €0 (you pay nothing)</li>
              </ul>
              <p className="text-[11px] text-gray-500">Using credit is advised for security, refund reasons, and more.</p>
              <p><strong>ListMe Verified 50% Fee Discount:</strong> Verified buyers pay half the standard Service Fee on every purchase, plus enhanced Buyer Protection up to €10,000. <Link href="/verified" className="text-primary font-bold hover:underline">Get Verified from €9.99/mo.</Link></p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Service Fee Example (Item Purchase Price: €12.01)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-zinc-800/80 rounded-lg border border-gray-200 dark:border-zinc-700">
                <span className="text-gray-500 block">Service Fee (Standard 4%)</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">+€0.48</span>
                <span className="text-[11px] text-gray-500 block mt-2 font-medium">Estimated Total: €12.49</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-800/80 rounded-lg border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20">
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold block">Service Fee (With Credit)</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">€0</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-0.5">(rounded down from €0.48 because -€1 discount exceeds fee)</span>
                <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold block mt-1">Estimated Total: €12.01</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-800/80 rounded-lg border border-gray-200 dark:border-zinc-700">
                <span className="text-gray-500 block">Service Fee (Verified Member 2%)</span>
                <span className="font-bold text-primary text-sm">+€0.24 (50% off)</span>
                <span className="text-[11px] text-gray-500 block mt-2 font-medium">Estimated Total: €12.25</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Your trade is protected under Listme Buyer Protection up to €5,000 (up to €10,000 for Verified members).
            </p>
          </div>
        </section>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Summary – Marketplace Fees at a Glance
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            High level overview of buyer and seller fee structures across Listme.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4 font-bold">Fee Type</th>
                  <th className="py-3 px-4 font-bold">Who Pays</th>
                  <th className="py-3 px-4 font-bold">How Much</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {summaryRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30">
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{row.type}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{row.who}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
            These fees form part of our Terms of Service.
          </p>
        </section>

      </div>
    </div>
  );
}
