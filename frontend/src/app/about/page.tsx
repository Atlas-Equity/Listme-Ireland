import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Heart, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  AlertTriangle,
  Scale
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Listme.ie',
  description: 'Learn about Listme.ie: Irish-owned and operated marketplace built from €0 to protect Irish buyers and sellers from scammers. 100% human support and 10% of income donated to charity.',
};

export default function AboutPage() {
  const sections = [
    { id: 'our-story', title: '1. Our Story' },
    { id: 'who-we-are', title: '2. Who We Are' },
    { id: 'community-first', title: '3. Our Community First Philosophy' },
    { id: 'scam-protection', title: '4. Scam Protection — Built to Keep You Safe' },
    { id: 'human-support-only', title: '5. Human Support Only' },
    { id: 'giving-back', title: '6. Giving Back — 10% to Charity' },
    { id: 'our-aim', title: '7. Our Aim' },
    { id: 'what-we-offer', title: '8. What We Offer' },
    { id: 'our-commitment', title: '9. Our Commitment to You' },
    { id: 'feedback-and-start', title: '10. Feedback & Getting Started' },
  ];

  const charityCauses = [
    { cause: 'Autism Awareness', percentage: '25%' },
    { cause: 'Autism Research', percentage: '25%' },
    { cause: 'Asperger Syndrome', percentage: '25%' },
    { cause: 'Cancer Research', percentage: '25%' },
  ];

  const whatWeOffer = [
    { feature: 'Marketplace', whatItMeans: 'Buy and sell goods across Ireland' },
    { feature: 'Business Pages', whatItMeans: 'Sellers can create their own branded storefront' },
    { feature: 'Buyer Protection', whatItMeans: 'Up to €5,000 protection on eligible purchases' },
    { feature: 'Human Support', whatItMeans: 'Every ticket handled by a real person' },
    { feature: 'Community Focus', whatItMeans: '10% of income donated to charity' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#121212] text-gray-800 dark:text-gray-200 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-400 dark:text-gray-500">Community</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">About Listme.ie</span>
        </nav>

        <div className="border-b border-gray-200 dark:border-zinc-800 pb-8 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            About Listme.ie
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Irish Owned. Irish Operated. Community First.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 p-5 bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                Contents
              </h2>
              <ul className="space-y-1.5 text-xs">
                {sections.map((sec) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      className="block py-1 px-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-medium truncate"
                    >
                      {sec.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9 space-y-10">
            <section id="our-story" className="p-6 sm:p-8 bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>1. Our Story</span>
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Listme.ie was founded with a simple goal: to build a community of like minded people across Ireland who could come together to help each other, trade safely, and find great deals.
              </p>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                We are proudly Irish owned and Irish operated. Every decision we make is guided by one question: does this make life better for the people of Ireland? We are not a global corporation. We are not backed by overseas investors with no connection to this country. We are built by Irish people, for Irish people.
              </p>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Listme.ie was built off of €0. It started as a project. A passion project with one mission: to create a safe, secure marketplace where people can shop online without having to worry about scammers. No big budget. No corporate backing. Just a determination to build something better for Ireland.
              </p>
            </section>

            <section id="who-we-are" className="p-6 sm:p-8 bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                2. Who We Are
              </h2>
              <p className="text-base font-bold text-primary">
                Irish Owned. Irish Operated. Irish Only.
              </p>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Listme.ie operates exclusively in Ireland. We are not a global platform with an Irish section. We are Irish through and through.
              </p>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                We are committed to supporting Irish communities, Irish businesses, and Irish buyers and sellers. Every euro spent on Listme.ie stays in Ireland, circulates in Ireland, and supports Irish livelihoods.
              </p>
            </section>

            <section id="community-first" className="p-6 sm:p-8 bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                3. Our Community First Philosophy
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Everything we do is built around our community.
              </p>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                We do not treat our users as numbers on a spreadsheet. We do not sell your data to advertisers. We do not use AI chatbots to handle your problems. We do not hide behind automated responses.
              </p>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-900 dark:text-white">
                When you need help, you speak to a real human being.
              </div>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Our support team is made up of real people who live in Ireland, understand Irish users, and are empowered to actually solve problems. No scripts. No bots. No endless email loops. Just real people helping real people.
              </p>
            </section>

            <section id="scam-protection" className="p-6 sm:p-8 bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                4. Scam Protection — Built to Keep You Safe
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Listme.ie was built with one core mission: to protect people from scammers.
              </p>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                We know how frustrating it is to shop online and constantly worry about being ripped off. We have seen the damage scammers do. The money lost. The trust broken. The stress caused. That is why we built Listme.ie differently.
              </p>
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Our scam protection includes:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 pl-2">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                    <span>Buyer Protection up to €5,000 on eligible purchases</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                    <span>Real human investigation of every scam report. No bots, no automation</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                    <span>Fast penalties for scammers. €5 to €500 fines and bans from 1 month to lifetime</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                    <span>Chat logs preserved for 3 days so evidence exists if you need to report</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                    <span>Report within 3 days and we will investigate and refund if you were scammed</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                    <span>An Garda Síochána reporting for extreme cases</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white pt-2">
                We want you to shop online without fear. That is the whole point of Listme.ie.
              </p>
            </section>

            <section id="human-support-only" className="p-6 sm:p-8 bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                5. Human Support Only
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Listme.ie does NOT use AI chatbots, automated support systems, or artificial intelligence to handle customer queries.
              </p>
              <div className="space-y-1.5 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Every support ticket is:
                </p>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 pl-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Read by a real human</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Investigated by a real human</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Resolved by a real human</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 pt-2">
                We believe that when you have a problem, whether it is a scam, a dispute, or a simple question, you deserve to talk to a person who can actually help you.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                This is more expensive for us. It is slower than automation. But it is the right thing to do, and it is what our community deserves.
              </p>
            </section>

            <section id="giving-back" className="p-6 sm:p-8 bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                6. Giving Back — 10% of Our Income to Charity
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Listme.ie is committed to giving back to the Irish community that supports us.
              </p>
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm font-bold text-primary">
                We donate 10% of our income to charity.
              </div>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                No matter if we make €8,000 or €80,000,000, we will always donate 10% to what we believe in. That is a promise.
              </p>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs sm:text-sm border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold">
                    <tr>
                      <th className="py-3 px-4">Cause</th>
                      <th className="py-3 px-4 text-right">Percentage of Our Charitable Giving</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {charityCauses.map((c, i) => (
                      <tr key={i}>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{c.cause}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-primary">{c.percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 pt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                <p>
                  <strong className="text-gray-900 dark:text-white">Autism Awareness:</strong> We support organisations and initiatives that promote understanding, acceptance, and support for autistic people and their families across Ireland.
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-white">Autism Research:</strong> We support Irish research into autism, helping to improve understanding, diagnosis, and support for autistic people across Ireland.
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-white">Asperger Syndrome:</strong> We support organisations and initiatives that provide support, resources, and advocacy for people with Asperger syndrome and their families across Ireland.
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-white">Cancer Research:</strong> We support Irish cancer research organisations working to prevent, diagnose, and treat cancer, and to improve the lives of those affected by it.
                </p>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 italic pt-1">
                As Listme.ie grows, our charitable giving grows with it. The more we earn, the more we give.
              </p>
            </section>

            <section id="our-aim" className="p-6 sm:p-8 bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                7. Our Aim
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Our aim is to build the largest secure marketplace in Ireland. A place where users can buy and sell online with confidence.
              </p>
              <div className="space-y-2 pt-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  We want Listme.ie to be:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 pl-2">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                    <span><strong>Safe</strong> — with real human support, Buyer Protection, and strong scam prevention</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                    <span><strong>Fair</strong> — with transparent fees and no hidden charges</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                    <span><strong>Irish</strong> — built for Ireland, owned by Ireland, giving back to Ireland</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                    <span><strong>Community driven</strong> — shaped by the people who use it</span>
                  </li>
                </ul>
              </div>
            </section>

            <section id="what-we-offer" className="p-6 sm:p-8 bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                8. What We Offer
              </h2>
              <div className="overflow-x-auto pt-1">
                <table className="w-full text-left text-xs sm:text-sm border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold">
                    <tr>
                      <th className="py-3 px-4">Feature</th>
                      <th className="py-3 px-4">What It Means</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {whatWeOffer.map((w, i) => (
                      <tr key={i}>
                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">{w.feature}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{w.whatItMeans}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="our-commitment" className="p-6 sm:p-8 bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                9. Our Commitment to You
              </h2>
              <ul className="space-y-2.5 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>We will never sell your personal data.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>We will never use AI to handle your support tickets.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>We will always be transparent about our fees.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>We will always be Irish owned and Irish operated.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>We will always give 10% of our income to charity.</span>
                </li>
              </ul>
            </section>

            <section id="feedback-and-start" className="p-6 sm:p-8 bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                10. Feedback and Getting Started
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <strong>Your Feedback Shapes Our Future:</strong> If you have any suggestions on how we can improve the experience, please let us know. Your ideas and feedback are invaluable and help shape Listme.ie into the future. We read every message, and we act on the best ones.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <span>Contact us at Help Centre</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white font-bold text-xs hover:border-gray-400 transition-colors shadow-xs"
                >
                  <span>Start Using Listme.ie Today</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p className="font-bold text-gray-800 dark:text-gray-200">
                  Listme.ie — Irish Owned. Irish Operated. Community First.
                </p>
                <p>
                  For more information on our policies and operations, please see our{' '}
                  <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>,{' '}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, and{' '}
                  <Link href="/forbidden-items" className="text-primary hover:underline">Forbidden Items list</Link>.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
