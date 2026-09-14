'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HelpCircle, 
  ShieldAlert, 
  CornerDownRight, 
  Loader2,
  Lock
} from 'lucide-react';
import { 
  ListingQuestion, 
  askListingQuestionAction, 
  answerListingQuestionAction 
} from '@/app/actions/listingQuestions';

interface ListingQuestionsSectionProps {
  listingId: string;
  sellerId: string;
  isOwnListing: boolean;
  currentUser: {
    id: string;
    username: string;
    avatarUrl?: string;
  } | null;
  initialQuestions: ListingQuestion[];
}

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ListingQuestionsSection({
  listingId,
  sellerId,
  isOwnListing,
  currentUser,
  initialQuestions,
}: ListingQuestionsSectionProps) {
  const [questions, setQuestions] = useState<ListingQuestion[]>(initialQuestions);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [askError, setAskError] = useState<string | null>(null);
  const [askSuccess, setAskSuccess] = useState<string | null>(null);
  const [isAsking, startAskTransition] = useTransition();

  // Answer state for seller
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [isAnswering, startAnswerTransition] = useTransition();

  const hasAsked = Boolean(
    currentUser && questions.some(q => q.buyerId === currentUser.id)
  );

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAskError(null);
    setAskSuccess(null);

    if (!newQuestionText.trim() || newQuestionText.trim().length < 5) {
      setAskError('Please write a question with at least 5 characters.');
      return;
    }

    startAskTransition(async () => {
      const res = await askListingQuestionAction({
        listingId,
        questionText: newQuestionText,
      });

      if (!res.success || !res.question) {
        setAskError(res.error || 'Failed to submit question.');
        return;
      }

      setQuestions(prev => [...prev, res.question!]);
      setNewQuestionText('');
      setAskSuccess('Your question was posted publicly and sent to the seller!');
    });
  };

  const handleAnswerSubmit = (questionId: string) => {
    setAnswerError(null);
    if (!answerText.trim()) {
      setAnswerError('Please enter an answer.');
      return;
    }

    startAnswerTransition(async () => {
      const res = await answerListingQuestionAction({
        listingId,
        questionId,
        answerText,
      });

      if (!res.success) {
        setAnswerError(res.error || 'Failed to submit answer.');
        return;
      }

      setQuestions(prev =>
        prev.map(q => {
          if (q.id === questionId) {
            return {
              ...q,
              answer: {
                text: answerText.trim(),
                sellerId: currentUser?.id || sellerId,
                sellerUsername: currentUser?.username || 'Seller',
                sellerAvatarUrl: currentUser?.avatarUrl,
                answeredAt: new Date().toISOString(),
              },
            };
          }
          return q;
        })
      );

      setAnsweringQuestionId(null);
      setAnswerText('');
    });
  };

  return (
    <div id="questions-and-answers" className="bg-white dark:bg-[#202020] rounded-2xl border border-gray-200 dark:border-[#333333] p-6 sm:p-8 space-y-6 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-[#333333] pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Questions &amp; Answers</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                {questions.length}
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Public discussion between buyers and the seller.
            </p>
          </div>
        </div>

        {/* Security / Privacy Warning */}
        <div className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Do not share phone numbers or personal addresses.</span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto text-gray-400 opacity-60" />
            <p className="font-medium text-gray-700 dark:text-gray-300">No questions asked yet.</p>
            <p className="text-xs">Have a question about delivery, condition, or pick-up? Ask below!</p>
          </div>
        ) : (
          questions.map((q) => {
            const isBuyer = currentUser?.id === q.buyerId;
            return (
              <div 
                key={q.id} 
                className="p-4 rounded-xl border border-gray-200 dark:border-[#333333] bg-gray-50/60 dark:bg-[#252525]/60 space-y-3"
              >
                {/* Question */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden relative border border-primary/30">
                    {q.buyerAvatarUrl ? (
                      <Image
                        src={q.buyerAvatarUrl}
                        alt={q.buyerUsername}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span>{q.buyerUsername.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <span>@{q.buyerUsername}</span>
                        {isBuyer && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-medium">You</span>
                        )}
                      </div>
                      <span className="text-gray-400 dark:text-gray-500 text-[11px]">
                        {timeAgo(q.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 font-normal leading-relaxed">
                      {q.question}
                    </p>
                  </div>
                </div>

                {/* Seller Answer */}
                {q.answer ? (
                  <div className="ml-5 sm:ml-9 p-3.5 rounded-xl bg-white dark:bg-[#1e1e1e] border-l-4 border-l-primary border-y border-r border-gray-200 dark:border-[#383838] space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-1.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-bold text-gray-900 dark:text-white">
                          @{q.answer.sellerUsername}
                        </span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                          Seller
                        </span>
                      </div>
                      <span className="text-gray-400 dark:text-gray-500 text-[11px]">
                        {timeAgo(q.answer.answeredAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 pl-5 leading-relaxed">
                      {q.answer.text}
                    </p>
                  </div>
                ) : (
                  <div className="ml-5 sm:ml-9 pt-1">
                    {isOwnListing ? (
                      answeringQuestionId === q.id ? (
                        <div className="p-3 bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-[#383838] space-y-2">
                          <label className="text-xs font-semibold text-gray-900 dark:text-white block">
                            Your Public Answer
                          </label>
                          <textarea
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            placeholder="Write an answer that all members will see..."
                            rows={2}
                            maxLength={500}
                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          {answerError && (
                            <p className="text-xs text-red-500">{answerError}</p>
                          )}
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setAnsweringQuestionId(null);
                                setAnswerText('');
                                setAnswerError(null);
                              }}
                              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAnswerSubmit(q.id)}
                              disabled={isAnswering}
                              className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
                            >
                              {isAnswering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                              <span>Post Answer</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setAnsweringQuestionId(q.id);
                            setAnswerText('');
                            setAnswerError(null);
                          }}
                          className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>Reply / Answer this question</span>
                        </button>
                      )
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>Awaiting seller response</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* "Ask a Question" Form / Gate */}
      <div className="border-t border-gray-200 dark:border-[#333333] pt-6">
        {isOwnListing ? (
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#252525] text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#383838] flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary shrink-0" />
            <span>You are the seller of this listing. You can respond to buyer questions above.</span>
          </div>
        ) : !currentUser ? (
          <div className="p-5 rounded-xl bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#383838] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <div className="font-bold text-sm text-gray-900 dark:text-white">Have a question for the seller?</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sign in to ask a public question before bidding or buying.</p>
            </div>
            <Link
              href={`/login?returnUrl=/listing/${listingId}#questions-and-answers`}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Sign in to ask
            </Link>
          </div>
        ) : hasAsked ? (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
            <span>You have submitted your question on this listing. Buyers are limited to 1 question per listing so the seller can answer for all members.</span>
          </div>
        ) : (
          <form onSubmit={handleAskSubmit} className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="listing-question-input" className="font-bold text-gray-900 dark:text-white">
                Ask the Seller a Question
              </label>
              <span className="text-gray-400">
                {newQuestionText.length}/500 • 1 question allowed
              </span>
            </div>

            <div className="relative">
              <textarea
                id="listing-question-input"
                value={newQuestionText}
                onChange={(e) => {
                  setNewQuestionText(e.target.value);
                  setAskError(null);
                }}
                maxLength={500}
                rows={3}
                placeholder="Ask about delivery options, item condition, or collection times... (Do not share phone numbers or exact home addresses)"
                required
                className="w-full p-3.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1a1a1a] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400"
              />
            </div>

            {askError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{askError}</span>
              </div>
            )}

            {askSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{askSuccess}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-md">
                Questions and answers are visible to all members. The seller will also be notified in their inbox.
              </p>
              <button
                type="submit"
                disabled={isAsking || !newQuestionText.trim()}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-xs"
              >
                {isAsking ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask Question</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
