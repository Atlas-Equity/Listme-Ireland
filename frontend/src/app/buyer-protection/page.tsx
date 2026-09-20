import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
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
  description: 'Official Listme.ie Buyer Protection policy: refunds up to €5,000 (up to €10,000 for Verified members), 3-day window, scammer penalties, and late delivery exceptions.',
};

export default function BuyerProtectionPage() {
  const coveredItems = [
    { issue: 'Non Delivery', means: 'The item never arrives' },
    { issue: 'Not As Described', means: 'The item is materially different from what the seller described in the listing' },
    { issue: 'Faulty Goods', means: 'The item stopped functioning as it should within a reasonable timeframe' },
    { issue: 'Late Delivery', means: 'The item arrives after the expected delivery window, even if it arrives after the 3 day reporting period' },
  ];

  const penaltyRows = [
    { amount: 'Under €50', penalty: '€10', ban: '1 month' },
    { amount: '€50 – €200', penalty: '€20', ban: '3 months' },
    { amount: '€200 – €500', penalty: '€50', ban: '6 months' },
    { amount: '€500 – €1,000', penalty: '€100', ban: '1 year' },
    { amount: '€1,000 – €5,000', penalty: '€200', ban: '2 years' },
    { amount: 'Over €5,000', penalty: '€500', ban: 'Lifetime ban' },
    { amount: 'Multiple scams (any value)', penalty: '€500 + previous', ban: 'Lifetime ban' },
  ];

  const summaryQA = [
    { q: 'What is covered?', a: 'Non delivery, not as described, faulty goods, late delivery' },
    { q: 'How much can I get back?', a: 'Up to €5,000 (€10,000 for Verified members)' },
    { q: 'When must I report?', a: 'Within 3 days of purchase (late delivery exception applies)' },
    { q: 'How do I report?', a: 'Create a support ticket via the Support Page' },
    { q: 'What proof do I need?', a: 'Receipts, messages, photos, tracking, any evidence' },
    { q: 'Do you read my messages?', a: 'Only the specific chat related to your dispute' },
    { q: 'What happens to the scammer?', a: 'Penalty (€10 to €500) and ban (1 month to lifetime)' },
    { q: 'Can I report the same person twice?', a: 'No, only once' },
    { q: 'What if I paid by cash or bank transfer?', a: 'Not covered by Buyer Protection' },
    { q: 'What if my item arrives late?', a: 'Contact us, we can still assist even after 3 days' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 text-gray-800 dark:text-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">Buyer Protection</span>
        </div>

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
              When you make a purchase on Listme.ie using Listme Pay, we have your back with Buyer Protection. That means you may be eligible for a refund (up to €5,000, or up to €10,000 for Verified members).
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold">
              <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Covered up to €5,000 (€10,000 for Verified members)
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" /> 3 Day Reporting Window
              </span>
            </div>
          </div>
        </div>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            What Is Buyer Protection?
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            When you make a purchase on Listme.ie using Listme Pay, we have your back with Buyer Protection. That means you may be eligible for a refund (up to €5,000, or up to €10,000 for Verified members) if your purchase:
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

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            What&apos;s Covered
          </h2>
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-zinc-900 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="p-3.5">Issue</th>
                  <th className="p-3.5">What It Means</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-xs">
                {coveredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/40">
                    <td className="p-3.5 font-bold text-gray-900 dark:text-white whitespace-nowrap">{item.issue}</td>
                    <td className="p-3.5 text-gray-600 dark:text-gray-400">{item.means}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            How It Works
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
              <span className="text-xs font-bold text-primary uppercase block mb-1">Step 1</span>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Contact the Seller</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                Sellers want to keep their good feedback, so most will sort out any problems. Contact the seller, let them know what is wrong, and work with them to resolve it.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
              <span className="text-xs font-bold text-primary uppercase block mb-1">Step 2</span>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Not Resolved? We Can Help</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                If you cannot sort things out with the seller, file a dispute report within 3 days of buying the item. Let us know if the item has not been delivered, is materially different, is faulty, or arrives late.
              </p>
              <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                <p><strong>Important Time Limit:</strong> Our private messaging system deletes messages and chats after 3 days. If you do not report within that time, the chat will be gone and we may not be able to investigate.</p>
                <p><strong>Exception for Late Delivery:</strong> If your item arrives late but eventually turns up, you can still contact us for assistance. Even if the 3 day chat window has passed, we will work with you to resolve the issue using any other evidence you can provide (for example, tracking information, photos, receipts).</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
              <span className="text-xs font-bold text-primary uppercase block mb-1">Step 3</span>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Getting a Refund</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                Once a report has been filed, a Disputes Officer will pick up your case and review the details. They will update you via the support ticket system. If you meet the criteria and everything checks out under our Buyer Protection policy, we can refund your purchase.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            Eligibility Requirements
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            To be eligible for a refund through Buyer Protection, we require you and the seller to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <li>Cooperate with us in good faith to help resolve the dispute or decide whether Buyer Protection applies</li>
            <li>Answer any questions we have about the trade between you and the seller in a timely manner</li>
            <li>Send us any correspondence that is relevant to the trade</li>
            <li>Send us any photos, evidence of purchase, receipts, or other evidence that will help establish the nature and condition of the item, or whether it was delivered</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            Refund Process
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            If we decide to refund you under Buyer Protection, your money will be returned directly to your bank account via refund.
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            If the refund amount is greater than what you originally paid, or if any extra money is owed to you, we will place the additional amount into your Listme Account Credit. This credit can be used for future purchases on Listme.ie.
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            If a direct bank refund will not work (for example, because your bank account has closed), we may determine the most appropriate way to get you your money back, including by deposit into your Listme Account Credit. In this case, we may request your help to find the best solution for you.
          </p>
        </section>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Scammer Penalties
            </h2>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            If we determine you were scammed:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <li>You will be refunded, up to €5,000 (or up to €10,000 for Verified members)</li>
            <li>The scammer will be charged a penalty on their account (see table below)</li>
            <li>The scammer will be banned, from 1 month to lifetime, depending on severity</li>
          </ul>

          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-sm mt-4">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-zinc-900 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="p-3.5">Scam Amount</th>
                  <th className="p-3.5">Penalty</th>
                  <th className="p-3.5">Ban Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-xs">
                {penaltyRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/40">
                    <td className="p-3.5 font-bold text-gray-900 dark:text-white">{row.amount}</td>
                    <td className="p-3.5 font-bold text-red-600 dark:text-red-400">{row.penalty}</td>
                    <td className="p-3.5 text-gray-600 dark:text-gray-400">{row.ban}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 pt-2 text-xs text-gray-600 dark:text-gray-300">
            <h4 className="font-bold text-gray-900 dark:text-white">Repeat Offenders:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>First offence:</strong> Standard penalty and ban</li>
              <li><strong>Second offence:</strong> Double penalty and longer ban</li>
              <li><strong>Third offence:</strong> Lifetime ban and full debt recovery</li>
            </ul>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 font-bold mt-2">
              Important Notice: You can only report the same person ONCE. Make sure you have all your evidence ready before you report.
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              What We Need From You
            </h2>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            When you file a dispute, we will ask for information so we can understand what happened. Please provide:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <li>Payment receipts and screenshots</li>
            <li>Messages with the seller</li>
            <li>Photos of the item (if received)</li>
            <li>Tracking information (if applicable)</li>
          </ul>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-400">
            By filing a dispute, you consent to us reviewing the specific chat between you and the accused scammer. We will only look at that one chat, nothing else.
          </div>
        </section>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Timeframe
            </h2>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            You must file a dispute report within <strong>3 days</strong> of buying the item.
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            This is because our private messaging system automatically deletes messages and chats after 3 days. If the chat has been removed, we may not be able to investigate.
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold leading-relaxed">
            Exception: If your item arrives late (after the 3 day window), you can still contact us for assistance. We will work with you to resolve the issue using any other evidence you can provide.
          </p>
        </section>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            Seller Responsibility
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            When we have returned your money to you, we will debit the seller&apos;s Listme Pay balance or account. If there is not enough money, we may require the seller to pay us directly. We reserve the right to refer the matter to a debt collector if the seller refuses to pay.
          </p>
        </section>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            What Is Not Covered
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <li>Purchases made with cash</li>
            <li>Purchases made with direct bank transfers</li>
            <li>Items that are not collected or delivered due to buyer error (for example, wrong address provided)</li>
            <li>Disputes filed after the 3 day window (unless the item arrives late, see exception above)</li>
            <li>Reports against the same person after you have already filed one report</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Summary
            </h2>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-zinc-900 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="p-3.5">Question</th>
                  <th className="p-3.5">Answer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-xs">
                {summaryQA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/40">
                    <td className="p-3.5 font-bold text-gray-900 dark:text-white whitespace-nowrap">{row.q}</td>
                    <td className="p-3.5 text-gray-600 dark:text-gray-400">{row.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Contact Us
            </h2>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Listme.ie Customer Support — Visit our <Link href="/help?tab=tickets" className="text-primary font-bold hover:underline">Support Page</Link> to create a ticket.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No email support. All support is handled through our ticket system. We aim to respond within 3 to 24 hours.
          </p>
          <p className="text-[11px] text-gray-400 pt-2">
            This Buyer Protection policy forms part of our Terms of Service and Privacy Policy.
          </p>
        </section>

      </div>
    </div>
  );
}
