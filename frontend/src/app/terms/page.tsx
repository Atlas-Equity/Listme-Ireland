'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronRight, FileText, Plus, Minus, ChevronsUpDown } from 'lucide-react';

interface Clause {
  id: string;
  number: string;
  title: string;
  content: string[];
  translation?: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
}

interface Section {
  id: string;
  number: number;
  title: string;
  clauses: Clause[];
}

const termsData: Section[] = [
  {
    id: 'section-1',
    number: 1,
    title: 'What Listme.ie Does',
    clauses: [
      {
        id: '1.1',
        number: '1.1',
        title: 'We provide an online marketplace for people in Ireland to buy and sell goods',
        content: [
          "Our aim in providing Listme.ie is to connect people across Ireland to trade easily, safely, and transparently.",
          "We provide an online venue to introduce Members in various ways, and to allow Members to advertise and trade electronics, clothing, furniture, collectibles, home goods, and more."
        ],
        translation: "We're like a digital marketplace that connects buyers and sellers across Ireland."
      },
      {
        id: '1.2',
        number: '1.2',
        title: 'We do not sell anything ourselves or participate in transactions',
        content: [
          "In providing the Listme.ie venue, we don't participate in the actual sale of items or the transaction itself.",
          "We don't own any items listed on our site and don't offer them for sale, nor do we act as an agent or auctioneer for either party. We also don't take part in the actual provision of Member services."
        ],
        translation: "We're like a shopping mall, but without the physical building. We don't own or sell the items."
      },
      {
        id: '1.3',
        number: '1.3',
        title: 'We do not handle real estate or motor vehicles',
        content: [
          "Listme.ie strictly prohibits listings of real estate (houses, apartments, commercial leases, land) and motor vehicles (cars, vans, motorbikes, trucks).",
          "Any real estate or automotive listings will be removed immediately, and repeated attempts to list in these categories will result in account suspension."
        ],
        translation: "No houses or cars—you cannot list or sell real estate or motor vehicles here."
      },
      {
        id: '1.4',
        number: '1.4',
        title: 'We do not handle shipping, postage, or delivery logistics',
        content: [
          "Listme.ie does not operate a courier service, warehouse, or transit escrow service.",
          "All shipping arrangements, postage costs, collection times, and transit risk are negotiated, arranged, and agreed solely between the buyer and the seller."
        ],
        translation: "Shipping and collection are entirely up to you and the other member to arrange between yourselves."
      }
    ]
  },
  {
    id: 'section-2',
    number: 2,
    title: 'Who Can Join',
    clauses: [
      {
        id: '2.1',
        number: '2.1',
        title: 'You must be 18 or older and a resident of Ireland',
        content: [
          "To register an account, list items, or place bids on Listme.ie, you must be at least 18 years of age.",
          "Our service is designed specifically for the Irish market; you must be an active resident living in Ireland to register."
        ],
        translation: "You must be an adult living in Ireland to create an account and trade on Listme.ie."
      },
      {
        id: '2.2',
        number: '2.2',
        title: 'You need one account only—no fake profiles',
        content: [
          "Each individual is permitted one Member account only. Creating multiple profiles, operating secondary backup accounts, or using pseudonyms to evade restrictions is strictly prohibited.",
          "Operating duplicate accounts will result in immediate termination of all linked profiles."
        ],
        translation: "One account per person only. No fake profiles, burner accounts, or multiple identities."
      },
      {
        id: '2.3',
        number: '2.3',
        title: 'Keep your login details safe and your account info up to date',
        content: [
          "You are solely responsible for keeping your password and login credentials confidential.",
          "You must keep your account contact details, phone number, email, and address accurate and up to date at all times."
        ],
        translation: "Keep your password secret and make sure your profile info is always accurate."
      }
    ]
  },
  {
    id: 'section-3',
    number: 3,
    title: 'What We Expect From You',
    clauses: [
      {
        id: '3.1',
        number: '3.1',
        title: 'Be honest and list items accurately',
        content: [
          "You must describe your items truthfully and completely. Disclose any faults, wear, marks, battery health issues, or prior repairs.",
          "Do not use misleading photos or false specifications to deceive buyers."
        ],
        translation: "Be honest—list your items accurately and don't mislead anyone about their condition."
      },
      {
        id: '3.2',
        number: '3.2',
        title: 'Be legal and do not sell prohibited goods',
        content: [
          "You must not list or sell stolen property, counterfeit items, recalled goods, illegal substances, weapons, or anything hazardous or unsafe.",
          "All listings must comply with Irish consumer protection and criminal legislation."
        ],
        translation: "Don't sell illegal, stolen, or unsafe items. Obey Irish law."
      },
      {
        id: '3.3',
        number: '3.3',
        title: 'Don\'t cheat, manipulate bids, or avoid fees',
        content: [
          "Fake bidding (shill bidding)—including having friends or family bid on your auctions to push up the price—is strictly prohibited.",
          "You must not spam members, post deceptive offers, or attempt to trade off-site to avoid marketplace fees."
        ],
        translation: "Play fair—no fake bidding, no spamming, and don't try to avoid our platform fees."
      },
      {
        id: '3.4',
        number: '3.4',
        title: 'Don\'t scrape or harvest platform data',
        content: [
          "You must not use automated scripts, bots, spiders, or web scrapers to access, copy, or index Listme.ie listings or user data without express written permission.",
          "Any automated scraping attempts will be blocked and may result in legal action."
        ],
        translation: "No using bots or automated scraping tools to copy data from our website."
      }
    ]
  },
  {
    id: 'section-4',
    number: 4,
    title: 'Fees',
    clauses: [
      {
        id: '4.1',
        number: '4.1',
        title: 'Fees are shown clearly before you list or buy anything',
        content: [
          "All platform fees—including listing upgrades, seller success fees, and payment processing charges—are clearly presented before you confirm any action.",
          "You will never be charged a surprise or hidden fee."
        ],
        translation: "We show you all fees upfront before you list or buy, with no hidden surprises."
      },
      {
        id: '4.2',
        number: '4.2',
        title: 'We may change fees from time to time with advance notice',
        content: [
          "We reserve the right to review and adjust our fee schedules periodically to reflect marketplace improvements.",
          "Any fee updates will be published on our fee schedules in advance so you always know costs before listing."
        ],
        translation: "If fees ever change, we'll always inform you in advance so you know what you're paying."
      }
    ]
  },
  {
    id: 'section-5',
    number: 5,
    title: 'Listing & Selling',
    clauses: [
      {
        id: '5.1',
        number: '5.1',
        title: 'Only list items you actually have in hand',
        content: [
          "You must only list items that you physically possess or have verified, immediate authorization to sell.",
          "Drop-shipping from third-party retailers without possession is not permitted."
        ],
        translation: "Only sell goods that you actually have and can hand over or ship immediately."
      },
      {
        id: '5.2',
        number: '5.2',
        title: 'No real estate, no cars, and no motorbikes',
        content: [
          "Listme.ie does not cater to real estate or motor vehicle listings.",
          "Do not post listings for houses, apartments, plots of land, cars, commercial vehicles, or motorcycles."
        ],
        translation: "Vehicles and property are strictly banned from our listings."
      },
      {
        id: '5.3',
        number: '5.3',
        title: 'You must clearly state your shipping and collection terms',
        content: [
          "Every listing must explicitly state delivery terms: whether the item is collection-only, who pays postage, estimated shipping costs, and accepted courier options.",
          "Sellers cannot demand extra unlisted shipping charges after a purchase is made."
        ],
        translation: "State your shipping cost and collection terms clearly before accepting bids or buyers."
      },
      {
        id: '5.4',
        number: '5.4',
        title: 'For auctions, you must sell to the highest bidder if reserve is met',
        content: [
          "When you run an auction and the bidding reaches or exceeds your reserve price (or starting bid if no reserve is set), you are legally obligated to complete the trade with the winning bidder.",
          "You cannot refuse to sell because you hoped for a higher final price."
        ],
        translation: "If your auction ends with a winning bidder at or above your reserve, you must sell to them."
      },
      {
        id: '5.5',
        number: '5.5',
        title: 'For classifieds, you can choose who to sell to',
        content: [
          "For fixed-price or classified listings, sellers retain discretion in accepting, negotiating, or declining prospective buyers.",
          "Once you formally accept an offer, you are expected to honour that agreement."
        ],
        translation: "For classifieds, you can decide which buyer to deal with."
      }
    ]
  },
  {
    id: 'section-6',
    number: 6,
    title: 'Buying',
    clauses: [
      {
        id: '6.1',
        number: '6.1',
        title: 'Only bid or buy if you intend to pay—it creates a legal contract',
        content: [
          "Submitting a winning bid or confirming an instant Buy Now creates a legally binding contract between you and the seller to purchase the item.",
          "Do not bid on auctions unless you are prepared to pay the final amount promptly."
        ],
        translation: "Bidding or buying means you commit to paying. Don't bid if you aren't sure."
      },
      {
        id: '6.2',
        number: '6.2',
        title: 'Check the listing carefully and understand the seller\'s terms',
        content: [
          "It is your responsibility as a buyer to review the item condition, photos, description, and the seller's location and delivery terms prior to committing.",
          "If an item is marked 'Collection Only', you must be able to collect it in person."
        ],
        translation: "Read the listing carefully and make sure you can manage the collection or postage terms."
      },
      {
        id: '6.3',
        number: '6.3',
        title: 'Non-payment can lead to complaints and account suspension',
        content: [
          "If you win an auction or commit to Buy Now and fail to pay, the seller has the right to file a non-payment dispute with our team.",
          "Repeated or deliberate non-payment will result in immediate suspension or permanent banning of your account."
        ],
        translation: "If you buy and don't pay, the seller can report you and we can ban your account."
      }
    ]
  },
  {
    id: 'section-7',
    number: 7,
    title: 'If You Get Scammed (Buyer Protection & Penalties)',
    clauses: [
      {
        id: '7.1',
        number: '7.1',
        title: 'What You Do: Contact real human support and send your proof',
        content: [
          "Contact our customer support team immediately. All dispute tickets are handled directly by real human support staff (not automated bots).",
          "Send us clear proof: payment records (bank or Revolut transfer confirmations), screenshots of communication, photos of packaging, or tracking numbers.",
          "By contacting customer support regarding a scam or dispute, you explicitly consent to our Trust & Safety personnel accessing and inspecting the private message log between you and that specific accused user."
        ],
        translation: "Reach out to our real human support, send proof of payment and messages, and give consent for us to review that specific chat."
      },
      {
        id: '7.2',
        number: '7.2',
        title: 'What We Do: Thorough investigation, refunds, and €5 scammer fine',
        content: [
          "We will investigate using the evidence you provide and (with your consent) we'll check the private chat logs between you and the accused scammer.",
          "If we determine you were scammed, we'll refund you under our Buyer Protection Policy.",
          "We will charge a mandatory €5 administrative penalty to the scammer's account balance (deducted from their account or invoiced to them)."
        ],
        translation: "We check the evidence and chat logs. If you were scammed, we refund you and fine the scammer €5."
      },
      {
        id: '7.3',
        number: '7.3',
        title: 'Scam severity, penalties, and ban length schedule',
        content: [
          "Depending on the severity and financial impact of the scam, the scammer will be suspended or permanently banned according to the schedule below:",
          "Listme.ie holds sole and final authority on all refunds, penalties, and suspensions."
        ],
        translation: "Scam someone and you'll pay a €5 fee and lose your account for a while. Do it big or do it twice, and you're gone for good.",
        table: {
          headers: ['Scam Severity', 'Ban Length', 'Account Penalty'],
          rows: [
            ['Minor / low-value scam', '1 month suspension', '€5 penalty + full refund restitution'],
            ['Medium-value scam', '6 months to 1 year ban', '€5 penalty + full refund restitution'],
            ['High-value scam', '1 to 3 years ban', '€5 penalty + full refund restitution'],
            ['Multiple scams or extreme cases', 'Lifetime permanent ban', 'Account closed & reported to An Garda Síochána']
          ]
        }
      }
    ]
  },
  {
    id: 'section-8',
    number: 8,
    title: 'Private Messaging on Our Platform',
    clauses: [
      {
        id: '8.1',
        number: '8.1',
        title: 'We provide a private messaging system for Members to communicate',
        content: [
          "We provide a built-in private messaging tool for Members to communicate regarding listings, ask item questions, and coordinate collection logistics.",
          "Members should keep communications on-platform to ensure dispute coverage."
        ],
        translation: "Use our chat system to talk about items and arrange collection."
      },
      {
        id: '8.2',
        number: '8.2',
        title: 'We do not read or monitor your private messages under normal circumstances',
        content: [
          "We do NOT read, intercept, or monitor your private messages under normal operating conditions.",
          "Your messages and conversations are private between you and the counterparty."
        ],
        translation: "Your messages are completely private—we do not snoop on your chats."
      },
      {
        id: '8.3',
        number: '8.3',
        title: 'Consent to inspect specific chats when a scam or dispute is reported',
        content: [
          "However, if you contact customer support about a scam, fraud, or serious dispute, you consent to us accessing and reviewing the specific chat between you and the accused user.",
          "We will never look at any of your other chats—only the specific conversation thread related to your complaint."
        ],
        translation: "If you report a scam, you allow us to inspect that specific chat to investigate and protect you."
      },
      {
        id: '8.4',
        number: '8.4',
        title: 'Automatic deletion: chats & logs are deleted after 3 days of inactivity',
        content: [
          "To protect Member privacy, prevent unnecessary data retention, and keep communications clean, all chat conversations, direct messages, and associated communication logs (including call records) are automatically and permanently deleted after three (3) consecutive days of inactivity.",
          "This automated deletion is irreversible and applies strictly to chats and messaging logs."
        ],
        translation: "Chats and all message/call logs delete themselves automatically after 3 days of inactivity for your privacy."
      }
    ]
  },
  {
    id: 'section-9',
    number: 9,
    title: 'Feedback',
    clauses: [
      {
        id: '9.1',
        number: '9.1',
        title: 'Leave honest, factual feedback about transactions',
        content: [
          "Feedback ratings and comments must reflect genuine, factual experiences of completed or attempted trades.",
          "Feedback helps build trust in our community and should accurately reflect transaction reality."
        ],
        translation: "Leave honest and truthful reviews based on your real experience."
      },
      {
        id: '9.2',
        number: '9.2',
        title: 'No offensive, defamatory, or retaliatory comments',
        content: [
          "You must not post offensive, abusive, defamatory, threatening, or retaliatory feedback.",
          "Listme.ie reserves the right to remove any feedback that violates these standards."
        ],
        translation: "No insults, abusive language, or revenge feedback."
      }
    ]
  },
  {
    id: 'section-10',
    number: 10,
    title: 'Community Forum',
    clauses: [
      {
        id: '10.1',
        number: '10.1',
        title: 'A place to chat and ask questions—not for advertising your products',
        content: [
          "The Community Forum is a shared community space to discuss topics, ask marketplace advice, and share tips.",
          "It must not be used to spam, advertise personal products, or post unsolicited commercial solicitations."
        ],
        translation: "Our forum is for helping each other and chatting, not for advertising your items."
      },
      {
        id: '10.2',
        number: '10.2',
        title: 'Be respectful—offensive posts will be removed',
        content: [
          "Always treat other members with courtesy and respect.",
          "Harassment, hate speech, bullying, or offensive comments will be deleted and may lead to forum bans."
        ],
        translation: "Be respectful to other members. Bad behaviour will get your posts removed."
      }
    ]
  },
  {
    id: 'section-11',
    number: 11,
    title: 'Disputes & Problems',
    clauses: [
      {
        id: '11.1',
        number: '11.1',
        title: 'Try to sort it out directly with the other Member first',
        content: [
          "If a misunderstanding or disagreement occurs, members must make a good-faith effort to resolve the issue directly between themselves first."
        ],
        translation: "Talk to each other and try to resolve minor issues together first."
      },
      {
        id: '11.2',
        number: '11.2',
        title: 'If direct negotiation fails, contact customer support',
        content: [
          "If direct communication fails, you can contact our customer support team to request an administrative review and investigation."
        ],
        translation: "If you can't reach an agreement, reach out to our support team."
      },
      {
        id: '11.3',
        number: '11.3',
        title: 'Court disputes and Irish legal disclosures',
        content: [
          "For formal legal disputes (such as Small Claims Court proceedings), we strictly uphold GDPR regulations and will only release another Member's personal details if legally compelled by an Irish court or law enforcement order.",
          "Irish law applies to all transactions, and disputes are resolved exclusively in Irish courts."
        ],
        translation: "Irish law applies. We only hand over personal information if a court or Irish law requires it."
      }
    ]
  },
  {
    id: 'section-12',
    number: 12,
    title: 'Our Liability (What We\'re NOT Responsible For)',
    clauses: [
      {
        id: '12.1',
        number: '12.1',
        title: 'Shipping, postal, or delivery issues',
        content: [
          "Listme.ie is not responsible for postal delays, courier damages, lost parcels, or undelivered shipments.",
          "Transit agreements and delivery risks remain strictly between buyer and seller."
        ],
        translation: "Delivery problems or lost post are strictly between the buyer and the seller."
      },
      {
        id: '12.2',
        number: '12.2',
        title: 'Member conduct and representations',
        content: [
          "We do not police every interaction or pre-screen all members.",
          "You use the site at your own risk, and we are not liable for member conduct or broken promises."
        ],
        translation: "We don't police everyone in advance—you trade on the marketplace at your own risk."
      },
      {
        id: '12.3',
        number: '12.3',
        title: 'Service provided \'as is\' without 100% perfection guarantee',
        content: [
          "We provide the platform on an 'as is' and 'as available' basis, with no guarantee that access will be 100% uninterrupted or error-free at all times.",
          "To the fullest extent permitted by Irish law, we are not liable for any indirect or commercial losses."
        ],
        translation: "The site is provided as-is, without guarantees of 100% uptime or zero errors."
      }
    ]
  },
  {
    id: 'section-13',
    number: 13,
    title: 'Your Content (Photos, Descriptions, etc.)',
    clauses: [
      {
        id: '13.1',
        number: '13.1',
        title: 'You own your content, but grant us permission to run the site',
        content: [
          "You retain ownership of all original text, photos, descriptions, and materials you upload to Listme.ie.",
          "By uploading content, you grant Listme.ie a non-exclusive, worldwide, royalty-free licence to host, display, and use that content to operate, maintain, and promote the marketplace."
        ],
        translation: "You own your photos and descriptions, but you let us display them to run the site."
      },
      {
        id: '13.2',
        number: '13.2',
        title: 'Archival and compliance copies',
        content: [
          "We may retain archival copies of your listings, transactions, and correspondence for legal, audit, and tax compliance even after you close your account."
        ],
        translation: "We keep historical records for legal and tax compliance even after you leave."
      }
    ]
  },
  {
    id: 'section-14',
    number: 14,
    title: 'Terminating Your Account',
    clauses: [
      {
        id: '14.1',
        number: '14.1',
        title: 'You can leave anytime',
        content: [
          "You may request to close your Member account at any time by contacting our customer support team."
        ],
        translation: "You can delete or close your account whenever you like."
      },
      {
        id: '14.2',
        number: '14.2',
        title: 'We can suspend or ban accounts that break the rules',
        content: [
          "We reserve the right to suspend, restrict, or permanently terminate your account if you breach these Terms, incur scam penalties, or engage in unlawful behaviour."
        ],
        translation: "If you break our rules or scam someone, we can suspend or ban your account."
      },
      {
        id: '14.3',
        number: '14.3',
        title: 'Refund of real positive account balances',
        content: [
          "Any unused real credit balance (excluding promotional or non-withdrawable credits) will be refunded to your designated account, minus standard processing fees."
        ],
        translation: "Your real cash balance gets refunded, minus standard processing fees."
      }
    ]
  },
  {
    id: 'section-15',
    number: 15,
    title: 'Changes to These Terms',
    clauses: [
      {
        id: '15.1',
        number: '15.1',
        title: 'We\'ll tell you in advance about major changes',
        content: [
          "We will inform Members of substantial updates or amendments to these Terms at least two (2) weeks in advance via email or prominent on-site notice."
        ],
        translation: "If we make big changes to these rules, we'll give you 2 weeks' notice."
      },
      {
        id: '15.2',
        number: '15.2',
        title: 'Stop using the site if you do not agree',
        content: [
          "If you do not agree with the updated terms, we advise you to discontinue using Listme.ie prior to the effective date.",
          "Continuing to use the platform after changes take effect constitutes acceptance of the new Terms."
        ],
        translation: "If you don't like the updated rules, you can stop using Listme.ie."
      }
    ]
  }
];

export default function TermsPage() {
  // Start with 1.1 open by default (like Trade Me's help page!)
  const [openClauses, setOpenClauses] = useState<Record<string, boolean>>({
    '1.1': true,
  });

  const toggleClause = (id: string) => {
    setOpenClauses(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    termsData.forEach(section => {
      section.clauses.forEach(c => {
        all[c.id] = true;
      });
    });
    setOpenClauses(all);
  };

  const collapseAll = () => {
    setOpenClauses({});
  };

  const areAllOpen = termsData.every(s => s.clauses.every(c => openClauses[c.id]));

  const scrollToSectionAndExpandFirst = (sectionId: string, firstClauseId: string) => {
    setOpenClauses(prev => ({ ...prev, [firstClauseId]: true }));
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-200 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#0073e6] dark:hover:text-[#3894ff] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-400 dark:text-gray-500">Trust & Safety</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Site Terms & Conditions</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5" />
            Official Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            Listme.ie Site Terms and Conditions
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            These terms and conditions govern your use of the Listme.ie marketplace. Please read these terms carefully before using or trading on our platform.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800/80 text-xs text-gray-500">
            <div className="flex items-center gap-2 sm:gap-4">
              <span>Last updated: September 2026</span>
              <span>•</span>
              <span>Applies to all registered members in Ireland</span>
            </div>
            
            <button
              onClick={areAllOpen ? collapseAll : expandAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 font-medium transition-colors cursor-pointer"
            >
              <ChevronsUpDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              {areAllOpen ? 'Collapse all clauses' : 'Expand all clauses'}
            </button>
          </div>
        </div>

        {/* Main Layout: Sidebar Navigation + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Table of Contents Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3">
                ON THIS PAGE
              </h2>
              <nav className="space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-h-[70vh] overflow-y-auto pr-1">
                {termsData.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSectionAndExpandFirst(section.id, section.clauses[0].id)}
                    className="w-full text-left block py-1.5 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-[#0073e6] dark:hover:text-[#3894ff] transition-colors cursor-pointer"
                  >
                    {section.number}. {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Document Content */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-12">
            {termsData.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-zinc-800">
                  {section.number}. {section.title}
                </h2>

                {/* Accordion List for Clauses (Trade Me Format) */}
                <div className="divide-y divide-gray-200 dark:divide-zinc-800 border-b border-gray-200 dark:border-zinc-800">
                  {section.clauses.map((clause) => {
                    const isOpen = Boolean(openClauses[clause.id]);

                    return (
                      <div key={clause.id} className="py-4">
                        {/* Header Row (Clickable Dropdown Toggle) */}
                        <button
                          onClick={() => toggleClause(clause.id)}
                          className="w-full flex items-start justify-between gap-4 text-left group cursor-pointer focus:outline-none"
                          aria-expanded={isOpen}
                        >
                          <span className={`text-sm sm:text-base font-medium transition-colors ${
                            isOpen 
                              ? 'text-gray-900 dark:text-white font-semibold' 
                              : 'text-[#0073e6] dark:text-[#3894ff] hover:underline group-hover:text-[#005bb5] dark:group-hover:text-[#60a5fa]'
                          }`}>
                            {clause.number} {clause.title}
                          </span>
                          <span className="flex-shrink-0 mt-0.5 text-[#0073e6] dark:text-[#3894ff] group-hover:text-[#005bb5] dark:group-hover:text-[#60a5fa] transition-colors">
                            {isOpen ? (
                              <Minus className="w-5 h-5 stroke-[2.5]" />
                            ) : (
                              <Plus className="w-5 h-5 stroke-[2.5]" />
                            )}
                          </span>
                        </button>

                        {/* Collapsible Content */}
                        {isOpen && (
                          <div className="mt-4 pt-1 space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300 animate-in fade-in-50 duration-200">
                            {clause.content.map((p, idx) => (
                              <p key={idx} className="leading-relaxed">
                                {p}
                              </p>
                            ))}

                            {/* Optional Table (e.g. for 7.3 Scam Ban Schedule) */}
                            {clause.table && (
                              <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800">
                                <table className="w-full text-left text-xs sm:text-sm">
                                  <thead className="bg-gray-100 dark:bg-zinc-800/70 text-gray-900 dark:text-white text-xs uppercase tracking-wider">
                                    <tr>
                                      {clause.table.headers.map((h, hIdx) => (
                                        <th key={hIdx} className="py-3 px-4">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-gray-700 dark:text-gray-300">
                                    {clause.table.rows.map((row, rIdx) => (
                                      <tr key={rIdx} className={rIdx === clause.table!.rows.length - 1 ? 'bg-red-50/50 dark:bg-red-950/10' : ''}>
                                        {row.map((cell, cIdx) => (
                                          <td 
                                            key={cIdx} 
                                            className={`py-3 px-4 ${cIdx === 0 ? 'font-semibold text-gray-900 dark:text-white' : ''} ${
                                              rIdx === clause.table!.rows.length - 1 ? 'font-bold text-red-700 dark:text-red-300' : ''
                                            }`}
                                          >
                                            {cell}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </main>
        </div>

      </div>
    </div>
  );
}
