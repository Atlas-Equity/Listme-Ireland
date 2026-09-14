import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  Ban, 
  Scale, 
  FileText, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';

export const revalidate = 60;

export const metadata = {
  title: 'Buyer Protection Policy | Listme.ie',
  description: 'Learn about Listme.ie Buyer Protection: coverage up to €5,000, eligibility criteria, scammer penalties, and dispute resolution.',
};

export default function BuyerProtectionPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">Buyer Protection</span>
        </div>

        {/* Hero Banner */}
        <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 mb-4">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Official Listme Policy</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Listme.ie – Buyer Protection
            </h1>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
              When you make a purchase on Listme.ie using Listme Pay, we have your back with Buyer Protection. That means you may be eligible for a refund (up to €5,000).
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold">
              <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Covered up to €5,000
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" /> 3-Day Reporting Window
              </span>
            </div>
          </div>
        </div>

        {/* What Is Buyer Protection? */}
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            What Is Buyer Protection?
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            When you make a purchase on Listme.ie using Listme Pay, we have your back with Buyer Protection. That means you may be eligible for a refund (up to €5,000) if your purchase:
          </p>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 pl-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Does not turn up</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Is faulty</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Is not as the seller described</span>
            </li>
          </ul>
          
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-300 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Purchases made with cash or bank transfers are not covered.</span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Check out our Buyer Protection policy below for full eligibility criteria.
          </p>
        </section>

        {/* What's Covered Table */}
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            What&apos;s Covered
          </h2>
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-1/3">Issue</th>
                  <th className="py-3 px-4">What It Means</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-xs sm:text-sm">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">Non-Delivery</td>
                  <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">The item never arrives</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">Not As Described</td>
                  <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">The item is materially different from what the seller described in the listing</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">Faulty Goods</td>
                  <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">The item stopped functioning as it should within a reasonable timeframe</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">Late Delivery</td>
                  <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">The item arrives after the expected delivery window, even if it arrives after the 3-day reporting period</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            How It Works
          </h2>

          <div className="space-y-6">
            
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center shrink-0 text-sm">
                1
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Step 1: Contact the Seller
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Sellers want to keep their good feedback, so most will sort out any problems. Contact the seller, let them know what is wrong, and work with them to resolve it.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center shrink-0 text-sm">
                2
              </div>
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Step 2: Not Resolved? We Can Help
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  If you cannot sort things out with the seller, file a dispute report within 3 days of buying the item.
                </p>

                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-1.5 pl-2">
                  <p className="font-semibold text-gray-900 dark:text-white">Let us know if:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    <li>The item has not been delivered by the seller (non-delivery)</li>
                    <li>The item is materially different from what the seller described in the listing (not as described)</li>
                    <li>The item has stopped functioning as it should within a reasonable timeframe (faulty goods)</li>
                    <li>The item arrives late (after the expected delivery window)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-900 dark:text-red-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-red-600" />
                    Important Time Limit:
                  </p>
                  <p>
                    Our private messaging system deletes messages and chats after 3 days. If you do not report within that time, the chat will be gone and we may not be able to investigate.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Exception for Late Delivery:
                  </p>
                  <p>
                    If your item arrives late but eventually turns up, you can still contact us for assistance. Even if the 3-day chat window has passed, we will work with you to resolve the issue using any other evidence you can provide (e.g., tracking information, photos, receipts).
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center shrink-0 text-sm">
                3
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Step 3: Getting a Refund
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Once a report has been filed, a Disputes Officer will pick up your case and review the details. They will update you via the support ticket system.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  If you meet the criteria and everything checks out under our Buyer Protection policy, we can refund your purchase.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Eligibility Requirements */}
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            Eligibility Requirements
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            To be eligible for a refund through Buyer Protection, we require you and the seller to:
          </p>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 pl-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Cooperate with us in good faith to help resolve the dispute or decide whether Buyer Protection applies</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Answer any questions we have about the trade between you and the seller in a timely manner</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Send us any correspondence that is relevant to the trade</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Send us any photos, evidence of purchase, receipts, or other evidence that will help establish the nature and condition of the item, or whether it was delivered</span>
            </li>
          </ul>
        </section>

        {/* Refund Process */}
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            Refund Process
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            If we decide to refund you under Buyer Protection, your money will usually be returned to the source used to purchase the item (your card, bank account, or Listme Pay balance).
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            If this will not work (for example, because your credit card has expired or your bank account has closed), we may determine the most appropriate way to get you your money back, including by deposit into your Listme Pay balance. In this case, we may request your help to find the best solution for you.
          </p>
        </section>

        {/* Scammer Penalties & Penalty Formula */}
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-red-500" />
              Scammer Penalties
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              If we determine you were scammed:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-gray-700 dark:text-gray-300 pl-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>You will be refunded – up to €5,000</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>The scammer will be charged a penalty on their account (see table below)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>The scammer will be banned – from 1 month to lifetime, depending on severity</span>
              </li>
            </ul>
          </div>

          {/* How the Penalty Works */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 space-y-2">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              How the Penalty Works
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              We take half of the penalty amount and double it to punish the scammer properly. This means the scammer pays more than the base penalty, and the extra amount goes toward deterring future bad behaviour.
            </p>
            <p className="text-xs text-primary dark:text-green-400 font-mono font-semibold">
              Example: If the base penalty is €5, we take half (€2.50) and double it (€5), making the total penalty €10.
            </p>
          </div>

          {/* Penalty and Ban Table */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">
              Penalty and Ban Table
            </h3>
            <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-xs sm:text-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold">
                  <tr>
                    <th className="py-3 px-4">Scam Amount</th>
                    <th className="py-3 px-4">Base Penalty</th>
                    <th className="py-3 px-4">Final Penalty (Half Doubled)</th>
                    <th className="py-3 px-4">Ban Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-gray-700 dark:text-gray-300 font-mono">
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium">Under €50</td>
                    <td className="py-3 px-4">€5</td>
                    <td className="py-3 px-4 font-bold text-red-600 dark:text-red-400">€10</td>
                    <td className="py-3 px-4 font-sans">1 month</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium">€50 – €200</td>
                    <td className="py-3 px-4">€10</td>
                    <td className="py-3 px-4 font-bold text-red-600 dark:text-red-400">€20</td>
                    <td className="py-3 px-4 font-sans">3 months</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium">€200 – €500</td>
                    <td className="py-3 px-4">€25</td>
                    <td className="py-3 px-4 font-bold text-red-600 dark:text-red-400">€50</td>
                    <td className="py-3 px-4 font-sans">6 months</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium">€500 – €1,000</td>
                    <td className="py-3 px-4">€50</td>
                    <td className="py-3 px-4 font-bold text-red-600 dark:text-red-400">€100</td>
                    <td className="py-3 px-4 font-sans">1 year</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium">€1,000 – €5,000</td>
                    <td className="py-3 px-4">€100</td>
                    <td className="py-3 px-4 font-bold text-red-600 dark:text-red-400">€200</td>
                    <td className="py-3 px-4 font-sans">2 years</td>
                  </tr>
                  <tr className="bg-red-50/50 dark:bg-red-950/20">
                    <td className="py-3 px-4 font-sans font-bold text-red-700 dark:text-red-400">Over €5,000</td>
                    <td className="py-3 px-4">€250</td>
                    <td className="py-3 px-4 font-bold text-red-600 dark:text-red-400">€500</td>
                    <td className="py-3 px-4 font-sans font-bold text-red-700 dark:text-red-400">Lifetime ban</td>
                  </tr>
                  <tr className="bg-red-50/50 dark:bg-red-950/20">
                    <td className="py-3 px-4 font-sans font-bold text-red-700 dark:text-red-400">Multiple scams (any value)</td>
                    <td className="py-3 px-4">€250 + previous</td>
                    <td className="py-3 px-4 font-bold text-red-600 dark:text-red-400">€500 + previous</td>
                    <td className="py-3 px-4 font-sans font-bold text-red-700 dark:text-red-400">Lifetime ban</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Repeat Offenders */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Repeat Offenders
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              If someone scams multiple times:
            </p>
            <ul className="space-y-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 pl-4 list-disc">
              <li><strong>First offence:</strong> Standard penalty and ban</li>
              <li><strong>Second offence:</strong> Double penalty and longer ban</li>
              <li><strong>Third offence:</strong> Lifetime ban and full debt recovery</li>
            </ul>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold pt-1">
              You can only report the same person ONCE. Make sure you have all your evidence ready before you report.
            </p>
          </div>

        </section>

        {/* What We Need From You & Timeframe */}
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-3">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              What We Need From You
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              When you file a dispute, we will ask for information so we can understand what happened. Please provide:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              <li className="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <span>Payment receipts and screenshots</span>
              </li>
              <li className="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                <span>Messages with the seller</span>
              </li>
              <li className="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Photos of the item (if received)</span>
              </li>
              <li className="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>Tracking information (if applicable)</span>
              </li>
            </ul>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              By filing a dispute, you consent to us reviewing the specific chat between you and the accused scammer. We will only look at that one chat – nothing else.
            </p>
          </div>

          {/* Timeframe */}
          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-2">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Timeframe
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              You must file a dispute report within 3 days of buying the item.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              This is because our private messaging system automatically deletes messages and chats after 3 days. If the chat has been removed, we may not be able to investigate.
            </p>
            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
              Exception: If your item arrives late (after the 3-day window), you can still contact us for assistance. We will work with you to resolve the issue using any other evidence you can provide.
            </p>
          </div>

          {/* Seller Responsibility */}
          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-2">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Seller Responsibility
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              When we have returned your money to you, we will debit the seller&apos;s Listme Pay balance or account. If there is not enough money, we may require the seller to pay us directly. We reserve the right to refer the matter to a debt collector if the seller refuses to pay.
            </p>
          </div>
        </section>

        {/* What Is Not Covered */}
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-500" />
            What Is Not Covered
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 pl-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              <span>Purchases made with cash</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              <span>Purchases made with direct bank transfers</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              <span>Items that are not collected or delivered due to buyer error (e.g., wrong address provided)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              <span>Disputes filed after the 3-day window (unless the item arrives late – see exception above)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              <span>Reports against the same person after you have already filed one report</span>
            </li>
          </ul>
        </section>

        {/* Summary Table */}
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            Summary
          </h2>
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-xs sm:text-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold">
                <tr>
                  <th className="py-3 px-4 w-2/5">Question</th>
                  <th className="py-3 px-4">Answer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">What is covered?</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Non-delivery, not as described, faulty goods, late delivery</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">How much can I get back?</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">Up to €5,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">When must I report?</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Within 3 days of purchase (late delivery exception applies)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">How do I report?</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Create a support ticket via the Support Page</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">What proof do I need?</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Receipts, messages, photos, tracking, any evidence</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Do you read my messages?</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Only the specific chat related to your dispute</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">What happens to the scammer?</td>
                  <td className="py-3 px-4 text-red-600 dark:text-red-400 font-semibold">Penalty (€10 to €500) and ban (1 month to lifetime)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Can I report the same person twice?</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">No – only once</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">What if I paid by cash or bank transfer?</td>
                  <td className="py-3 px-4 text-red-500">Not covered by Buyer Protection</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">What if my item arrives late?</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Contact us – we can still assist even after 3 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Contact Us */}
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            Contact Us
          </h2>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            Listme.ie Customer Support
          </p>
          <div className="space-y-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <p>Visit our Support Page to create a ticket</p>
            <p className="text-amber-600 dark:text-amber-400 font-semibold">
              No email support – all support is handled through our ticket system
            </p>
            <p>We aim to respond within 24 to 48 hours.</p>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-zinc-800">
            This Buyer Protection policy forms part of our Terms of Service and Privacy Policy.
          </p>
        </section>

      </div>
    </div>
  );
}
