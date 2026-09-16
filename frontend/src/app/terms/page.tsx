'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, Minus, ChevronsUpDown } from 'lucide-react';

interface Clause {
  id: string;
  number: string;
  title: string;
  paragraphs: (string | { type: 'bullets'; items: string[] })[];
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
        paragraphs: [
          'Our aim in providing Listme.ie is to connect people across Ireland to trade easily, safely, and transparently.',
          'We provide an online venue to introduce Members in various ways, and to allow Members to advertise and trade electronics, clothing, furniture, collectibles, home goods, and more.'
        ]
      },
      {
        id: '1.2',
        number: '1.2',
        title: 'We do not sell anything ourselves or participate in transactions',
        paragraphs: [
          "In providing the Listme.ie venue, we don't participate in the actual sale of items or the transaction itself.",
          "We don't own any items listed on our site and don't offer them for sale, nor do we act as an agent or auctioneer for either party. We also don't take part in the actual provision of Member services."
        ]
      },
      {
        id: '1.3',
        number: '1.3',
        title: 'We do not handle real estate or motor vehicles',
        paragraphs: [
          'Listme.ie strictly prohibits listings of real estate (houses, apartments, commercial leases, land) and motor vehicles (cars, vans, motorbikes, trucks).',
          'Any real estate or automotive listings will be removed immediately, and repeated attempts to list in these categories will result in account suspension.'
        ]
      },
      {
        id: '1.4',
        number: '1.4',
        title: 'We do not handle shipping, postage, or delivery logistics',
        paragraphs: [
          'Listme.ie does not operate a courier service, warehouse, or transit escrow service.',
          'All shipping arrangements, postage costs, collection times, and transit risk are negotiated, arranged, and agreed solely between the buyer and the seller.'
        ]
      },
      {
        id: '1.5',
        number: '1.5',
        title: 'Human support only — no AI chatbots',
        paragraphs: [
          'Listme.ie does NOT use AI chatbots, automated response systems, or artificial intelligence to handle customer support.',
          'Every support ticket, dispute, and inquiry is handled by a real human member of our support team. We believe in real people helping real people.',
          'When you create a support ticket, you will be communicating directly with a member of our team who has the authority to investigate, make decisions, and resolve your issue.',
          'We do not use automated decision-making for scam investigations, refunds, or account bans. Every case is reviewed by a human.'
        ]
      },
      {
        id: '1.6',
        number: '1.6',
        title: 'We welcome resellers and support business growth',
        paragraphs: [
          'Listme.ie proudly supports resellers, flippers, and small business owners. We believe in creating opportunities for people to build and grow their own enterprises.',
          'You are welcome to buy items on Listme.ie and resell them on our platform. You are also welcome to source items elsewhere and sell them on Listme.ie.',
          'We offer a Business Page system that allows sellers to create their own branded storefront on Listme.ie. Business Pages include:',
          {
            type: 'bullets',
            items: [
              'A custom store name and URL',
              'Opening hours and contact information',
              'Announcements and updates for your customers',
              'A dedicated storefront showcasing all your listings',
              'Professional business account features'
            ]
          },
          'Whether you are a casual reseller or a full-time business, Listme.ie is built to support you.'
        ]
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
        paragraphs: [
          'To register an account, list items, or place bids on Listme.ie, you must be at least 18 years of age.',
          'Our service is designed specifically for the Irish market; you must be an active resident living in Ireland to register.'
        ]
      },
      {
        id: '2.2',
        number: '2.2',
        title: 'You need one account only — no fake profiles',
        paragraphs: [
          'Each individual is permitted one Member account only. Creating multiple profiles, operating secondary backup accounts, or using pseudonyms to evade restrictions is strictly prohibited.',
          'Operating duplicate accounts will result in immediate termination of all linked profiles.'
        ]
      },
      {
        id: '2.3',
        number: '2.3',
        title: 'Keep your login details safe and your account info up to date',
        paragraphs: [
          'You are solely responsible for keeping your password and login credentials confidential.',
          'You must keep your account contact details, phone number, email, and address accurate and up to date at all times.'
        ]
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
        paragraphs: [
          'You must describe your items truthfully and completely. Disclose any faults, wear, marks, battery health issues, or prior repairs.',
          'Do not use misleading photos or false specifications to deceive buyers.'
        ]
      },
      {
        id: '3.2',
        number: '3.2',
        title: 'Be legal and do not sell prohibited goods',
        paragraphs: [
          'You must not list or sell stolen property, counterfeit items, recalled goods, illegal substances, weapons, or anything hazardous or unsafe.',
          'All listings must comply with Irish consumer protection and criminal legislation.'
        ]
      },
      {
        id: '3.3',
        number: '3.3',
        title: "Don't cheat, manipulate bids, or avoid fees",
        paragraphs: [
          'Fake bidding (shill bidding) — including having friends or family bid on your auctions to push up the price — is strictly prohibited.',
          'You must not spam members, post deceptive offers, or attempt to trade off-site to avoid marketplace fees.'
        ]
      },
      {
        id: '3.4',
        number: '3.4',
        title: "Don't scrape or harvest platform data",
        paragraphs: [
          'You must not use automated scripts, bots, spiders, or web scrapers to access, copy, or index Listme.ie listings or user data without express written permission.',
          'Any automated scraping attempts will be blocked and may result in legal action.'
        ]
      }
    ]
  },
  {
    id: 'section-4',
    number: 4,
    title: 'Your Data & Privacy',
    clauses: [
      {
        id: '4.1',
        number: '4.1',
        title: 'What we store',
        paragraphs: ['Listme.ie stores the following personal information:'],
        table: {
          headers: ['Data Type', 'What We Store'],
          rows: [
            ['Email address', 'Stored securely on our servers for account login, notifications, and support communications'],
            ['Phone number', 'Stored securely for account verification, delivery coordination, and support purposes'],
            ['Account details', 'Username, password (hashed), address, and transaction history'],
            ['Messages', 'Private messages and chats — automatically deleted after 3 days of inactivity']
          ]
        }
      },
      {
        id: '4.2',
        number: '4.2',
        title: 'Credit card information — we do NOT store your card number',
        paragraphs: [
          'Listme.ie does NOT store your credit card number, CVV, or full card details on our servers.',
          'Credit card information is stored and processed by Stripe, our PCI-compliant payment processor. Stripe is a globally trusted payment provider that meets the highest security standards (PCI DSS Level 1).',
          'What we do store locally:',
          {
            type: 'bullets',
            items: [
              'A tokenized reference to your saved card (provided by Stripe) so you can pay easily without re-entering your card details every time',
              'The last 4 digits of your card for identification purposes (e.g., "Visa ending in 4242")',
              'Card brand (Visa, Mastercard, etc.) and expiry date'
            ]
          },
          'What we do NOT store:',
          {
            type: 'bullets',
            items: [
              'Your full credit card number',
              'Your CVV security code',
              'Your full card details'
            ]
          },
          'Your card number never touches our servers. It is entered directly into Stripe\'s secure iframe and tokenized before being stored.'
        ]
      },
      {
        id: '4.3',
        number: '4.3',
        title: 'How we use your data',
        paragraphs: [
          'We use your email, phone number, and account details to:',
          {
            type: 'bullets',
            items: [
              'Operate your account and facilitate transactions',
              'Send you notifications about your listings, purchases, and messages',
              'Investigate disputes and scams',
              'Comply with Irish and EU legal requirements',
              'Improve our Services'
            ]
          }
        ]
      },
      {
        id: '4.4',
        number: '4.4',
        title: 'We do not sell your data',
        paragraphs: ['Listme.ie does NOT sell your personal information to third parties.']
      },
      {
        id: '4.5',
        number: '4.5',
        title: 'Your rights under GDPR',
        paragraphs: [
          'As an Irish/EU resident, you have the right to:',
          {
            type: 'bullets',
            items: [
              'Access a copy of your personal data',
              'Correct inaccurate data',
              'Request deletion of your data (subject to legal retention requirements)',
              'Object to how we use your data',
              'Lodge a complaint with the Data Protection Commission (DPC)'
            ]
          },
          'To exercise any of these rights, create a support ticket via our Support Page.'
        ]
      }
    ]
  },
  {
    id: 'section-5',
    number: 5,
    title: 'Fees',
    clauses: [
      {
        id: '5.1',
        number: '5.1',
        title: 'Fees are shown clearly before you list or buy anything',
        paragraphs: [
          'All platform fees — including listing upgrades, seller success fees, and payment processing charges — are clearly presented before you confirm any action.',
          'You will never be charged a surprise or hidden fee.'
        ]
      },
      {
        id: '5.2',
        number: '5.2',
        title: 'We may change fees from time to time with advance notice',
        paragraphs: [
          'We reserve the right to review and adjust our fee schedules periodically to reflect marketplace improvements.',
          'Any fee updates will be published on our fee schedules in advance so you always know costs before listing.'
        ]
      }
    ]
  },
  {
    id: 'section-6',
    number: 6,
    title: 'Listing & Selling',
    clauses: [
      {
        id: '6.1',
        number: '6.1',
        title: 'Only list items you actually have in hand',
        paragraphs: [
          'You must only list items that you physically possess or have verified, immediate authorization to sell.',
          'Drop-shipping from third-party retailers without possession is not permitted.'
        ]
      },
      {
        id: '6.2',
        number: '6.2',
        title: 'No real estate, no cars, and no motorbikes',
        paragraphs: [
          'Listme.ie does not cater to real estate or motor vehicle listings.',
          'Do not post listings for houses, apartments, plots of land, cars, commercial vehicles, or motorcycles.'
        ]
      },
      {
        id: '6.3',
        number: '6.3',
        title: 'You must clearly state your shipping and collection terms',
        paragraphs: [
          'Every listing must explicitly state delivery terms: whether the item is collection-only, who pays postage, estimated shipping costs, and accepted courier options.',
          'Sellers cannot demand extra unlisted shipping charges after a purchase is made.'
        ]
      },
      {
        id: '6.4',
        number: '6.4',
        title: 'For auctions, you must sell to the highest bidder if reserve is met',
        paragraphs: [
          'When you run an auction and the bidding reaches or exceeds your reserve price (or starting bid if no reserve is set), you are legally obligated to complete the trade with the winning bidder.',
          'You cannot refuse to sell because you hoped for a higher final price.'
        ]
      },
      {
        id: '6.5',
        number: '6.5',
        title: 'For classifieds, you can choose who to sell to',
        paragraphs: [
          'For fixed-price or classified listings, sellers retain discretion in accepting, negotiating, or declining prospective buyers.',
          'Once you formally accept an offer, you are expected to honour that agreement.'
        ]
      },
      {
        id: '6.6',
        number: '6.6',
        title: 'Reselling is allowed and encouraged',
        paragraphs: [
          'Listme.ie explicitly permits and encourages reselling.',
          'You may purchase items on Listme.ie and resell them. You may source items from other marketplaces, car boot sales, charity shops, or wholesalers and sell them on Listme.ie.',
          'You do not need special permission to be a reseller. However, if you are reselling regularly as a business, you should register as a Business account.'
        ]
      },
      {
        id: '6.7',
        number: '6.7',
        title: 'Business Pages for sellers',
        paragraphs: [
          'Business account holders can create and customise Business Pages — a dedicated storefront on Listme.ie showcasing your brand, listings, opening hours, and announcements.',
          'Business Pages are designed to help resellers and small businesses build a professional presence on the platform.'
        ]
      }
    ]
  },
  {
    id: 'section-7',
    number: 7,
    title: 'Buying',
    clauses: [
      {
        id: '7.1',
        number: '7.1',
        title: 'Only bid or buy if you intend to pay — it creates a legal contract',
        paragraphs: [
          'Submitting a winning bid or confirming an instant Buy Now creates a legally binding contract between you and the seller to purchase the item.',
          'Do not bid on auctions unless you are prepared to pay the final amount promptly.'
        ]
      },
      {
        id: '7.2',
        number: '7.2',
        title: "Check the listing carefully and understand the seller's terms",
        paragraphs: [
          "It is your responsibility as a buyer to review the item condition, photos, description, and the seller's location and delivery terms prior to committing.",
          "If an item is marked 'Collection Only', you must be able to collect it in person."
        ]
      },
      {
        id: '7.3',
        number: '7.3',
        title: 'Non-payment can lead to complaints and account suspension',
        paragraphs: [
          'If you win an auction or commit to Buy Now and fail to pay, the seller has the right to file a non-payment dispute with our team.',
          'Repeated or deliberate non-payment will result in immediate suspension or permanent banning of your account.'
        ]
      }
    ]
  },
  {
    id: 'section-8',
    number: 8,
    title: 'If You Get Scammed (Buyer Protection & Penalties)',
    clauses: [
      {
        id: '8.1',
        number: '8.1',
        title: 'What You Do: Contact real human support and send your proof',
        paragraphs: [
          'Contact our customer support team immediately. All dispute tickets are handled directly by real human support staff (not automated bots).',
          'Send us clear proof: payment records (bank or Revolut transfer confirmations), screenshots of communication, photos of packaging, or tracking numbers.',
          'By contacting customer support regarding a scam or dispute, you explicitly consent to our Trust & Safety personnel accessing and inspecting the private message log between you and that specific accused user.'
        ]
      },
      {
        id: '8.2',
        number: '8.2',
        title: 'What We Do: Thorough investigation, refunds, and scammer fine',
        paragraphs: [
          "We will investigate using the evidence you provide and (with your consent) we'll check the private chat logs between you and the accused scammer.",
          "If we determine you were scammed, we'll refund you under our Buyer Protection Policy.",
          "We will charge a mandatory penalty to the scammer's account balance (deducted from their account or invoiced to them)."
        ]
      },
      {
        id: '8.3',
        number: '8.3',
        title: 'Scam severity, penalties, and ban length schedule',
        paragraphs: [
          'Depending on the severity and financial impact of the scam, the scammer will be suspended or permanently banned according to the schedule below:'
        ],
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
    id: 'section-9',
    number: 9,
    title: 'Private Messaging on Our Platform',
    clauses: [
      {
        id: '9.1',
        number: '9.1',
        title: 'We provide a private messaging system for Members to communicate',
        paragraphs: [
          'We provide a built-in private messaging tool for Members to communicate regarding listings, ask item questions, and coordinate collection logistics.',
          'Members should keep communications on-platform to ensure dispute coverage.'
        ]
      },
      {
        id: '9.2',
        number: '9.2',
        title: 'We do not read or monitor your private messages under normal circumstances',
        paragraphs: [
          'We do NOT read, intercept, or monitor your private messages under normal operating conditions.',
          'Your messages and conversations are private between you and the counterparty.'
        ]
      },
      {
        id: '9.3',
        number: '9.3',
        title: 'Consent to inspect specific chats when a scam or dispute is reported',
        paragraphs: [
          'However, if you contact customer support about a scam, fraud, or serious dispute, you consent to us accessing and reviewing the specific chat between you and the accused user.',
          'We will never look at any of your other chats — only the specific conversation thread related to your complaint.'
        ]
      },
      {
        id: '9.4',
        number: '9.4',
        title: 'Automatic deletion: chats & logs are deleted after 3 days of inactivity',
        paragraphs: [
          'To protect Member privacy, prevent unnecessary data retention, and keep communications clean, all chat conversations, direct messages, and associated communication logs (including call records) are automatically and permanently deleted after three (3) consecutive days of inactivity.',
          'This automated deletion is irreversible and applies strictly to chats and messaging logs.',
          'Important: If you get scammed, you must report it within 3 days. After that, the chat is deleted and we cannot investigate.'
        ]
      }
    ]
  },
  {
    id: 'section-10',
    number: 10,
    title: 'Feedback',
    clauses: [
      {
        id: '10.1',
        number: '10.1',
        title: 'Leave honest, factual feedback about transactions',
        paragraphs: [
          'Feedback ratings and comments must reflect genuine, factual experiences of completed or attempted trades.',
          'Feedback helps build trust in our community and should accurately reflect transaction reality.'
        ]
      },
      {
        id: '10.2',
        number: '10.2',
        title: 'No offensive, defamatory, or retaliatory comments',
        paragraphs: [
          'You must not post offensive, abusive, defamatory, threatening, or retaliatory feedback.',
          'Listme.ie reserves the right to remove any feedback that violates these standards.'
        ]
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
        paragraphs: [
          'If a misunderstanding or disagreement occurs, members must make a good-faith effort to resolve the issue directly between themselves first.'
        ]
      },
      {
        id: '11.2',
        number: '11.2',
        title: 'If direct negotiation fails, contact customer support',
        paragraphs: [
          'If direct communication fails, you can contact our customer support team to request an administrative review and investigation.',
          'Every ticket is handled by a real human — no bots, no automated responses.'
        ]
      },
      {
        id: '11.3',
        number: '11.3',
        title: 'Court disputes and Irish legal disclosures',
        paragraphs: [
          "For formal legal disputes (such as Small Claims Court proceedings), we strictly uphold GDPR regulations and will only release another Member's personal details if legally compelled by an Irish court or law enforcement order.",
          'Irish law applies to all transactions, and disputes are resolved exclusively in Irish courts.'
        ]
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
        paragraphs: [
          'Listme.ie is not responsible for postal delays, courier damages, lost parcels, or undelivered shipments.',
          'Transit agreements and delivery risks remain strictly between buyer and seller.'
        ]
      },
      {
        id: '12.2',
        number: '12.2',
        title: 'Member conduct and representations',
        paragraphs: [
          'We do not police every interaction or pre-screen all members.',
          'You use the site at your own risk, and we are not liable for member conduct or broken promises.'
        ]
      },
      {
        id: '12.3',
        number: '12.3',
        title: "Service provided 'as is' without 100% perfection guarantee",
        paragraphs: [
          "We provide the platform on an 'as is' and 'as available' basis, with no guarantee that access will be 100% uninterrupted or error-free at all times.",
          'To the fullest extent permitted by Irish law, we are not liable for any indirect or commercial losses.'
        ]
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
        paragraphs: [
          'You retain ownership of all original text, photos, descriptions, and materials you upload to Listme.ie.',
          'By uploading content, you grant Listme.ie a non-exclusive, worldwide, royalty-free licence to host, display, and use that content to operate, maintain, and promote the marketplace.'
        ]
      },
      {
        id: '13.2',
        number: '13.2',
        title: 'Archival and compliance copies',
        paragraphs: [
          'We may retain archival copies of your listings, transactions, and correspondence for legal, audit, and tax compliance even after you close your account.'
        ]
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
        paragraphs: [
          'You may request to close your Member account at any time by contacting our customer support team.'
        ]
      },
      {
        id: '14.2',
        number: '14.2',
        title: 'We can suspend or ban accounts that break the rules',
        paragraphs: [
          'We reserve the right to suspend, restrict, or permanently terminate your account if you breach these Terms, incur scam penalties, or engage in unlawful behaviour.'
        ]
      },
      {
        id: '14.3',
        number: '14.3',
        title: 'Refund of real positive account balances',
        paragraphs: [
          'Any unused real credit balance (excluding promotional or non-withdrawable credits) will be refunded to your designated account, minus standard processing fees.'
        ]
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
        title: "We'll tell you in advance about major changes",
        paragraphs: [
          'We will inform Members of substantial updates or amendments to these Terms at least two (2) weeks in advance via email or prominent on-site notice.'
        ]
      },
      {
        id: '15.2',
        number: '15.2',
        title: 'Stop using the site if you do not agree',
        paragraphs: [
          'If you do not agree with the updated terms, we advise you to discontinue using Listme.ie prior to the effective date.',
          'Continuing to use the platform after changes take effect constitutes acceptance of the new Terms.'
        ]
      }
    ]
  }
];

const summaryPoints = [
  { topic: 'Email & phone', detail: 'We store these securely for account and support purposes' },
  { topic: 'Credit card', detail: 'Stripe stores your card. We only keep a token and last 4 digits. We NEVER see or store your full card number.' },
  { topic: 'Support', detail: 'Real humans only — no AI, no bots' },
  { topic: 'Reselling', detail: 'Fully allowed and encouraged' },
  { topic: 'Business Pages', detail: 'Create your own storefront on Listme.ie' },
  { topic: 'Shipping', detail: "We don't handle it — buyers and sellers arrange directly" },
  { topic: 'Scams', detail: 'Report within 3 days. Human investigates. Scammer penalised and banned.' },
  { topic: 'Messages', detail: 'Deleted after 3 days of inactivity' },
  { topic: 'Data', detail: 'Never sold. GDPR rights apply.' }
];

export default function TermsPage() {
  const [openClauses, setOpenClauses] = useState<Record<string, boolean>>({
    '1.1': true
  });

  const toggleClause = (id: string) => {
    setOpenClauses((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    termsData.forEach((section) => {
      section.clauses.forEach((c) => {
        all[c.id] = true;
      });
    });
    setOpenClauses(all);
  };

  const collapseAll = () => {
    setOpenClauses({});
  };

  const areAllOpen = termsData.every((s) => s.clauses.every((c) => openClauses[c.id]));

  const scrollToSectionAndExpandFirst = (sectionId: string, firstClauseId: string) => {
    setOpenClauses((prev) => ({ ...prev, [firstClauseId]: true }));
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-200 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-400 dark:text-gray-500">Trust &amp; Safety</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Site Terms of Service</span>
        </nav>

        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5" />
            Official Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            Listme.ie – Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            These terms and conditions govern your use of the Listme.ie marketplace. Please read these terms carefully before using or trading on our platform.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800/80 text-xs text-gray-500">
            <div className="flex items-center gap-2 sm:gap-4">
              <span>Last updated: September 2026</span>
              <span>•</span>
              <span>Applies to all registered members</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
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
                    className="w-full text-left block py-1.5 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-primary transition-colors cursor-pointer"
                  >
                    {section.number}. {section.title}
                  </button>
                ))}
                <a
                  href="#summary-key-points"
                  className="w-full text-left block py-1.5 px-2 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-primary transition-colors text-primary"
                >
                  Summary of Key Points
                </a>
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-8 xl:col-span-9 space-y-12">
            {termsData.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-zinc-800">
                  {section.number}. {section.title}
                </h2>

                <div className="divide-y divide-gray-200 dark:divide-zinc-800 border-b border-gray-200 dark:border-zinc-800">
                  {section.clauses.map((clause) => {
                    const isOpen = Boolean(openClauses[clause.id]);

                    return (
                      <div key={clause.id} className="py-4">
                        <button
                          onClick={() => toggleClause(clause.id)}
                          className="w-full flex items-start justify-between gap-4 text-left group cursor-pointer focus:outline-none"
                          aria-expanded={isOpen}
                        >
                          <span className={`text-sm sm:text-base font-medium transition-colors ${
                            isOpen 
                              ? 'text-gray-900 dark:text-white font-semibold' 
                              : 'text-primary hover:underline'
                          }`}>
                            {clause.number} {clause.title}
                          </span>
                          <span className="flex-shrink-0 mt-0.5 text-primary transition-colors">
                            {isOpen ? (
                              <Minus className="w-5 h-5 stroke-[2.5]" />
                            ) : (
                              <Plus className="w-5 h-5 stroke-[2.5]" />
                            )}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="mt-4 pt-1 space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300 animate-in fade-in-50 duration-200">
                            {clause.paragraphs.map((p, idx) => {
                              if (typeof p === 'string') {
                                return (
                                  <p key={idx} className="leading-relaxed">
                                    {p}
                                  </p>
                                );
                              }
                              return (
                                <ul key={idx} className="list-disc pl-5 space-y-1.5 text-gray-700 dark:text-gray-300">
                                  {p.items.map((item, iIdx) => (
                                    <li key={iIdx} className="leading-relaxed">{item}</li>
                                  ))}
                                </ul>
                              );
                            })}

                            {clause.table && (
                              <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800">
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
                                      <tr key={rIdx} className={rIdx === clause.table!.rows.length - 1 && clause.id === '8.3' ? 'bg-red-50/50 dark:bg-red-950/10' : ''}>
                                        {row.map((cell, cIdx) => (
                                          <td 
                                            key={cIdx} 
                                            className={`py-3 px-4 ${cIdx === 0 ? 'font-semibold text-gray-900 dark:text-white' : ''} ${
                                              rIdx === clause.table!.rows.length - 1 && clause.id === '8.3' ? 'font-bold text-red-700 dark:text-red-300' : ''
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

            <section id="summary-key-points" className="scroll-mt-24 pt-4 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-zinc-800">
                Summary of Key Points
              </h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-100 dark:bg-zinc-800/70 text-gray-900 dark:text-white text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 font-bold">Topic</th>
                      <th className="py-3 px-4 font-bold">What You Need to Know</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-gray-700 dark:text-gray-300">
                    {summaryPoints.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap align-top">
                          {item.topic}
                        </td>
                        <td className="py-3 px-4 leading-relaxed">
                          {item.detail}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-gray-100 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                These Terms form part of our{' '}
                <Link href="/terms" className="text-primary hover:underline font-semibold">Terms of Service</Link>,{' '}
                <Link href="/privacy" className="text-primary hover:underline font-semibold">Privacy Policy</Link>, and{' '}
                <Link href="/buyer-protection" className="text-primary hover:underline font-semibold">Buyer Protection</Link> policy.
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
