'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { 
  LifeBuoy, 
  Search, 
  ShieldCheck, 
  Package, 
  Building2, 
  CreditCard, 
  Send, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Hash,
  AlertCircle,
  Plus,
  Lock,
  HelpCircle,
  X
} from 'lucide-react';

import { isAdmin } from '@/utils/admin';
import { getAllSupportTicketsAdminAction, adminReplySupportTicketAction } from '@/app/actions/admin';

interface TicketMessage {
  id: string;
  sender: 'user' | 'support' | 'system';
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: 'Open' | 'In Review' | 'Resolved' | 'Closed';
  createdAt: string;
  referenceId?: string;
  userId?: string;
  userEmail?: string;
  userDisplayName?: string;
  messages: TicketMessage[];
}

const FAQ_DATA = [
  {
    q: 'How do ListMe marketplace fees and payouts work?',
    a: 'All platform fees and payouts are transparently handled through Stripe Connect directly to your linked bank account. You can view the full fee schedule anytime in our marketplace fee breakdown.',
    link: '/fees',
    linkLabel: 'View Marketplace Fees'
  },
  {
    q: 'How does ListMe Buyer Protection (up to €5,000) work?',
    a: 'Eligible purchases completed using registered ListMe accounts or escrow are covered up to €5,000 against non-delivery, counterfeit goods, or goods substantially different from their description. Claims must be submitted within 30 days.',
    link: '/buyer-protection',
    linkLabel: 'Read Buyer Protection Guide'
  },
  {
    q: 'Why do we use internal support tickets instead of email or phone support?',
    a: 'Handling support strictly through our verified ticket system guarantees that sensitive account operations, dispute resolutions, and card inquiries are authenticated directly against your account without risky unverified email spoofing or phone scams.',
    link: '#tickets',
    linkLabel: 'Open a Support Ticket'
  },
  {
    q: 'How do I edit or delete my subsidiary business page?',
    a: 'If you are the owner of a verified business storefront, go to "My ListMe" > "Business Pages" or navigate directly to your page URL (/page/your-slug). You will find direct "Edit Page" and "Delete Page" controls in the owner action bar.',
    link: '/my-listme?tab=business-pages',
    linkLabel: 'Manage Business Pages'
  },
  {
    q: 'Why are phone numbers locked to +353 Republic of Ireland numbers?',
    a: 'ListMe is dedicated exclusively to residents and legitimate traders across Ireland. Enforcing standard Irish telephone prefixes safeguards all 32 counties from international robo-callers and overseas fraud networks.',
    link: '/privacy',
    linkLabel: 'Read Privacy & Verification'
  }
];

export default function HelpCentrePage() {
  const supabase = createClient();
  const [activeNav, setActiveNav] = useState('tickets');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Authenticated User & Profile Data (Real profile picture & name)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<{ avatar_url?: string; username?: string; full_name?: string } | null>(null);

  // Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  // Admin Capabilities State
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [ticketViewScope, setTicketViewScope] = useState<'my' | 'admin_all'>('my');
  const [adminAllTickets, setAdminAllTickets] = useState<SupportTicket[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // New Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Buyer Protection Claim');
  const [ticketRef, setTicketRef] = useState('');
  const [ticketInitialMessage, setTicketInitialMessage] = useState('');
  const [ticketError, setTicketError] = useState<string | null>(null);

  // Active Chat Message Input & Scroll Ref (Internal container scroll only)
  const [replyText, setReplyText] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const loadAdminTickets = async () => {
    setAdminLoading(true);
    try {
      const res = await getAllSupportTicketsAdminAction();
      if (res.success && res.tickets) {
        setAdminAllTickets(res.tickets);
        if (res.tickets.length > 0) {
          setActiveTicketId(res.tickets[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading admin tickets:', err);
    } finally {
      setAdminLoading(false);
    }
  };

  // Load real user profile & persisted tickets from Supabase metadata (fallback to localStorage)
  useEffect(() => {
    const loadUserAndTickets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        const adminCheck = isAdmin(user);
        setIsAdminUser(adminCheck);

        // Fetch user profile for avatar and username
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url, username, full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setUserProfile(profile);
        }

        // Check if user has tickets stored in Supabase user metadata
        const userSavedTickets = (user.user_metadata?.support_tickets || []) as SupportTicket[];
        if (Array.isArray(userSavedTickets) && userSavedTickets.length > 0) {
          setTickets(userSavedTickets);
          if (!adminCheck) {
            setActiveTicketId(userSavedTickets[0].id);
          }
        }

        if (adminCheck) {
          setTicketViewScope('admin_all');
          loadAdminTickets();
          return;
        }
      }

      // Fallback: check localStorage
      try {
        const stored = localStorage.getItem('listme_support_tickets');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTickets(parsed);
            setActiveTicketId(parsed[0].id);
            return;
          }
        }
      } catch {}

      if (!isAdminUser) {
        setTickets([]);
        setActiveTicketId(null);
      }
    };

    loadUserAndTickets();
  }, [supabase]);

  // Persist tickets to both Supabase user metadata and localStorage
  const saveTickets = async (updated: SupportTicket[]) => {
    setTickets(updated);
    try {
      localStorage.setItem('listme_support_tickets', JSON.stringify(updated));
    } catch {}

    if (currentUser) {
      try {
        await supabase.auth.updateUser({
          data: { support_tickets: updated }
        });
      } catch (err) {
        console.error('Failed to sync support tickets to Supabase user metadata:', err);
      }
    }
  };

  // Active tickets list depending on view scope
  const displayTickets = (isAdminUser && ticketViewScope === 'admin_all') ? adminAllTickets : tickets;

  // Status Filter and Search Query States
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'In Review' | 'Resolved' | 'Closed'>('All');
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [mobileTicketTab, setMobileTicketTab] = useState<'sidebar' | 'thread'>('thread');

  // Exact breakdown counts for each status
  const counts = {
    All: displayTickets.length,
    Open: displayTickets.filter(t => t.status === 'Open').length,
    'In Review': displayTickets.filter(t => t.status === 'In Review').length,
    Resolved: displayTickets.filter(t => t.status === 'Resolved').length,
    Closed: displayTickets.filter(t => t.status === 'Closed').length,
  };

  const filteredTickets = displayTickets.filter(t => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const q = ticketSearchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      t.id.toLowerCase().includes(q) || 
      t.subject.toLowerCase().includes(q) || 
      t.category.toLowerCase().includes(q) || 
      (t.userDisplayName && t.userDisplayName.toLowerCase().includes(q)) || 
      (t.userEmail && t.userEmail.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

  const activeTicket = displayTickets.find(t => t.id === activeTicketId) || filteredTickets[0] || displayTickets[0] || null;

  const handleSelectStatusFilter = (filter: 'All' | 'Open' | 'In Review' | 'Resolved' | 'Closed') => {
    setStatusFilter(filter);
    const matching = displayTickets.filter(t => filter === 'All' || t.status === filter);
    if (matching.length > 0 && (!activeTicketId || !matching.some(t => t.id === activeTicketId))) {
      setActiveTicketId(matching[0].id);
    }
  };

  // Scroll ONLY the message list container without ever scrolling the parent browser window!
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [activeTicketId, activeTicket?.messages?.length]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim()) {
      setTicketError('Please provide a subject describing your inquiry.');
      return;
    }
    if (!ticketInitialMessage.trim()) {
      setTicketError('Please enter details in your opening message.');
      return;
    }

    const newId = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleDateString('en-IE', { month: 'short', day: 'numeric', year: 'numeric' });

    const userDisplayName = userProfile?.full_name || userProfile?.username || currentUser?.email?.split('@')[0] || 'You';
    const userAvatarUrl = userProfile?.avatar_url || currentUser?.user_metadata?.avatar_url || '';

    const newTicket: SupportTicket = {
      id: newId,
      subject: ticketSubject.trim(),
      category: ticketCategory,
      status: 'Open',
      createdAt: nowStr,
      referenceId: ticketRef.trim() || undefined,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      userDisplayName,
      messages: [
        {
          id: `msg-open`,
          sender: 'user',
          senderName: userDisplayName,
          senderAvatar: userAvatarUrl,
          content: ticketInitialMessage.trim(),
          timestamp: 'Just now'
        },
        {
          id: `msg-ack`,
          sender: 'support',
          senderName: 'ListMe Support Team',
          content: 'Thank you for reaching out to ListMe Ireland. A verified support officer has been assigned to this ticket and will respond directly in this channel shortly.',
          timestamp: 'Just now'
        }
      ]
    };

    const updated = [newTicket, ...tickets];
    await saveTickets(updated);
    setActiveTicketId(newId);
    setShowNewTicketModal(false);
    setTicketSubject('');
    setTicketRef('');
    setTicketInitialMessage('');
    setTicketError(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    // Case 1: Admin replying across user channels
    if (isAdminUser && ticketViewScope === 'admin_all' && activeTicket.userId) {
      const adminName = userProfile?.full_name || currentUser?.email?.split('@')[0] || 'ListMe Support Officer';
      const newMsg: TicketMessage = {
        id: `msg-${Date.now()}`,
        sender: 'support',
        senderName: `${adminName} (Admin)`,
        content: replyText.trim(),
        timestamp: 'Just now'
      };

      const updatedTicket: SupportTicket = {
        ...activeTicket,
        messages: [...activeTicket.messages, newMsg]
      };

      setAdminAllTickets(prev => prev.map(t => t.id === activeTicket.id ? updatedTicket : t));
      setReplyText('');

      try {
        await adminReplySupportTicketAction(activeTicket.userId, activeTicket.id, replyText.trim(), activeTicket.status);
      } catch (err) {
        console.error('Error sending admin reply:', err);
      }
      return;
    }

    // Case 2: Regular user replying in their own ticket
    const userDisplayName = userProfile?.full_name || userProfile?.username || currentUser?.email?.split('@')[0] || 'You';
    const userAvatarUrl = userProfile?.avatar_url || currentUser?.user_metadata?.avatar_url || '';

    const userMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: userDisplayName,
      senderAvatar: userAvatarUrl,
      content: replyText.trim(),
      timestamp: 'Just now'
    };

    const updatedTicket: SupportTicket = {
      ...activeTicket,
      messages: [...activeTicket.messages, userMsg]
    };

    const updatedList = tickets.map(t => t.id === activeTicket.id ? updatedTicket : t);
    await saveTickets(updatedList);
    setReplyText('');
  };

  const handleAdminChangeStatus = async (newStatus: 'Open' | 'In Review' | 'Resolved' | 'Closed') => {
    if (!activeTicket || !isAdminUser) return;

    const updatedTicket: SupportTicket = {
      ...activeTicket,
      status: newStatus,
    };

    if (ticketViewScope === 'admin_all') {
      setAdminAllTickets(prev => prev.map(t => t.id === activeTicket.id ? updatedTicket : t));
      if (activeTicket.userId) {
        await adminReplySupportTicketAction(
          activeTicket.userId,
          activeTicket.id,
          `Ticket status updated to "${newStatus}" by administrator.`,
          newStatus
        );
      }
    } else {
      const updatedList = tickets.map(t => t.id === activeTicket.id ? updatedTicket : t);
      await saveTickets(updatedList);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'Resolved' as const,
          messages: [
            ...t.messages,
            {
              id: `msg-${Date.now()}`,
              sender: 'system' as const,
              senderName: 'System',
              content: 'This ticket has been closed and marked as Resolved.',
              timestamp: 'Just now'
            }
          ]
        };
      }
      return t;
    });
    await saveTickets(updated);
  };

  const filteredFaqs = FAQ_DATA.filter(
    f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-200 font-medium">Help Centre &amp; Support</span>
        </div>

        {/* Header Title Section (Neutral styling, zero green background) */}
        <div className="mb-10 pb-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-bold mb-3 border border-gray-200 dark:border-zinc-700">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>CUSTOMER SUPPORT &amp; KNOWLEDGE BASE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            ListMe Help Centre
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl mt-2 leading-relaxed">
            Instant help resources, buyer protection guides, marketplace fees breakdown, and verified Discord-style support tickets. All dispute communications are resolved securely inside your account dashboard.
          </p>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <span>Official Support Desk</span>
            <span>•</span>
            <span>Applies to all registered members</span>
          </div>
        </div>

        {/* 2-Column Responsive Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sticky Left Navigation Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 px-2">
                On This Page
              </h2>
              <nav className="space-y-1">
                {[
                  { id: 'tickets', label: '1. Support Tickets (Live Thread)', icon: MessageSquare },
                  { id: 'protection', label: '2. Buyer Protection & Escrow', icon: ShieldCheck },
                  { id: 'fees', label: '3. Selling & Marketplace Fees', icon: Package },
                  { id: 'security', label: '4. Account, Cards & PIN Security', icon: CreditCard },
                  { id: 'storefronts', label: '5. Business Pages & Marketplace', icon: Building2 },
                  { id: 'faqs', label: '6. Frequently Asked Questions', icon: HelpCircle },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setActiveNav(item.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        isActive 
                          ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800/60 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </a>
                  );
                })}
              </nav>

              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Open New Support Ticket</span>
                </button>
              </div>
            </div>

            {/* Direct Policy Fast-Links Box */}
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">
                Quick Marketplace Policies
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/buyer-protection" className="text-gray-600 dark:text-gray-400 hover:text-primary flex items-center justify-between">
                    <span>Buyer Protection Policy</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link href="/fees" className="text-gray-600 dark:text-gray-400 hover:text-primary flex items-center justify-between">
                    <span>Marketplace Fee Structure</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary flex items-center justify-between">
                    <span>Privacy &amp; Data Protection</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary flex items-center justify-between">
                    <span>Terms &amp; Conditions</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* SECTION 1: DISCORD-STYLE SUPPORT TICKETS */}
            <section id="tickets" className="scroll-mt-20">
              <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
                
                {/* Tickets Top Bar */}
                <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 dark:bg-zinc-900/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 text-white flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>Direct Support Ticket Thread</span>
                        {activeTicket && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                            #{activeTicket.id}
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Zero email ping-pong or phone numbers. All queries are handled in verified account threads.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isAdminUser && (
                      <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-bold mr-1">
                        <button
                          type="button"
                          onClick={() => {
                            setTicketViewScope('admin_all');
                            setStatusFilter('All');
                            if (adminAllTickets[0]) setActiveTicketId(adminAllTickets[0].id);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                            ticketViewScope === 'admin_all'
                              ? 'bg-primary text-white shadow-xs'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          All Channels ({adminAllTickets.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTicketViewScope('my');
                            setStatusFilter('All');
                            if (tickets[0]) setActiveTicketId(tickets[0].id);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                            ticketViewScope === 'my'
                              ? 'bg-primary text-white shadow-xs'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          My Tickets ({tickets.length})
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowNewTicketModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Ticket</span>
                    </button>
                  </div>
                </div>

                {/* If no tickets exist at all, show honest empty state */}
                {displayTickets.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center bg-white dark:bg-[#151515]">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      {ticketViewScope === 'admin_all' ? 'No User Channels Open' : 'No Support Tickets Open'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-5">
                      {ticketViewScope === 'admin_all'
                        ? 'All user support tickets have been attended to.'
                        : 'Need help with a purchase, dispute, linked card, or business storefront? Open a support ticket to start a direct, authenticated conversation.'}
                    </p>
                    {ticketViewScope === 'my' && (
                      <button
                        type="button"
                        onClick={() => setShowNewTicketModal(true)}
                        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Open Support Ticket</span>
                      </button>
                    )}
                  </div>
                ) : (
                  /* Two-Pane Ticket Layout: Sidebar (Left) + Active Ticket Thread (Right) */
                  <div className="flex flex-col md:flex-row min-h-[580px]">
                    
                    {/* LEFT SIDEBAR: Ticket Channels & Status Breakdown Counts */}
                    <div className={`w-full md:w-80 lg:w-80 shrink-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-zinc-800 flex flex-col bg-gray-50/70 dark:bg-[#151515] ${
                      mobileTicketTab === 'thread' ? 'hidden md:flex' : 'flex'
                    }`}>
                      
                      {/* 1. Status Breakdown Counts ("a section of how many of each then u can get specific like resolved, in review, open or closed") */}
                      <div className="p-3 border-b border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Ticket Status
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-bold">
                            {counts.All} Total
                          </span>
                        </div>

                        {/* 5 Status Filter Buttons */}
                        <div className="grid grid-cols-5 gap-1 text-center">
                          {[
                            { key: 'All' as const, label: 'All', count: counts.All, color: 'bg-zinc-400 dark:bg-zinc-400' },
                            { key: 'Open' as const, label: 'Open', count: counts.Open, color: 'bg-emerald-500' },
                            { key: 'In Review' as const, label: 'Review', count: counts['In Review'], color: 'bg-amber-500' },
                            { key: 'Resolved' as const, label: 'Resolved', count: counts.Resolved, color: 'bg-blue-500' },
                            { key: 'Closed' as const, label: 'Closed', count: counts.Closed, color: 'bg-zinc-500' },
                          ].map((item) => {
                            const isSelected = statusFilter === item.key;
                            return (
                              <button
                                key={item.key}
                                type="button"
                                onClick={() => handleSelectStatusFilter(item.key)}
                                className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                                  isSelected
                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                                    : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700/60 border border-gray-200 dark:border-zinc-700/70'
                                }`}
                              >
                                <span className="text-[9px] font-bold uppercase tracking-tight flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${item.color}`}></span>
                                  {item.label}
                                </span>
                                <span className="text-xs font-black mt-0.5 leading-none">
                                  {item.count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Fast Filter / Search Box */}
                      <div className="p-2.5 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818]">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={ticketSearchQuery}
                            onChange={(e) => setTicketSearchQuery(e.target.value)}
                            placeholder="Filter by ID, subject, or user..."
                            className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                          />
                          {ticketSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setTicketSearchQuery('')}
                              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 3. Channels List */}
                      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800/70 max-h-[500px]">
                        {filteredTickets.length === 0 ? (
                          <div className="p-6 text-center text-xs text-gray-400">
                            <p className="font-semibold text-gray-600 dark:text-gray-300">
                              No {statusFilter !== 'All' ? `"${statusFilter}"` : ''} tickets found
                            </p>
                            {(statusFilter !== 'All' || ticketSearchQuery) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setStatusFilter('All');
                                  setTicketSearchQuery('');
                                }}
                                className="mt-2 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                              >
                                Reset filters ({counts.All} total)
                              </button>
                            )}
                          </div>
                        ) : (
                          filteredTickets.map((t) => {
                            const isSelected = t.id === activeTicket?.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  setActiveTicketId(t.id);
                                  setMobileTicketTab('thread');
                                }}
                                className={`w-full text-left p-3.5 transition-colors cursor-pointer flex flex-col gap-1.5 ${
                                  isSelected
                                    ? 'bg-white dark:bg-[#1e1e1e] border-l-4 border-l-primary shadow-xs'
                                    : 'hover:bg-gray-100/70 dark:hover:bg-zinc-800/40 bg-transparent'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono font-bold text-xs text-gray-900 dark:text-white truncate">
                                    #{t.id}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider shrink-0 ${
                                    t.status === 'Open'
                                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80'
                                      : t.status === 'In Review'
                                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80'
                                      : t.status === 'Resolved'
                                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80'
                                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                                  }`}>
                                    {t.status}
                                  </span>
                                </div>

                                <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                                  {t.subject}
                                </p>

                                <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                                  <span className="truncate max-w-[140px] font-medium">
                                    {ticketViewScope === 'admin_all' && t.userDisplayName
                                      ? `User: ${t.userDisplayName}`
                                      : t.category}
                                  </span>
                                  <span className="shrink-0 text-[10px] font-mono">
                                    {t.createdAt}
                                  </span>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>

                    </div>

                    {/* RIGHT PANE: Active Ticket Chat & Controls */}
                    <div className={`flex-1 flex flex-col min-w-0 bg-white dark:bg-[#181818] ${
                      mobileTicketTab === 'sidebar' ? 'hidden md:flex' : 'flex'
                    }`}>
                      {activeTicket ? (
                        <>
                          {/* Active Ticket Header */}
                          <div className="p-3.5 px-4 bg-gray-50/80 dark:bg-zinc-900/60 border-b border-gray-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              {/* Mobile Back Button */}
                              <button
                                type="button"
                                onClick={() => setMobileTicketTab('sidebar')}
                                className="md:hidden px-2 py-1 rounded-md bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-bold mr-1"
                              >
                                &larr; Tickets ({counts.All})
                              </button>

                              <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 truncate">
                                <Hash className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="truncate">{activeTicket.subject}</span>
                              </span>

                              {ticketViewScope === 'admin_all' && (
                                <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] shrink-0">
                                  User: {activeTicket.userDisplayName || activeTicket.userEmail}
                                </span>
                              )}

                              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 shrink-0">
                                {activeTicket.category}
                              </span>

                              {activeTicket.referenceId && (
                                <span className="hidden lg:inline text-gray-500 font-mono text-[11px] shrink-0">
                                  Ref: {activeTicket.referenceId}
                                </span>
                              )}
                            </div>

                            {/* Status Switcher (Admin) or Status Badge + Mark as Resolved (User) */}
                            <div className="flex items-center gap-2 shrink-0">
                              {isAdminUser && ticketViewScope === 'admin_all' ? (
                                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                  {(['Open', 'In Review', 'Resolved', 'Closed'] as const).map((st) => (
                                    <button
                                      key={st}
                                      type="button"
                                      onClick={() => handleAdminChangeStatus(st)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                                        activeTicket.status === st
                                          ? 'bg-primary text-white shadow-xs'
                                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                      }`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                                    activeTicket.status === 'Open'
                                      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                      : activeTicket.status === 'In Review'
                                      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                      : activeTicket.status === 'Resolved'
                                      ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      activeTicket.status === 'Open' ? 'bg-emerald-500' :
                                      activeTicket.status === 'In Review' ? 'bg-amber-500' :
                                      activeTicket.status === 'Resolved' ? 'bg-blue-500' : 'bg-gray-400'
                                    }`}></span>
                                    {activeTicket.status}
                                  </span>

                                  {activeTicket.status !== 'Resolved' && activeTicket.status !== 'Closed' && (
                                    <button
                                      type="button"
                                      onClick={() => handleCloseTicket(activeTicket.id)}
                                      className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-zinc-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                    >
                                      Mark as Resolved
                                    </button>
                                  )}
                                </div>
                              )}

                              <span className="text-gray-400 text-[11px] font-mono hidden sm:inline">
                                {activeTicket.createdAt}
                              </span>
                            </div>
                          </div>

                          {/* Message Stream */}
                          <div
                            ref={messagesContainerRef}
                            className="flex-1 p-4 sm:p-6 space-y-4 max-h-[440px] overflow-y-auto bg-white dark:bg-[#151515]"
                          >
                            {activeTicket.messages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex gap-3 text-xs leading-relaxed ${
                                  msg.sender === 'system'
                                    ? 'p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400'
                                    : ''
                                }`}
                              >
                                {/* Profile Picture of User on their messages */}
                                {msg.sender === 'user' ? (
                                  msg.senderAvatar || userProfile?.avatar_url || currentUser?.user_metadata?.avatar_url ? (
                                    <img
                                      src={msg.senderAvatar || userProfile?.avatar_url || currentUser?.user_metadata?.avatar_url}
                                      alt={msg.senderName}
                                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200 dark:border-zinc-700"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold text-xs shrink-0 border border-zinc-700">
                                      {(msg.senderName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                  )
                                ) : msg.sender === 'support' ? (
                                  <div className="w-8 h-8 rounded-full bg-zinc-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 border border-zinc-600">
                                    STAFF
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                                    SYS
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                      {msg.senderName}
                                    </span>
                                    {msg.sender === 'support' && (
                                      <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-[9px] font-bold uppercase">
                                        Verified Staff
                                      </span>
                                    )}
                                    <span className="text-[10px] text-gray-400">
                                      {msg.timestamp}
                                    </span>
                                  </div>
                                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                                    {msg.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Reply Form */}
                          {activeTicket.status !== 'Resolved' && activeTicket.status !== 'Closed' ? (
                            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#1a1a1a] flex gap-2">
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Reply in #${activeTicket.id}...`}
                                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                              />
                              <button
                                type="submit"
                                disabled={!replyText.trim()}
                                className="px-4 py-2.5 bg-primary hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                              >
                                <span>Send</span>
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </form>
                          ) : (
                            <div className="p-3 text-center border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#1a1a1a] text-xs text-gray-500">
                              This ticket is marked as {activeTicket.status}. Open a new ticket if you have an additional inquiry.
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                          <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                          <p className="font-bold text-sm text-gray-600 dark:text-gray-300">No ticket selected</p>
                          <p className="text-xs text-gray-400 mt-1">Select a ticket from the sidebar to view thread</p>
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>
            </section>

            {/* SECTION 2: BUYER PROTECTION & ESCROW */}
            <section id="protection" className="scroll-mt-20">
              <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-300">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Coverage Standards</span>
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                  2. ListMe Buyer Protection &amp; Escrow Guarantee
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Every eligible marketplace transaction finalized through ListMe escrow or linked payment cards is backed up to €5,000 against counterfeit items, non-delivery, and items substantially not as described.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60">
                    <span className="block font-bold text-xs text-gray-900 dark:text-white mb-1">Coverage Limit</span>
                    <span className="text-gray-900 dark:text-white font-black text-base">Up to €5,000</span>
                    <p className="text-[11px] text-gray-500 mt-1">Full reimbursement per eligible transaction.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60">
                    <span className="block font-bold text-xs text-gray-900 dark:text-white mb-1">Claim Window</span>
                    <span className="text-gray-900 dark:text-white font-black text-base">30 Calendar Days</span>
                    <p className="text-[11px] text-gray-500 mt-1">From delivery date or scheduled collection.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60">
                    <span className="block font-bold text-xs text-gray-900 dark:text-white mb-1">Resolution Time</span>
                    <span className="text-gray-900 dark:text-white font-black text-base">48 - 72 Hours</span>
                    <p className="text-[11px] text-gray-500 mt-1">Investigated directly by disputes staff.</p>
                  </div>
                </div>

                <Link
                  href="/buyer-protection"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <span>Read Full Buyer Protection Guide &amp; Claim Rules</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </section>

            {/* SECTION 3: SELLING & MARKETPLACE FEES */}
            <section id="fees" className="scroll-mt-20">
              <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-300">
                  <Package className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Marketplace Selling</span>
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                  3. Selling on ListMe &amp; Marketplace Fees
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  ListMe provides simple, transparent fee structures for all Irish sellers. All transactions and platform fees are processed securely via Stripe Connect directly to your linked bank account.
                </p>

                <div className="space-y-2 mb-5">
                  <div className="p-3 rounded-xl border border-gray-100 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-900/40 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-gray-900 dark:text-white">TradeMe Style Branches:</span> List general items, job vacancies, or trade services directly via the Start a Listing wizard.
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-gray-100 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-900/40 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-gray-900 dark:text-white">Auction &amp; Buy Now Flexibility:</span> Run standard reserve auctions or enable instant 1-click Buy Now pricing.
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/sell"
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    Start a Listing
                  </Link>
                  <Link
                    href="/fees"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                  >
                    <span>View Marketplace Fee Table</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </section>

            {/* SECTION 4: ACCOUNT, CARDS & PIN SECURITY */}
            <section id="security" className="scroll-mt-20">
              <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-300">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Vault &amp; PIN Authentication</span>
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                  4. Account Verification, Linked Cards &amp; PIN Security
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  ListMe implements Stripe PCI SAQ-A compliant tokenization. Card numbers are vaulted securely with Stripe and never stored in plain text on our servers. Instant bidding and top-ups are safeguarded by your 4-digit security PIN.
                </p>

                <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60 mb-5">
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                    How to Manage Linked Cards
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Navigate to "My ListMe" &gt; "Wallet &amp; Linked Cards". Once your card is linked, you can replace or unlink it anytime without having to re-link or re-vault.
                  </p>
                </div>

                <Link
                  href="/my-listme?tab=account"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <span>Go to My ListMe Wallet &amp; Cards</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </section>

            {/* SECTION 5: BUSINESS PAGES & STOREFRONTS */}
            <section id="storefronts" className="scroll-mt-20">
              <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-300">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Subsidiary Storefronts</span>
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                  5. Business Pages &amp; Marketplace Storefronts
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Registered business members can establish subsidiary business pages declared as either a <strong>Service Business</strong> (quotes, trades, local contractor profile) or a <strong>Marketplace Store</strong> (selling multiple items under a store brand).
                </p>

                <div className="space-y-2 mb-5 text-xs">
                  <div className="p-3 rounded-xl border border-gray-100 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-900/40">
                    <span className="font-bold text-gray-900 dark:text-white">Storefront Inventory:</span> When creating a listing, business owners with a marketplace page can choose to publish the listing directly into their subsidiary storefront.
                  </div>
                  <div className="p-3 rounded-xl border border-gray-100 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-900/40">
                    <span className="font-bold text-gray-900 dark:text-white">Custom Announcements &amp; Hours:</span> Publish a custom announcement (up to 250 characters) and display operational opening hours to prospective customers.
                  </div>
                </div>

                <Link
                  href="/my-listme?tab=business-pages"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <span>Manage Business Pages in My ListMe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </section>

            {/* SECTION 6: FAQS KNOWLEDGE BASE */}
            <section id="faqs" className="scroll-mt-20">
              <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-4">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">
                      6. Frequently Asked Questions
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Quick answers to platform inquiries.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {filteredFaqs.length} {filteredFaqs.length === 1 ? 'Article' : 'Articles'}
                  </span>
                </div>

                {/* Search */}
                <div className="relative mb-5">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search FAQ keywords..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                  {filteredFaqs.map((faq, idx) => (
                    <div key={idx} className="py-3.5">
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between gap-4 text-left font-bold text-xs sm:text-sm text-gray-900 dark:text-white cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {expandedFaq === idx ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                      </button>

                      {expandedFaq === idx && (
                        <div className="mt-2.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed pr-6">
                          <p>{faq.a}</p>
                          {faq.link && (
                            <div className="mt-2">
                              <Link href={faq.link} className="text-primary font-bold hover:underline inline-flex items-center gap-1">
                                <span>{faq.linkLabel}</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            </section>

          </div>

        </div>

      </div>

      {/* CREATE NEW SUPPORT TICKET MODAL */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    Open Support Ticket
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Direct thread stored in your authenticated account dashboard.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowNewTicketModal(false);
                  setTicketError(null);
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ticketError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{ticketError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">
                  Ticket Category / Department
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="Buyer Protection Claim">Buyer Protection Claim (Non-Delivery / Item Dispute)</option>
                  <option value="Seller Support & Fees">Seller Support &amp; Payouts</option>
                  <option value="Account & Card Verification">Account &amp; Card Security / PIN</option>
                  <option value="Business Storefront Inquiry">Business Page &amp; Storefront Inquiry</option>
                  <option value="Report User or Scam">Report Suspicious User or Scam Listing</option>
                  <option value="General Technical Issue">General Technical Issue</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g., Claim under Buyer Protection for Order #8391"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">
                  Related Listing or Order Reference <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={ticketRef}
                  onChange={(e) => setTicketRef(e.target.value)}
                  placeholder="e.g., #LIST-3012 or item title"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">
                  Detailed Message
                </label>
                <textarea
                  value={ticketInitialMessage}
                  onChange={(e) => setTicketInitialMessage(e.target.value)}
                  rows={4}
                  placeholder="Explain what happened or what assistance you need. Staff will respond in this ticket thread."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-green-700 text-white font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
