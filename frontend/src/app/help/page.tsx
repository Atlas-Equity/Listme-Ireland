'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  Search, 
  ShieldCheck, 
  Package, 
  Building2, 
  CreditCard, 
  Phone, 
  Mail, 
  Send, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  LifeBuoy
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'How does Listme ensure 0% success fees?',
    answer: 'Listme never charges final value commissions or percentage fees on your sales. Sellers keep 100% of the sale price. We offer optional premium listing upgrades and verified business storefront plans.',
    category: 'selling',
  },
  {
    question: 'What is Listme Buyer Protection up to €5,000?',
    answer: 'Every eligible purchase completed through Listme verified accounts or escrow is covered up to €5,000 against non-delivery, counterfeit goods, or items substantially not as described.',
    category: 'protection',
  },
  {
    question: 'How do I edit or delete my business page?',
    answer: 'If you are the owner, navigate to "My ListMe" > "Business Pages" or open your public page URL (/page/your-slug). You will see direct "Edit Page" and "Delete Page" buttons to manage opening hours, announcement, and details.',
    category: 'business',
  },
  {
    question: 'How do Watchlist and Favourites work?',
    answer: 'Click the yellow corner bookmark or heart on any listing to save it to your Watchlist. You can track auction closes and receive instant notifications. Favourite sellers can be managed in "My ListMe" > "Favourite Sellers".',
    category: 'buying',
  },
  {
    question: 'Why are phone numbers locked to Irish +353 numbers?',
    answer: 'Listme is tailored strictly for Irish residents across all 26 counties to safeguard our marketplace from international spam, scrapers, and fraudulent out-of-region operators.',
    category: 'account',
  },
];

export default function HelpCentrePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  
  // Contact Support Form State with locked +353 Irish phone prefix
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+353 ');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+353 ')) {
      val = '+353 ' + val.replace(/^\+?353\s?/, '');
    }
    setPhone(val);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !message) return;
    setIsSubmitted(true);
  };

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-black py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
            <LifeBuoy className="w-4 h-4" />
            <span>Listme Help &amp; Support Centre</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
            Find answers to common questions about buying, selling, business storefronts, and buyer protection across Ireland.
          </p>

          {/* Quick Search */}
          <div className="relative mt-6 max-w-lg mx-auto">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles, topics, or keywords..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818] text-gray-900 dark:text-white text-xs sm:text-sm shadow-xs outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Quick Help Topic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-primary/50 transition-colors">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit mb-3">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
              Selling &amp; 0% Fees
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              How to list items, 7-day auto relisting, and zero sales commissions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-primary/50 transition-colors">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 w-fit mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
              Buyer Protection
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Escrow guarantees, item condition disputes, and up to €5,000 coverage.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-primary/50 transition-colors">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 w-fit mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
              Business Pages
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Service hubs, marketplace store setups, opening hours &amp; announcements.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-primary/50 transition-colors">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 w-fit mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
              Payments &amp; Cards
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Linked credit cards, Stripe vaults, and scam prevention escrow.
            </p>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs mb-12">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Instant answers to the most common inquiries on Listme.
              </p>
            </div>
            <span className="text-xs font-semibold text-primary">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'Article' : 'Articles'}
            </span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-zinc-800/80">
            {filteredFaqs.map((faq, idx) => (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 text-left font-bold text-sm text-gray-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {expandedFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>

                {expandedFaq === idx && (
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed pr-6">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Form (Strictly locked to Irish +353) */}
        <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Still need help? Contact Support
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Our support team is located in Dublin, Ireland. We typically respond within 2 hours.
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-emerald-900 dark:text-emerald-200">
                  Support Ticket Submitted!
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                  Thank you, <span className="font-bold">{fullName}</span>. A confirmation has been logged for <span className="font-bold">{email}</span>. A support agent will contact you shortly at <span className="font-mono">{phone}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-2 text-xs font-bold text-primary underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Liam Murphy"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. liam@example.ie"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Contact Phone (Locked strictly to Ireland +353) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="+353 87 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs font-mono outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Inquiry Topic
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Listing / Relisting Support">Listing / Relisting Support</option>
                      <option value="Buyer Protection & Disputes">Buyer Protection &amp; Disputes</option>
                      <option value="Business Storefront Management">Business Storefront Management</option>
                      <option value="Payment & Stripe Escrow">Payment &amp; Stripe Escrow</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Describe your question or issue *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details on your listing, account, or question..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
