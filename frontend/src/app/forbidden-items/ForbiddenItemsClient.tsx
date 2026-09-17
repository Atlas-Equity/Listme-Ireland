'use client';

import React from 'react';
import Link from 'next/link';

interface ProhibitedSection {
  id: string;
  number: number;
  title: string;
  intro?: string;
  items: string[];
}

const FORBIDDEN_SECTIONS: ProhibitedSection[] = [
  {
    id: 'tickets',
    number: 1,
    title: 'Tickets',
    intro: 'Any tickets that are in high demand or subject to strict resale conditions are prohibited. This includes, but is not limited to:',
    items: [
      'Concert tickets (e.g., Oasis, Coldplay, AC/DC, and similar high-demand tours)',
      'FAI tickets for Irish International games',
      'IRFU tickets — as per IRFU T&Cs, tickets may only be purchased from the IRFU or its officially authorised agents. Tickets obtained from any other source (e.g., unauthorised brokers, internet auctions, or agents) are void, and holders may be refused entry, ejected, or have the ticket seized',
      'Rugby World Cup tickets — these can only be resold via the official ticket transfer platform',
      'Marathon entries for the Dublin City Marathon',
      'Any ticket that is subject to resale restrictions, price caps, or official transfer platforms'
    ]
  },
  {
    id: 'weapons',
    number: 2,
    title: 'Weapons & Dangerous Items',
    items: [
      'Firearms, ammunition, fireworks, explosives, and hazardous materials. This includes any projectile or concussive weapon using gunpowder or explosives. Replica firearms and air rifles are also prohibited. Toys that fire rubber pellets or foam darts are permitted',
      'Airsoft guns/ammunition',
      'Crossbows',
      'Daggers, hunting knives, pocket knives, swords, bayonets, etc.',
      'Garda speed meter detectors (illegal)',
      'GPS blockers',
      'Laser pointers over 5mW / above Class IIIa',
      'Stab-proof/bulletproof jackets, vests, body armour plates, or similar',
      'Nitrous oxide canisters/products',
      'Pepper spray, CS gas, and other self-defence sprays',
      'Tasers and stun guns',
      'Butterfly knives, flick knives, and gravity knives',
      'Sword canes and concealed blades',
      'Blowguns and dart-firing weapons',
      'Brass knuckles and knuckle dusters',
      'Batons and extendable batons'
    ]
  },
  {
    id: 'drugs-medical',
    number: 3,
    title: 'Drugs, Health & Medical',
    items: [
      'Illegal drugs and paraphernalia',
      'Prescription drugs and medical devices — Irish regulations prohibit the mail order (including online) supply of any medicinal product, even by a pharmacy or pharmacist',
      'Diet pills and gels',
      'Cannabis seeds',
      'HHC (Hexahydrocannabinol)',
      'Recreational substances such as (but not limited to) "poppers"',
      'Tanning products containing Melanotan 2',
      'Gripe water — no longer authorised for sale in Ireland',
      'Amber teething jewellery',
      'Baby food',
      'Teeth whitening strips',
      'Cigarettes, nicotine replacements, vapes, and vaping equipment',
      'Used safety equipment',
      'Prescription glasses and contact lenses (without valid prescription verification)',
      'Hearing aids (prescription-only devices)',
      'Medical oxygen equipment',
      'Insulin and diabetic supplies (prescription-only)',
      'EpiPens and adrenaline auto-injectors',
      'Any item requiring a medical prescription'
    ]
  },
  {
    id: 'vehicles',
    number: 4,
    title: 'Vehicles & Transport',
    items: [
      'All eScooters — due to the serious safety threat they pose, we do not permit the sale of eScooters on Listme.ie, regardless of road legality',
      'Hoverboards and self-balancing scooters',
      'Electric unicycles',
      'Petrol-powered scooters and mopeds (unless road-legal and registered)',
      'Vehicle parts that are safety-critical and untested (e.g., airbags, seatbelts, brake components)',
      'Number plates',
      'Vehicle registration documents',
      'Catalytic converters (unless proof of legitimate origin is provided)',
      'Cloned or tampered vehicle parts'
    ]
  },
  {
    id: 'animals',
    number: 5,
    title: 'Animals & Wildlife',
    items: [
      'Dogs',
      'Unauthorised/illegal wildlife products and animals, with the exception of certain pets in the adoption category and livestock (cattle, sheep, goats, pigs, and poultry only). All Department of Agriculture rules on animal identification and movement must be followed when selling livestock',
      'Ducks, ducklings, and fertile duck eggs — due to a concerning trend of these being bought for social media use with no regard for their welfare, all such ads are currently removed',
      'Fur',
      'Prong or choke collars',
      'Certain invasive species (forbidden from the Pet Adoption category)',
      'Endangered species or products derived from them (CITES-protected)',
      'Ivory and ivory products',
      'Live animals posted or shipped via courier',
      'Puppy farm or unlicensed breeder listings',
      'Animals listed for fighting or baiting purposes'
    ]
  },
  {
    id: 'media-ip',
    number: 6,
    title: 'Media, Software & IP',
    items: [
      'Pirated software — only full retail versions may be sold. Academic, NFR, back-up, promotional, beta, unauthorised freeware/shareware, and "soft-lifted" versions are all prohibited. OEM software must be sold only with its original hardware or per its original terms. Knowingly buying or selling pirated software results in a permanent ban',
      'Pirated video games — only full retail versions permitted. Recopied/transferred games, emulators, boot-disks, game enhancers, and unauthorised compilations are prohibited',
      'Recopied/pirated media of any kind (video, music, software, photos, etc.) — you cannot sell copies, duplicates, or transferred-format media (e.g., CD-ROM to cassette) without the author\'s explicit permission',
      'Promotional media (movies, CDs, software, books, advance reading copies, uncorrected proofs, etc.) produced for promotional use only',
      'Television programmes — unauthorised copies, pay-per-view recordings, unaired programmes, unauthorised scripts/props, and screeners are prohibited. Commercially licensed copies are permitted',
      'Domain names — due to legal complexity around trademark/copyright, domain sales are generally prohibited',
      'Replicas of trademarked items',
      'Counterfeit goods of any kind',
      '"Review copies" or "sample" products not intended for resale',
      'Academic essays, thesis papers, or coursework for submission'
    ]
  },
  {
    id: 'tech-telecoms',
    number: 7,
    title: 'Tech & Telecoms Equipment',
    items: [
      'IMEI blocked phones',
      'Golden numbers for mobile phones — against mobile providers\' T&Cs',
      'IPTV, including loaded/chipped firesticks and Dreamboxes running Kodi or similar',
      'Internet Service Provider equipment that remains ISP property',
      'NTL/UPC/Virgin Media equipment — resale breaches Virgin Media\'s terms of service',
      'Sky Q boxes and Sky viewing cards — remain Sky\'s property',
      'WiMAX equipment',
      'Metal detectors',
      'Stolen or blacklisted devices',
      'SIM card cloning or hacking equipment',
      'Signal jammers or boosters (illegal in Ireland)',
      'Spyware or surveillance software',
      'Hacking tools or software'
    ]
  },
  {
    id: 'identity-privacy',
    number: 8,
    title: 'Identity, Privacy & Personal Data',
    items: [
      'ID cards of any kind (government IDs, college IDs, birth certificates, etc.)',
      'Items that infringe, or could infringe, on an individual\'s privacy, including marketing lists (bulk email lists, direct-mail lists, etc.)',
      'Leap cards',
      'Passports or passport covers',
      'Driving licences',
      'Birth, marriage, or death certificates',
      'Utility bills in another person\'s name',
      'Bank statements or financial documents',
      'Personal data lists or databases',
      'Medical records',
      'School or college records'
    ]
  },
  {
    id: 'uniforms',
    number: 9,
    title: 'Uniforms & Regulated Goods',
    items: [
      'Irish Defence Forces uniforms and all other military uniforms',
      'Order of Malta uniforms — a charitable organisation that only rents uniforms to members; these cannot be sold',
      'St John\'s Ambulance uniforms',
      'An Garda Síochána uniforms or equipment',
      'Prison service uniforms',
      'Security company uniforms (without authorisation)',
      'School uniforms (without school authorisation)',
      'High-visibility clothing marked with official insignia',
      'Badges, insignia, or emblems of official organisations'
    ]
  },
  {
    id: 'property-finance',
    number: 10,
    title: 'Property & Finance',
    items: [
      'Property (residential or commercial) for sale, rent, let, or share — Listme.ie does not permit property listings',
      'Digital currency trading',
      'Stocks, securities, lottery tickets, lock-picking devices, smart cards, and any item that could facilitate an illegal act',
      'Timeshare or holiday club memberships',
      'Loan agreements or debt instruments',
      'Financial products or investment schemes',
      'Insurance policies',
      'Pension or retirement products',
      'Pyramid or multi-level marketing schemes'
    ]
  },
  {
    id: 'fuel-environmental',
    number: 11,
    title: 'Fuel & Environmental',
    items: [
      'Calor gas cylinders',
      'Methylated spirits',
      'Solid fuels — vendors must display their EPA Fuels Registration number on the ad. Loose logs/firewood ads must include a moisture content certificate. Non-compliant ads will be removed. More info: epa.ie solid fuel regulations',
      'Turf — since 31 October 2022, turf may not be advertised for sale via the internet or other media. More info: www.gov.ie/cleanair or solidfuels@decc.gov.ie',
      'Petrol, diesel, or other fuels (unless in approved containers and quantities)',
      'Asbestos or asbestos-containing materials',
      'Hazardous chemicals',
      'Radioactive materials',
      'Ozone-depleting substances'
    ]
  },
  {
    id: 'other-prohibited',
    number: 12,
    title: 'Other Prohibited Items',
    items: [
      'Ads for your ads',
      'Beer kegs, taps, coolers, etc. — remain brewery property',
      'Perfume samples from Chanel, Dior, Givenchy',
      'Penney\'s (or similar) appointment slots',
      'Supermarket discount codes',
      'Referral links/discount codes',
      'Raffles — raffle listings will be removed',
      'Stolen goods — if we learn an item wasn\'t the seller\'s property or was obtained illegally, we\'ll lock the thread, remove relevant details, and may report it to the authorities',
      'Second-hand underwear (excluding bras)',
      'Illegal items generally, including those sold by individuals outside the Republic of Ireland/EU',
      'Pornography/erotic items or material',
      'Hate materials, and sectarian or ethnic offensive materials',
      'Offensive material generally — we reserve the right to determine appropriateness, being mindful of cultural differences and sensitivities across our audience',
      'Tobacco, wine, and other alcoholic beverages — select shops may sell alcohol and e-cigarettes on a case-by-case basis',
      'Human remains, body parts, or biological samples',
      'Live insects or pests (unless authorised)',
      'Invasive plant species',
      'Fireworks and pyrotechnics',
      'Drones (unless registered and operator holds valid licence)',
      'Counterfeit currency',
      'Fake designer goods',
      'Recalled products or items subject to safety warnings',
      'Baby monitors with known security flaws',
      'Used car seats (unless history is verified)',
      'Used helmets (motorcycle, bicycle, etc.)',
      'Expired food or beverages',
      'Home-made alcohol or distilled spirits',
      'Unlicensed health supplements',
      'Products containing CBD or THC (unless authorised)',
      'Weight loss surgery or medical procedures',
      'Surrogacy or adoption services',
      'Human organs or tissue',
      'Endangered plant species',
      'Stolen or cloned loyalty cards',
      'Gift cards with unknown balance',
      'Vouchers that have expired',
      'Event tickets that have already been used',
      'Digital accounts (streaming, gaming, etc.)',
      'Social media accounts or followers',
      'Online course access codes',
      'Software licence keys sold separately from software',
      'Beta or pre-release software',
      'Medical or dental equipment requiring certification'
    ]
  }
];

export default function ForbiddenItemsClient() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
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
          <span className="text-gray-900 dark:text-white font-medium">Forbidden Items</span>
        </nav>

        <div className="border-b border-gray-200 dark:border-zinc-800 pb-8 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Listme.ie – Forbidden Items
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Marketplace Prohibited &amp; Restricted Items Policy
          </p>

          <div className="mt-6 space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300 max-w-4xl">
            <p>
              As a general rule, anything illegal cannot be listed on Listme.ie. In addition, there are certain items that, while legal to buy, sell, or own, are not permitted to be advertised on this site.
            </p>
            <p>
              This is not a comprehensive list — due to the nature of the site, we will never be able to list every restricted item. It should be used as a guide to what is and isn&apos;t permitted. Listme.ie Moderators and Administrators have the final say on what items are allowed, and we reserve the right to edit or remove listings from the site at any time, without prior notice.
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              Any listing found to contain a prohibited item will be removed, and the seller may receive a warning or a ban.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3">
                ON THIS PAGE
              </h2>
              <nav className="space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-h-[70vh] overflow-y-auto pr-1">
                {FORBIDDEN_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full text-left block py-1.5 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-primary transition-colors cursor-pointer"
                  >
                    {section.number}. {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-8 xl:col-span-9 space-y-12">
            {FORBIDDEN_SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-zinc-800">
                  {section.number}. {section.title}
                </h2>

                {section.intro && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {section.intro}
                  </p>
                )}

                <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <div className="p-4 rounded-xl bg-gray-100 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
              <p className="font-semibold text-gray-900 dark:text-white">
                Listme.ie Moderators and Administrators have the final say on what is permitted.
              </p>
              <p>
                If you are unsure whether an item is allowed, please contact our Support team at{' '}
                <Link href="/help" className="text-primary hover:underline font-semibold">
                  https://www.listme.ie/help
                </Link>{' '}
                before listing. This policy forms part of our{' '}
                <Link href="/terms" className="text-primary hover:underline font-semibold">
                  Terms of Service
                </Link>{' '}
                and marketplace community standards.
              </p>
            </div>

          </main>
        </div>

      </div>
    </div>
  );
}
