import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | Listme.ie',
  description: 'Learn about Listme.ie: Irish-owned marketplace built from €0 to protect Irish buyers and sellers from scammers. 100% human support and 10% of income donated to charity.',
};

export default function AboutPage() {
  const sections = [
    { id: 'our-story', title: 'Our Story' },
    { id: 'who-we-are', title: 'Who We Are' },
    { id: 'community-first', title: 'Our Community First Philosophy' },
    { id: 'scam-protection', title: 'Scam Protection — Built to Keep You Safe' },
    { id: 'human-support-only', title: 'Human Support Only' },
    { id: 'giving-back', title: 'Giving Back — 10% of Our Income to Charity' },
    { id: 'our-aim', title: 'Our Aim' },
    { id: 'what-we-offer', title: 'What We Offer' },
    { id: 'our-commitment', title: 'Our Commitment to You' },
    { id: 'feedback-and-start', title: 'Feedback & Getting Started' },
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-200 py-8 lg:py-12">
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
          
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3">
                ON THIS PAGE
              </h2>
              <nav className="space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-h-[70vh] overflow-y-auto pr-1">
                {sections.map((section, idx) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="w-full text-left block py-1.5 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-primary transition-colors"
                  >
                    {idx + 1}. {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-8 xl:col-span-9 space-y-12">
            
            <section id="our-story" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-zinc-800">
                1. Our Story
              </h2>
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                <p>
                  Listme.ie was founded with a simple goal: to build a community of like-minded people across Ireland who could come together to help each other, trade safely, and find great deals.
                </p>
                <p>
                  We are proudly Irish-owned and Irish-operated. Every decision we make is guided by one question: does this make life better for the people of Ireland? We are not a global corporation. We are not backed by overseas investors with no connection to this country. We are built by Irish people, for Irish people.
                </p>
                <p>
                  Listme.ie was built off of €0. It started as a project — a passion project with one mission: to create a safe, secure marketplace where people can shop online without having to worry about scammers. No big budget. No corporate backing. Just a determination to build something better for Ireland.
                </p>
              </div>
            </section>

            <section id="who-we-are" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-zinc-800">
                2. Who We Are
              </h2>
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                <p className="font-semibold text-gray-900 dark:text-white">
                  Irish Owned. Irish Operated. Irish Only.
                </p>
                <p>
                  Listme.ie operates exclusively in Ireland. We are not a global platform with an Irish section. We are Irish through and through.
                </p>
                <p>
                  We are committed to supporting Irish communities, Irish businesses, and Irish buyers and sellers. Every euro spent on Listme.ie stays in Ireland, circulates in Ireland, and supports Irish livelihoods.
                </p>
              </div>
            </section>

            <section id="community-first" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-zinc-800">
                3. Our Community First Philosophy
              </h2>
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                <p>
                  Everything we do is built around our community.
                </p>
                <p>
                  We do not treat our users as numbers on a spreadsheet. We do not sell your data to advertisers. We do not use AI chatbots to handle your problems. We do not hide behind automated responses.
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  When you need help, you speak to a real human being.
                </p>
                <p>
                  Our support team is made up of real people who live in Ireland, understand Irish users, and are empowered to actually solve problems. No scripts. No bots. No endless email loops. Just real people helping real people.
                </p>
              </div>
            </section>

            <section id="scam-protection" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-zinc-800">
                4. Scam Protection — Built to Keep You Safe
              </h2>
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                <p>
                  Listme.ie was built with one core mission: to protect people from scammers.
                </p>
                <p>
                  We know how frustrating it is to shop online and constantly worry about being ripped off. We have seen the damage scammers do — the money lost, the trust broken, the stress caused. That is why we built Listme.ie differently.
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  Our scam protection includes:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  <li>Buyer Protection up to €5,000 on eligible purchases</li>
                  <li>Real human investigation of every scam report — no bots, no automation</li>
                  <li>Fast penalties for scammers — €5 to €500 fines and bans from 1 month to lifetime</li>
                  <li>Chat logs preserved for 3 days so evidence exists if you need to report</li>
                  <li>Report within 3 days and we will investigate and refund if you were scammed</li>
                  <li>An Garda Síochána reporting for extreme cases</li>
                </ul>
                <p>
                  We want you to shop online without fear. That is the whole point of Listme.ie.
                </p>
              </div>
            </section>

            <section id="human-support-only" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-zinc-800">
                5. Human Support Only
              </h2>
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                <p className="font-semibold text-gray-900 dark:text-white">
                  Listme.ie does NOT use AI chatbots, automated support systems, or artificial intelligence to handle customer queries.
                </p>
                <p>
                  Every support ticket is:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  <li>Read by a real human</li>
                  <li>Investigated by a real human</li>
                  <li>Resolved by a real human</li>
                </ul>
                <p>
                  We believe that when you have a problem — whether it&apos;s a scam, a dispute, or a simple question — you deserve to talk to a person who can actually help you.
                </p>
                <p>
                  This is more expensive for us. It is slower than automation. But it is the right thing to do, and it is what our community deserves.
                </p>
              </div>
            </section>

            <section id="giving-back" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-zinc-800">
                6. Giving Back — 10% of Our Income to Charity
              </h2>
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                <p>
                  Listme.ie is committed to giving back to the Irish community that supports us.
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  We donate 10% of our income to charity.
                </p>
                <p>
                  The founder of Listme.ie has Asperger syndrome and autism. That is why we back these causes. It is personal. It is meaningful. And it is why the team at Listme.ie is fully committed to supporting them.
                </p>
                <p>
                  Our charitable giving is split as follows:
                </p>

                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-gray-100 dark:bg-zinc-800/70 text-gray-900 dark:text-white text-xs uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Cause</th>
                        <th className="py-3 px-4 font-semibold">Percentage of Our Charitable Giving</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-gray-700 dark:text-gray-300">
                      {charityCauses.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            {item.cause}
                          </td>
                          <td className="py-3 px-4">
                            {item.percentage}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 pt-2">
                  <p>
                    <strong>Autism Awareness:</strong> We support organisations and initiatives that promote understanding, acceptance, and support for autistic people and their families across Ireland.
                  </p>
                  <p>
                    <strong>Autism Research:</strong> We support Irish research into autism, helping to improve understanding, diagnosis, and support for autistic people across Ireland.
                  </p>
                  <p>
                    <strong>Asperger Syndrome:</strong> We support organisations and initiatives that provide support, resources, and advocacy for people with Asperger syndrome and their families across Ireland.
                  </p>
                  <p>
                    <strong>Cancer Research:</strong> We support Irish cancer research organisations working to prevent, diagnose, and treat cancer, and to improve the lives of those affected by it.
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic pt-1">
                  As Listme.ie grows, our charitable giving grows with it. The more we earn, the more we give.
                </p>
              </div>
            </section>

            <section id="our-aim" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-zinc-800">
                7. Our Aim
              </h2>
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                <p>
                  Our aim is to build the largest secure marketplace in Ireland — a place where users can buy and sell online with confidence.
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  We want Listme.ie to be:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  <li><strong>Safe</strong> — with real human support, Buyer Protection, and strong scam prevention</li>
                  <li><strong>Fair</strong> — with transparent fees and no hidden charges</li>
                  <li><strong>Irish</strong> — built for Ireland, owned by Ireland, giving back to Ireland</li>
                  <li><strong>Community-driven</strong> — shaped by the people who use it</li>
                </ul>
              </div>
            </section>

            <section id="what-we-offer" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-zinc-800">
                8. What We Offer
              </h2>
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-gray-100 dark:bg-zinc-800/70 text-gray-900 dark:text-white text-xs uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Feature</th>
                        <th className="py-3 px-4 font-semibold">What It Means</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-gray-700 dark:text-gray-300">
                      {whatWeOffer.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            {item.feature}
                          </td>
                          <td className="py-3 px-4">
                            {item.whatItMeans}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section id="our-commitment" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-zinc-800">
                9. Our Commitment to You
              </h2>
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  <li>We will never sell your personal data.</li>
                  <li>We will never use AI to handle your support tickets.</li>
                  <li>We will always be transparent about our fees.</li>
                  <li>We will always be Irish-owned and Irish-operated.</li>
                  <li>We will always give 10% of our income to charity.</li>
                </ul>
              </div>
            </section>

            <section id="feedback-and-start" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-zinc-800">
                10. Feedback &amp; Getting Started
              </h2>
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Your Feedback Shapes Our Future:</strong> If you have any suggestions on how we can improve the experience, please let us know. Your ideas and feedback are invaluable and help shape Listme.ie into the future. We read every message, and we act on the best ones.
                </p>
                <p>
                  Contact us at:{' '}
                  <Link href="/help" className="text-primary hover:underline font-semibold">
                    https://www.listme.ie/help
                  </Link>
                </p>
                <p>
                  <strong>Start Using Listme.ie Today:</strong> Sign up today at{' '}
                  <Link href="/register" className="text-primary hover:underline font-semibold">
                    https://www.listme.ie/register
                  </Link>
                </p>
                <p className="font-bold text-gray-900 dark:text-white pt-2">
                  Listme.ie — Irish Owned. Irish Operated. Community First.
                </p>
              </div>
            </section>

            <div className="p-4 rounded-xl bg-gray-100 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              For more information on our policies and operations, please see our{' '}
              <Link href="/terms" className="text-primary hover:underline font-semibold">Terms of Service</Link>,{' '}
              <Link href="/privacy" className="text-primary hover:underline font-semibold">Privacy Policy</Link>, and{' '}
              <Link href="/forbidden-items" className="text-primary hover:underline font-semibold">Forbidden Items</Link> list.
            </div>

          </main>
        </div>

      </div>
    </div>
  );
}
