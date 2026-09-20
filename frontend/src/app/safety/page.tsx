import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Eye, 
  Ban, 
  HelpCircle, 
  CheckCircle2, 
  PhoneCall, 
  MessageSquare, 
  Globe2, 
  FileText, 
  Lock, 
  ExternalLink,
  LifeBuoy,
  XCircle,
  AlertCircle
} from 'lucide-react';

export const revalidate = 60;

export const metadata = {
  title: 'Scam Prevention and Advice | Listme.ie',
  description: 'Listme.ie Scam Prevention and Advice: Safe buying tips, suspicious behaviour detection, scam reporting, refund guidelines, and dedicated support.',
};

export default function SafetyPage() {
  const SAFE_BUYING_TIPS = [
    {
      title: 'Read the Item Description Carefully',
      text: 'If the photos and description look like they have been borrowed from another site, research the item and pricing thoroughly before you bid or purchase.',
      icon: Eye,
    },
    {
      title: "Check the Seller's Feedback History",
      text: 'If the seller has a lot of recent negative or neutral feedback, you may want to reconsider bidding on or buying the item.',
      icon: CheckCircle2,
    },
    {
      title: 'If It Seems Too Good to Be True, It Probably Is',
      text: 'Make sure you understand shipping costs before bidding, and never pay into an overseas bank account or via wire money transfer services.',
      icon: AlertTriangle,
    },
    {
      title: 'Beware of Fake or Pirated Goods',
      text: 'Counterfeit items (such as fake designer handbags, jewellery, and clothing) or unauthorised copies of software, games, music, or movies are illegal and strictly prohibited on Listme.ie. If you see a suspicious listing, report it immediately.',
      icon: ShieldAlert,
    },
    {
      title: 'Never Send Money Overseas',
      text: 'Most sellers on Listme.ie are located in Ireland. Listme approves certain verified members who use secure card payments with Buyer Protection. Never use a wire transfer or money transfer service to send funds overseas.',
      icon: Globe2,
    },
    {
      title: 'Always Complete the Sale on Listme.ie',
      text: 'Contacting buyers or sellers outside of the listing process can be unsafe. Always keep communications and payment processing strictly through our platform.',
      icon: Lock,
    },
    {
      title: 'Get a Verified Phone Number',
      text: 'If you are the winning bidder on a higher value item, ask the seller for a contact phone number in case you need to call or verify collection details.',
      icon: PhoneCall,
    },
    {
      title: 'Keep All Payment Details & Messages',
      text: 'Retain transaction receipts, checkout references, and all correspondence with the seller. These details help our Trust & Safety team investigate and locate the seller if issues arise.',
      icon: FileText,
    },
    {
      title: 'Report Within 3 Days',
      text: 'Our private messaging system automatically deletes messages and chats after 3 days. If you encounter a scam, you must report it within that timeframe so our team can access the required chat logs to investigate.',
      icon: Clock,
    },
  ];

  const SUSPICIOUS_BEHAVIOURS = [
    'Request from the seller to complete the trade offsite.',
    'Request from the seller that the buyer pay into an overseas bank account or via funds transfer service.',
    'Item photos and descriptions are directly lifted from another website.',
    "Multiple memberships are created to push the bidding up (known as 'shilling').",
    "A low bid is placed, and then a second person places a much higher bid which is withdrawn at the last minute so the low bid wins (known as 'bid shielding').",
    'A seller asking you to pay with cash or direct bank transfer to avoid fees — this removes your Buyer Protection.',
    'A seller pressuring you to pay quickly or through unusual, unverified methods.',
    'A seller refusing to provide additional photos or answer reasonable, straightforward questions.',
  ];

  const NEXT_STEPS = [
    {
      title: 'The Buyer Is Refunded',
      desc: 'Eligible victims are refunded up to €5,000 (or up to €10,000 for Verified members) under our Buyer Protection policy.',
      badge: 'Refund up to €5,000 (€10,000 for Verified members)',
      icon: ShieldCheck,
      color: 'text-emerald-500',
    },
    {
      title: 'Scammer Financial Penalty',
      desc: 'The scammer is charged a direct administrative penalty on their account (€10 to €500 based on severity).',
      badge: '€10 to €500 Fine',
      icon: AlertCircle,
      color: 'text-amber-500',
    },
    {
      title: 'Permanent or Timed Ban',
      desc: 'The scammer account is suspended from 1 month to a lifetime permanent ban, with linked card blacklisting.',
      badge: '1 Month to Lifetime Ban',
      icon: Ban,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-10 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <nav className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">Scam Prevention &amp; Advice</span>
        </nav>

        <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Listme Trust &amp; Safety Guide</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Listme.ie – Scam Prevention and Advice
          </h1>

          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
            Listme.ie has dedicated Support Experience and Trust and Safety teams who carefully monitor and swiftly remove inappropriate listings.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Buyer Protection up to €5,000 (€10,000 for Verified members)
            </span>
            <span className="text-gray-300 dark:text-zinc-700">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" /> 3-Day Incident Reporting Window
            </span>
            <span className="text-gray-300 dark:text-zinc-700">•</span>
            <span className="flex items-center gap-1.5">
              <LifeBuoy className="w-3.5 h-3.5 text-primary" /> Dedicated Ticket Support
            </span>
          </div>
        </div>

        
        <section className="space-y-4">
          <div className="border-b border-gray-200 dark:border-zinc-800 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Safe Buying Tips</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              You can help us keep Listme.ie a safe place to buy and sell by reporting any suspicious listings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAFE_BUYING_TIPS.map((tip, idx) => {
              const Icon = tip.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">
                      {tip.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed pl-10.5">
                    {tip.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-gray-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Examples of Suspicious Behaviour</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              If you notice any of the below examples, please let us know immediately:
            </p>
          </div>

          <ul className="space-y-3">
            {SUSPICIOUS_BEHAVIOURS.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-primary" />
              <span>What to Do If You Spot Something Suspicious</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 space-y-1.5">
              <p className="text-xs font-black uppercase tracking-wider text-primary">Step 1</p>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Do not proceed</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Do not proceed with the transaction or send any money offsite.</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 space-y-1.5">
              <p className="text-xs font-black uppercase tracking-wider text-primary">Step 2</p>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Report the listing</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Use the report button located on the listing page to flag it for immediate review.</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 space-y-1.5">
              <p className="text-xs font-black uppercase tracking-wider text-primary">Step 3</p>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Contact our Support team</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Create a support ticket via the Support Page in your account panel.</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 space-y-1.5">
              <p className="text-xs font-black uppercase tracking-wider text-primary">Step 4</p>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Keep all evidence</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Save screenshots, messages, and payment records to attach to your dispute.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/help"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
            >
              Open Support Ticket
            </Link>
            <Link
              href="/buyer-protection"
              className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 font-bold text-xs sm:text-sm transition-colors"
            >
              Read Buyer Protection Policy
            </Link>
          </div>
        </section>

        
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              What Happens Next
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              If our Trust and Safety team determines someone has been scammed:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {NEXT_STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div 
                  key={idx}
                  className="p-5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <Icon className={`w-5 h-5 ${step.color}`} />
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    {step.badge}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-300 leading-relaxed flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Important Notice:</strong> You can only report the same person once, so make sure you have all your evidence ready before you report.
            </div>
          </div>
        </section>

        
        <section className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            Contact Us
          </h2>

          <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <p className="font-bold text-gray-900 dark:text-white">
              Listme.ie Customer Support
            </p>
            <p>
              Visit our <Link href="/help" className="text-primary hover:underline font-bold">Support Page</Link> to create an authenticated support ticket.
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              <strong>No email support</strong> – all support is handled through our ticket system for record retention and fraud tracking.
            </p>
            <p>
              We aim to respond within <strong>3 to 24 hours</strong>.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-400 dark:text-gray-500">
            This Scam Prevention and Advice page forms part of our{' '}
            <Link href="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/buyer-protection" className="text-primary hover:underline font-medium">Buyer Protection policy</Link>.
          </div>
        </section>

      </div>
    </div>
  );
}
