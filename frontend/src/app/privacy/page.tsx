'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Plus, Minus, ChevronsUpDown } from 'lucide-react';

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

const privacyData: Section[] = [
  {
    id: 'section-1',
    number: 1,
    title: 'Who We Are',
    clauses: [
      {
        id: '1.1',
        number: '1.1',
        title: 'Data Controller & Marketplace Operations',
        paragraphs: [
          'Listme.ie is an online marketplace based in Ireland, providing a venue for individuals to buy and sell goods.',
          'We look after your personal data as a designated data controller in full accordance with the General Data Protection Regulation (GDPR) and Irish Data Protection Acts.'
        ]
      },
      {
        id: '1.2',
        number: '1.2',
        title: 'Contacting Us & Customer Support',
        paragraphs: [
          'To contact our team, visit our Support Page at https://www.listme.ie/help to create a support ticket and message our team directly from your account dashboard.',
          'To maintain high security and account verification standards, we do not operate email-based customer support. All support communications are handled exclusively through our internal ticket system.'
        ]
      },
      {
        id: '1.3',
        number: '1.3',
        title: 'Human Support Only — No AI Processing',
        paragraphs: [
          'Listme.ie does NOT use AI chatbots, automated response systems, or artificial intelligence to handle customer support or make decisions about your data.',
          'Every support ticket, dispute, and data request is reviewed and handled by a real human member of our team.',
          'We do not use automated decision-making for scam investigations, refunds, account bans, or any processing that significantly affects you.'
        ]
      }
    ]
  },
  {
    id: 'section-2',
    number: 2,
    title: 'What Information We Collect',
    clauses: [
      {
        id: '2.1',
        number: '2.1',
        title: 'Information Collected From You, Your Device & Third Parties',
        paragraphs: [
          'We collect information to provide, maintain, and secure our marketplace services. The specific data categories depend on how you interact with Listme.ie:'
        ],
        table: {
          headers: ['Data Source', 'Examples of Collected Information'],
          rows: [
            ['You give us', 'Name, email address, phone number, item listings, uploaded photos, payment details, and private messages'],
            ['We collect automatically', 'IP address, browser type and version, device information, operating system, pages visited, clicks, timestamps, and essential cookies'],
            ['From third parties', 'Verified name and email address if you choose to register or authenticate via Google single sign-on']
          ]
        }
      },
      {
        id: '2.2',
        number: '2.2',
        title: 'Payment Method Data',
        paragraphs: [
          'Depending on how you pay or receive funds, we may collect:'
        ],
        table: {
          headers: ['Payment Method', 'Data Collected'],
          rows: [
            ['Stripe', 'Transaction records, Stripe customer ID, tokenized card reference'],
            ['Cash in hand (Euro)', 'Transaction amount marked as paid (no payment data)']
          ]
        }
      },
      {
  id: '2.3',
  number: '2.3',
  title: 'Credit Card Information — We Do NOT Store Your Card Number',
  paragraphs: [
    'Listme.ie does NOT store your credit card number, CVV, or full card details on our servers.',
    'Credit card information is stored and processed by Stripe, our PCI-compliant payment processor. Stripe meets the highest security standards (PCI DSS Level 1).',
    'A valid credit card is required on file before you can post any listing on Listme.ie. This lets us process chargebacks against scammers, recover funds for victims, and keep the platform safe for everyone.',
    'What we store locally:',
    {
      type: 'bullets',
      items: [
        'A tokenized reference to your saved card (provided by Stripe) so you can pay easily without re-entering your card details',
        'The last 4 digits of your card for identification',
        'Card brand and expiry date'
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
    "Your card number never touches our servers. It is entered directly into Stripe's secure iframe and tokenized before being stored."
  ]
},
      {
        id: '2.4',
        number: '2.4',
        title: 'Watchlist, Favourites & Feedback',
        paragraphs: [
          'We store:',
          {
            type: 'bullets',
            items: [
              'Watchlist: Items you are watching, auction tracking, and bid status',
              'Favourites: Sellers you have favourited for quick access',
              'Feedback: Ratings and comments you leave about other Members, and feedback left about you'
            ]
          },
          'Your public username, feedback rating, and public reviews are visible to all users.'
        ]
      },
      {
        id: '2.5',
        number: '2.5',
        title: 'Business Page Data',
        paragraphs: [
          'If you create a Business Page, we store and publicly display:',
          {
            type: 'bullets',
            items: [
              'Business name, slug, and description',
              'Opening hours and contact information',
              'Announcements (max 250 characters)',
              'Associated listings',
              'Phone number (formatted to Irish +353 standard)'
            ]
          },
          'This information is visible to all Listme.ie users.'
        ]
      }
    ]
  },
  {
    id: 'section-3',
    number: 3,
    title: 'How We Use Your Information',
    clauses: [
      {
        id: '3.1',
        number: '3.1',
        title: 'Account Management & Transaction Processing',
        paragraphs: [
          'We use your personal data to manage your account, verify your identity, process marketplace transactions, facilitate communications between buyers and sellers, and deliver platform services.',
          'We also communicate with you regarding security updates, account status changes, and critical service announcements.'
        ]
      },
      {
        id: '3.2',
        number: '3.2',
        title: 'Dispute Resolution, Scam Investigation & Legal Compliance',
        paragraphs: [
          'We process relevant transaction and reported communication data to investigate scams, process buyer refunds, resolve disputes, and enforce platform bans and penalties.',
          'We utilize data to improve our marketplace features, monitor platform security, and satisfy statutory tax, anti-money laundering, and fraud prevention obligations under Irish and European law.',
          'We only send promotional emails if you have provided prior explicit consent. You may withdraw consent at any time via your account settings.'
        ]
      },
      {
        id: '3.3',
        number: '3.3',
        title: 'Scam Investigation & Penalty Data',
        paragraphs: [
          'If you are reported for a scam or fraudulent activity, we process the following data to investigate and enforce penalties:',
          {
            type: 'bullets',
            items: [
              'Transaction records and payment evidence',
              'The specific chat log between you and the reporting user (with their consent)',
              'Any evidence submitted by the reporter',
              'Your account history, including prior reports and penalties'
            ]
          },
          'This data is used to determine refunds, penalties (€5 to €500), and ban lengths (1 month to lifetime). It is retained as long as necessary to enforce bans and for legal defence.'
        ]
      },
      {
        id: '3.4',
        number: '3.4',
        title: 'Legal Basis for Processing',
        paragraphs: [
          'We process your data under the following legal bases:'
        ],
        table: {
          headers: ['Purpose', 'Legal Basis'],
          rows: [
            ['Account management & transactions', 'Contractual necessity'],
            ['Scam investigation & dispute resolution', 'Legitimate interest'],
            ['Promotional emails', 'Consent'],
            ['Tax & legal compliance', 'Legal obligation'],
            ['Security & fraud prevention', 'Legitimate interest']
          ]
        }
      }
    ]
  },
  {
    id: 'section-4',
    number: 4,
    title: 'Private Messaging & Chat Logs',
    clauses: [
      {
        id: '4.1',
        number: '4.1',
        title: 'Private Messaging Confidentiality & Zero Snooping',
        paragraphs: [
          'We provide a built-in private messaging system for Members to communicate regarding listings, ask questions, and arrange item collection or delivery.',
          'We do NOT read, monitor, or scan your private messages under normal circumstances. Your conversations remain strictly private between you and the member you are communicating with.'
        ]
      },
      {
        id: '4.2',
        number: '4.2',
        title: 'Automated 3-Day Inactivity Chat Deletion',
        paragraphs: [
          'Messages are automatically deleted after 3 days.',
          'Chats and all associated message/call logs that are inactive for more than 3 days are also permanently and automatically deleted from our servers.',
          'Once purged, inactive chats and messages cannot be recovered or restored by anyone.'
        ]
      },
      {
        id: '4.3',
        number: '4.3',
        title: 'Reporting Scams Within 3 Days & Chat Evidence Consent',
        paragraphs: [
          'If you get scammed, you MUST report it within 3 days – before the chat is permanently deleted.',
          'If the chat has already been removed by the 3-day automated cleanup, we cannot investigate or help you because the required evidence will no longer exist.',
          'You can only report the same person ONCE. We will analyze your report and evidence thoroughly and make a final determination – no second chances or repeat reports against the same person.',
          'If you report a scam within 3 days, you explicitly consent to our Trust & Safety team inspecting the specific chat log between you and the accused scammer. We will only review that single reported chat – nothing else.'
        ]
      }
    ]
  },
  {
    id: 'section-5',
    number: 5,
    title: 'How We Share Your Information',
    clauses: [
      {
        id: '5.1',
        number: '5.1',
        title: 'Sharing With Other Members',
        paragraphs: [
          'To complete purchases or arrange collection, relevant contact details (such as your name and email) may be shared with the transacting buyer or seller.',
          'Your public username, account creation date, seller feedback rating, and public reviews are visible to all users of Listme.ie.'
        ]
      },
      {
        id: '5.2',
        number: '5.2',
        title: 'Service Providers, Authorities & No Data Selling',
        paragraphs: [
          'With service providers: We share data with verified third-party partners (such as payment processors, cloud hosting providers, transactional email services, and support tools) who are contractually bound to keep your data secure and process it strictly on our instructions.',
          'With statutory authorities: We may disclose data to An Garda Síochána, the Data Protection Commission (DPC), or the Competition and Consumer Protection Commission (CCPC) – but only if required by law, court order, or to prevent imminent fraud.',
          'We do NOT sell, rent, or trade your personal data to third parties or advertisers under any circumstances.'
        ]
      },
      {
        id: '5.3',
        number: '5.3',
        title: 'International Data Transfers',
        paragraphs: [
          'Your data is primarily stored within the European Economic Area (EEA).',
          'Where we use service providers outside the EEA (e.g., Stripe for payment processing), we ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission, to protect your data in accordance with GDPR.'
        ]
      }
    ]
  },
  {
    id: 'section-6',
    number: 6,
    title: 'How Long We Keep Your Data',
    clauses: [
      {
        id: '6.1',
        number: '6.1',
        title: 'Data Retention Periods & Principles',
        paragraphs: [
          'We retain your personal data only for as long as necessary to provide our services and satisfy legal, accounting, and dispute-resolution requirements.'
        ],
        table: {
          headers: ['Data Type', 'Retention Period', 'Notes'],
          rows: [
            ['Account information', 'Active + 1 year after account deletion', 'Retained for statutory tax obligations, legal compliance, and dispute resolution'],
            ['Listings (photos, descriptions)', 'May be kept indefinitely', 'Retained to maintain marketplace history, integrity, and improve Services'],
            ['Private messages & chats', 'Deleted after 3 days', 'Automatically deleted after 3 days of conversation inactivity for maximum privacy'],
            ['Scam evidence & reports', 'As long as needed', 'Retained as required to enforce permanent bans, safety penalties, and legal defence'],
            ['Watchlist & Favourites', 'While account active', 'Deleted when account is deleted'],
            ['Feedback', 'Indefinite (public)', 'Public feedback remains visible for community trust'],
            ['Business Pages', 'While account active + 1 year', 'Retained for legal and dispute purposes after deletion'],
            ['Payment records', '7 years', 'Required by Irish tax law'],
            ['Support tickets', '3 years', 'Retained for dispute resolution and legal defence'],
            ['Login & security logs', '12 months', 'Retained for security and fraud prevention']
          ]
        }
      }
    ]
  },
  {
    id: 'section-7',
    number: 7,
    title: 'Deleting Your Account',
    clauses: [
      {
        id: '7.1',
        number: '7.1',
        title: 'Account Closure & The 1-Year Retention Countdown',
        paragraphs: [
          'You can delete your account at any time via your account settings in the admin panel or by creating a support ticket.',
          'When you delete your account, we will keep your data and information for another year.',
          'An exact 1-year countdown will begin from the official date of deletion.'
        ]
      },
      {
        id: '7.2',
        number: '7.2',
        title: 'Permitted Purposes During the 1-Year Window',
        paragraphs: [
          'During this 1-year countdown period, your data is retained strictly for:',
          {
            type: 'bullets',
            items: [
              'Legal, accounting, and tax obligations under Irish and EU law',
              'Dispute resolution and fraud investigation arising from past transactions',
              'Enforcement of user bans, financial penalties, and community protection rules'
            ]
          },
          'After the 1-year period, your data will be permanently deleted (except for limited data we are legally required to keep).'
        ]
      }
    ]
  },
  {
    id: 'section-8',
    number: 8,
    title: 'Reporting Scams – One Report Only',
    clauses: [
      {
        id: '8.1',
        number: '8.1',
        title: 'Single-Report Rule & Final Determination',
        paragraphs: [
          'You can only report the same person ONCE.',
          'We will analyze your report, transaction records, and submitted evidence thoroughly and impartially.',
          'After we make a decision, that is it – no second reports or duplicate claims against the same person.',
          'Make sure you have all your evidence, chat screenshots, and payment receipts completely ready before you report.'
        ]
      }
    ]
  },
  {
    id: 'section-9',
    number: 9,
    title: 'Your Rights Under GDPR',
    clauses: [
      {
        id: '9.1',
        number: '9.1',
        title: 'Statutory Data Protection Rights',
        paragraphs: [
          'Under the General Data Protection Regulation (GDPR) and Irish Data Protection legislation, you have the following rights:',
          {
            type: 'bullets',
            items: [
              'Access: You have the right to request a copy of the personal data we hold about you.',
              'Rectification: You have the right to correct any inaccurate or incomplete personal data.',
              'Erasure: You have the right to request deletion of your data (remember, we keep account records for 1 year after deletion for statutory reasons).',
              'Restrict: You have the right to request that we restrict the processing of your personal data under certain conditions.',
              'Portability: You have the right to receive your data in a structured, commonly used, machine-readable format.',
              'Object: You have the right to object to our processing of your personal data.',
              'Withdraw Consent: You can withdraw consent to promotional marketing at any time.',
              'Lodge a Complaint: You have the right to lodge a complaint with the Data Protection Commission (DPC).'
            ]
          }
        ]
      },
      {
        id: '9.2',
        number: '9.2',
        title: 'Submitting a Request & Response Timeline',
        paragraphs: [
          'To exercise any of your statutory rights, visit our Support Page at https://www.listme.ie/help to create a verified ticket from your account.',
          'We will respond to all verified requests within 30 calendar days.'
        ]
      },
      {
        id: '9.3',
        number: '9.3',
        title: 'Automated Decision-Making',
        paragraphs: [
          'Listme.ie does NOT use fully automated decision-making that produces legal or similarly significant effects.',
          'All scam investigations, refund decisions, account bans, and penalty enforcement are reviewed by a human member of our Trust & Safety team.'
        ]
      }
    ]
  },
  {
    id: 'section-10',
    number: 10,
    title: 'Cookies',
    clauses: [
      {
        id: '10.1',
        number: '10.1',
        title: 'Cookie Types & Browser Management',
        paragraphs: [
          'Cookies are small text files stored on your device to keep you securely logged in, remember your user preferences, and analyse aggregate website traffic and performance.',
          'We use the following types of cookies:',
          {
            type: 'bullets',
            items: [
              'Essential: Required for login, security, and core functionality',
              'Preference: Remember your settings and choices',
              'Analytics: Understand how users interact with the platform (aggregated, anonymised)',
              'Payment: Set by Stripe for secure payment processing'
            ]
          },
          'We do not use cookies for targeted advertising.',
          'You can choose to turn cookies off through your browser settings, but please note that some core features of Listme.ie may not function properly as a result.'
        ]
      }
    ]
  },
  {
    id: 'section-11',
    number: 11,
    title: 'Data Security',
    clauses: [
      {
        id: '11.1',
        number: '11.1',
        title: 'Technical & Organisational Safeguards',
        paragraphs: [
          'We maintain robust industry-standard safeguards to protect your personal data:',
          {
            type: 'bullets',
            items: [
              'Encryption: Data in transit is encrypted using modern TLS protocols to prevent unauthorised interception.',
              'Access Controls: Only authorised staff members with explicit business needs have access to personal information.',
              'Secure Storage: We utilize hardened cloud infrastructure with continuous monitoring and routine security assessments.',
              'Data Minimisation: We only collect and process the minimum personal information necessary to operate our marketplace safely.'
            ]
          }
        ]
      },
      {
        id: '11.2',
        number: '11.2',
        title: 'Data Breach Notification',
        paragraphs: [
          'In the event of a personal data breach that poses a risk to your rights and freedoms, we will:',
          {
            type: 'bullets',
            items: [
              'Notify the Data Protection Commission within 72 hours',
              'Notify affected users without undue delay',
              'Take immediate steps to contain and remediate the breach'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'section-12',
    number: 12,
    title: "Children's Privacy",
    clauses: [
      {
        id: '12.1',
        number: '12.1',
        title: 'Age Requirement of 18 or Over',
        paragraphs: [
          'You must be 18 or older to register an account or use Listme.ie.',
          'We do not knowingly collect or solicit personal data from minors. If we discover that personal data from a person under 18 has been collected without verified legal authority, we will:',
          {
            type: 'bullets',
            items: [
              'Immediately suspend the account',
              'Delete all associated personal data',
              'Notify the Data Protection Commission if required'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'section-13',
    number: 13,
    title: 'Changes to This Policy',
    clauses: [
      {
        id: '13.1',
        number: '13.1',
        title: 'Policy Updates & 2 Weeks Advance Notice',
        paragraphs: [
          'We may update this Privacy Policy from time to time to reflect changes in our legal obligations, platform features, or operational standards.',
          'We will notify you of major updates via an on-site announcement banner, typically providing 2 weeks\' notice prior to new terms taking effect.',
          'If you do not agree with the revised policy, you should close your account and discontinue use of Listme.ie before the effective date.'
        ]
      }
    ]
  },
  {
    id: 'section-14',
    number: 14,
    title: 'Contact Us',
    clauses: [
      {
        id: '14.1',
        number: '14.1',
        title: 'Customer Support & Supervisory Contact Information',
        paragraphs: [
          'Listme.ie Customer Support:',
          'Visit our Support Page at https://www.listme.ie/help to create a ticket and message our team directly from your admin panel.',
          '(No email support – all customer support is handled exclusively through our ticket system to verify account ownership.)',
          'Supervisory Authority: Data Protection Commission (DPC)',
          'Website: www.dataprotection.ie'
        ]
      }
    ]
  },
  {
    id: 'section-15',
    number: 15,
    title: 'Quick Summary – Your Privacy at Listme.ie',
    clauses: [
      {
        id: '15.1',
        number: '15.1',
        title: 'Frequently Asked Privacy Questions at a Glance',
        paragraphs: [],
        table: {
          headers: ['Question', 'Answer'],
          rows: [
            ['What data do you collect?', 'Name, email, phone, listings, messages, payment info, usage data'],
            ['How long are messages kept?', 'Only 3 days! After that, they are automatically and permanently deleted'],
            ['What if I get scammed?', 'Report it within 3 days – before the chat is deleted – or we cannot help you'],
            ['Can I report the same person multiple times?', 'No – only ONCE. Make sure you have all your evidence ready'],
            ['Do you read my private messages?', 'Only if you report a scam within 3 days and give consent – then we check that specific chat'],
            ['Do you sell my data?', 'Absolutely not'],
            ['What happens when I delete my account?', 'We keep your data for exactly 1 year, then delete it permanently'],
            ['How long do you keep my data?', 'Account data: active + 1 year after deletion. Messages: 3 days only'],
            ['Can I delete my data?', 'Yes – but we keep it for 1 year after deletion (for legal and tax compliance)'],
            ['Do you store my credit card number?', 'No – Stripe stores it. We only keep a token and last 4 digits'],
            ['Do you use AI for support?', 'No – every ticket is handled by a real human'],
            ['How do I contact you?', 'Visit https://www.listme.ie/help to create a ticket. (No email support)']
          ]
        }
      }
    ]
  }
];

export default function PrivacyPage() {
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
    privacyData.forEach((section) => {
      section.clauses.forEach((c) => {
        all[c.id] = true;
      });
    });
    setOpenClauses(all);
  };

  const collapseAll = () => {
    setOpenClauses({});
  };

  const areAllOpen = privacyData.every((s) => s.clauses.every((c) => openClauses[c.id]));

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
          <span className="text-gray-900 dark:text-white font-medium">Privacy Policy</span>
        </nav>

        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Official Policy
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            Listme.ie – Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            This Privacy Policy sets out how Listme.ie collects, uses, stores, and protects your personal data in full compliance with the General Data Protection Regulation (GDPR) and Irish Data Protection legislation.
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
                {privacyData.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSectionAndExpandFirst(section.id, section.clauses[0].id)}
                    className="w-full text-left block py-1.5 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-primary transition-colors cursor-pointer"
                  >
                    {section.number}. {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-8 xl:col-span-9 space-y-12">
            {privacyData.map((section) => (
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
                          <span
                            className={`text-sm sm:text-base font-medium transition-colors ${
                              isOpen
                                ? 'text-gray-900 dark:text-white font-semibold'
                                : 'text-primary hover:underline'
                            }`}
                          >
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
                                        <th key={hIdx} className="py-3 px-4 font-semibold">
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-gray-700 dark:text-gray-300">
                                    {clause.table.rows.map((row, rIdx) => (
                                      <tr key={rIdx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        {row.map((cell, cIdx) => (
                                          <td
                                            key={cIdx}
                                            className={`py-3 px-4 ${
                                              cIdx === 0
                                                ? 'font-semibold text-gray-900 dark:text-white whitespace-nowrap align-top'
                                                : 'align-top leading-relaxed'
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

            <div className="p-4 rounded-xl bg-gray-100 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              This Privacy Policy forms part of our{' '}
              <Link href="/terms" className="text-primary hover:underline font-semibold">Terms of Service</Link>,{' '}
              <Link href="/buyer-protection" className="text-primary hover:underline font-semibold">Buyer Protection</Link> policy, and all other policies posted on our Site.
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
