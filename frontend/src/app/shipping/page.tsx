import React from 'react';
import Link from 'next/link';
import { Truck, Clock, PackageCheck, HelpCircle, AlertTriangle, ShieldCheck, ArrowRight, MessageSquareQuote } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Options | ListMe Ireland',
  description: "Find out about listing shipping and delivery options on Listme.ie. Important: Listme.ie does not handle shipping of any sort.",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#181818] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Breadcrumbs */}
        <nav className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/help" className="hover:text-primary transition-colors">Help</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-200 font-medium">Shipping Options</span>
        </nav>

        {/* Header */}
        <div className="border-b border-gray-200 dark:border-[#333333] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 mb-3">
            <Truck className="w-3.5 h-3.5" />
            <span>Platform Policy &amp; Delivery Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Listme.ie – Shipping Options
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Find out about a listing&apos;s shipping and delivery options.
          </p>
        </div>

        {/* CRITICAL DISCLAIMER CALLOUT */}
        <div className="p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Important: Listme.ie Does NOT Handle Shipping
              </h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Listme.ie does NOT handle shipping of any sort.</strong> Shipping, postage, and delivery are entirely between the buyer and seller to discuss, arrange, and pay for. We do not get involved in the shipping process.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 1: Estimated Delivery Times */}
        <section className="bg-white dark:bg-[#202020] rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-[#333333] shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Estimated Delivery Times
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Most professional sellers include estimated delivery times with their shipping options.
          </p>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#282828] border border-gray-200 dark:border-[#3a3a3a] text-sm text-gray-700 dark:text-gray-300 flex items-start gap-3">
            <MessageSquareQuote className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              If delivery times are not included, ask the seller for an estimate for your location through <strong className="text-gray-900 dark:text-white">Questions &amp; Answers</strong>. Do not include your exact address in your question — the Questions &amp; Answers section is public to all members.
            </div>
          </div>
        </section>

        {/* SECTION 2: Combined Shipping & Cart Purchases */}
        <section className="bg-white dark:bg-[#202020] rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-[#333333] shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Multiple Items in One Shipment (Combined Shipping)
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            If you are buying multiple items from one listing or store, the seller decides whether to charge shipping per item or per order. If you want to combine shipping, before you complete your purchase, use <strong className="text-gray-900 dark:text-white">Questions &amp; Answers</strong> to let the seller know. You will need to ask them to refund the shipping cost on the second item.
          </p>

          <div className="border-t border-gray-200 dark:border-[#333333] pt-5 space-y-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Cart Purchases
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Some professional sellers offer free shipping if you add multiple of their items to your Shopping Cart, and your total purchase amount is over a certain amount.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have items from different sellers in your cart, you will need to choose shipping per seller as items from different sellers are sold separately.
            </p>
          </div>
        </section>

        {/* SECTION 3: 'To Be Arranged' Shipping */}
        <section className="bg-white dark:bg-[#202020] rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-[#333333] shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              &apos;To Be Arranged&apos; Shipping
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            If &apos;to be arranged&apos; is listed as the shipping option, it means the seller has not provided any shipping prices upfront. You will need to arrange and pay for shipping directly with the seller.
          </p>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#282828] border border-gray-200 dark:border-[#3a3a3a] text-sm text-gray-700 dark:text-gray-300">
            To find out the shipping cost, ask the seller directly through the <strong className="text-gray-900 dark:text-white">Questions and Answers</strong> section on the listing page. Do not include your exact address in your question — the Questions and Answers section is public to all members.
          </div>

          <div className="pt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="font-semibold text-gray-700 dark:text-gray-300">Learn more:</div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Paying for shipping later (as a buyer)</li>
              <li>Sending shipping costs (as a seller)</li>
            </ul>
          </div>
        </section>

        {/* SECTION 4: View a Listing's Shipping Options */}
        <section className="bg-white dark:bg-[#202020] rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-[#333333] shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            View a Listing&apos;s Shipping Options
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            To view a listing&apos;s shipping options:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 pl-2">
            <li>Go to the listing page.</li>
            <li>Scroll down to the <strong className="text-gray-900 dark:text-white">&apos;Shipping &amp; pick-up options&apos;</strong> section.</li>
          </ol>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Sellers choose shipping options when they create a listing. You will see details like the shipping destination, description, and price based on their choices.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            If you have any questions about a listing&apos;s shipping options, ask the seller directly through the <strong className="text-gray-900 dark:text-white">Questions and Answers</strong> section on the listing page.
          </p>
        </section>

        {/* SECTION 5: Listme.ie Does Not Handle Shipping */}
        <section className="bg-red-500/5 dark:bg-red-500/10 rounded-2xl p-6 sm:p-8 border border-red-500/20 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Listme.ie Does Not Handle Shipping
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            To be clear:
          </p>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span>Listme.ie does not ship, post, or deliver any items.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span>Listme.ie does not set shipping prices.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span>Listme.ie does not arrange couriers or collection.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span>Listme.ie does not mediate shipping disputes.</span>
            </li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pt-2">
            All shipping arrangements, costs, and risks are between the buyer and seller. We strongly recommend that both parties agree on shipping terms before completing a transaction.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            If you have a shipping-related dispute that you cannot resolve with the other party, you can contact our Support team by creating a ticket via the <Link href="/help" className="text-primary font-semibold hover:underline">Support Page</Link>. However, please note that our ability to assist with shipping issues is limited.
          </p>
        </section>

        {/* SECTION 6: Contact Us & Tickets */}
        <section className="bg-white dark:bg-[#202020] rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-[#333333] shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Contact Us
              </h2>
              <div className="text-sm font-semibold text-primary mt-1">
                Listme.ie Customer Support
              </div>
            </div>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <span>Visit Support Page</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#282828] border border-gray-200 dark:border-[#3a3a3a] text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <div className="font-bold text-gray-900 dark:text-white text-sm">Ticket System</div>
              <p>No email support – all support is handled through our secure ticket system on the Support Page.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#282828] border border-gray-200 dark:border-[#3a3a3a] text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <div className="font-bold text-gray-900 dark:text-white text-sm">Response Times</div>
              <p>We aim to respond to all inquiries within 24 to 48 hours.</p>
            </div>
          </div>
        </section>

        {/* Footer Policy Notice */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4 pb-10 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>This Shipping Options page forms part of our <Link href="/terms" className="text-primary hover:underline font-semibold">Terms of Service</Link> and <Link href="/buyer-protection" className="text-primary hover:underline font-semibold">Buyer Protection</Link> policy.</span>
        </div>

      </div>
    </div>
  );
}
