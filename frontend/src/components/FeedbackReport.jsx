import React, { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";
import { API_ENDPOINTS } from "../constants/api";
import {
  Sparkles,
  TrendingUp,
  MessageSquare,
  Brain,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const RATING_CONFIG = {
  POOR: {
    label: "Poor",
    emoji: "😟",
    className: "border-red-500/30 bg-linear-to-br from-red-600/20",
  },
  AVERAGE: {
    label: "Average",
    emoji: "😐",
    className: "border-orange-500/30 bg-linear-to-br from-orange-600/20",
  },
  GOOD: {
    label: "Good",
    emoji: "😊",
    className: "border-blue-500/30 bg-linear-to-br from-blue-600/20",
  },
  EXCELLENT: {
    label: "Excellent",
    emoji: "🤩",
    className: "border-amber-500/30 bg-linear-to-br from-amber-600/20",
  },
};

const LoadingFeedback = () => (
  <div className="max-w-6xl mx-auto px-6 py-12">
    <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-12 text-center">
      <p className="text-stone-400">Loading feedback report...</p>
    </div>
  </div>
);

const FeedbackReport = ({ interviewId }) => {
  const { data: reportData, loading, error: fetchError } = useApi(
    `${API_ENDPOINTS.INTERVIEWS.BASE}/${interviewId}/feedback`,
    "GET",
    { interview: null, feedback: null }
  );

  const feedback = reportData?.feedback;
  const interview = reportData?.interview;
  const [error, setError] = useState("");

  useEffect(() => {
    if (fetchError) {
      setError(fetchError?.message || "Feedback not available yet");
    }
  }, [fetchError]);

  if (loading) return <LoadingFeedback />;

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Alert type="error" message={error} />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-stone-400">No feedback available</p>
        </div>
      </div>
    );
  }

  const rating = RATING_CONFIG[feedback.overallRating] || RATING_CONFIG.GOOD;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-6">
      {/* HEADER */}
      <div className="text-center mb-8">
        <p className="text-xs font-semibold text-amber-400 tracking-widest uppercase mb-2">
          ← Feedback Report
        </p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight text-stone-100 mb-2">
          AI Interview Analysis
        </h1>
        {interview?.interviewee && (
          <p className="text-sm text-stone-500 font-light">
            Performance analysis for{" "}
            <span className="text-amber-100">{interview.interviewee.name}</span>
          </p>
        )}
      </div>

      {/* OVERALL RATING */}
      <div
        className={`rounded-2xl border ${rating.className} to-transparent p-6 flex items-center justify-between`}
      >
        <div>
          <p className="text-[10px] uppercase tracking-widest opacity-60">
            Overall rating
          </p>
          <p className="font-serif text-4xl text-stone-100">{rating.label}</p>
        </div>
        <span className="text-6xl">{rating.emoji}</span>
      </div>

      {/* SUMMARY */}
      <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={14} className="text-amber-400" />
          <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
            Summary
          </p>
        </div>
        <p className="text-stone-300 leading-relaxed">
          {feedback.summary}
        </p>
      </div>

      {/* DETAILED ANALYSIS - GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Technical Knowledge */}
        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={14} className="text-blue-400" />
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
              Technical Knowledge
            </p>
          </div>
          <p className="text-stone-300 text-sm leading-relaxed">
            {feedback.technical}
          </p>
        </div>

        {/* Communication */}
        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={14} className="text-green-400" />
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
              Communication
            </p>
          </div>
          <p className="text-stone-300 text-sm leading-relaxed">
            {feedback.communication}
          </p>
        </div>

        {/* Problem Solving */}
        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-purple-400" />
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
              Problem Solving
            </p>
          </div>
          <p className="text-stone-300 text-sm leading-relaxed">
            {feedback.problemSolving}
          </p>
        </div>

        {/* Recommendation */}
        <div className="bg-[#0f0f11] border border-amber-500/20 rounded-2xl p-8 bg-linear-to-br from-amber-600/10">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={14} className="text-amber-400" />
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
              Recommendation
            </p>
          </div>
          <p className="text-stone-200 text-sm leading-relaxed">
            {feedback.recommendation}
          </p>
        </div>
      </div>

      {/* STRENGTHS */}
      <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle2 size={14} className="text-green-400" />
          <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
            Strengths
          </p>
        </div>
        <ul className="space-y-3">
          {feedback.strengths?.map((strength, idx) => (
            <li key={idx} className="flex items-start gap-3 text-stone-300">
              <span className="text-amber-400 font-bold mt-0.5 flex-shrink-0">
                ✓
              </span>
              <span className="text-sm">{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* IMPROVEMENTS */}
      <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={14} className="text-orange-400" />
          <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
            Areas for Improvement
          </p>
        </div>
        <ul className="space-y-3">
          {feedback.improvements?.map((improvement, idx) => (
            <li key={idx} className="flex items-start gap-3 text-stone-300">
              <span className="text-amber-300 font-bold mt-0.5 flex-shrink-0">
                →
              </span>
              <span className="text-sm">{improvement}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* INTERVIEWER RATING */}
      {feedback.sessionRating && (
        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8">
          <p className="text-xs font-semibold text-stone-500 tracking-widest uppercase mb-6">
            Interviewer's Session Rating
          </p>
          <div className="flex items-end gap-6 mb-4">
            <div className="flex gap-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <span
                    key={i}
                    className={`text-4xl ${
                      i < feedback.sessionRating
                        ? "text-amber-400"
                        : "text-stone-700"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
            </div>
            <p className="font-serif text-3xl text-amber-400 leading-none">
              {feedback.sessionRating}/5
            </p>
          </div>
          {feedback.sessionComment && (
            <p className="p-4 bg-[#141417] border border-white/8 rounded-lg text-stone-300 italic text-sm">
              "{feedback.sessionComment}"
            </p>
          )}
        </div>
      )}

      {/* RECORDING */}
      {interview?.recordingUrl && (
        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8">
          <p className="text-xs font-semibold text-stone-500 tracking-widest uppercase mb-4">
            Recording & Playback
          </p>
          <p className="text-stone-500 text-sm mb-4">
            Duration:{" "}
            <span className="text-stone-300 font-semibold">
              {(interview.recordingDuration / 60).toFixed(1)} minutes
            </span>
          </p>
          <Button
            as="a"
            href={interview.recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            ▶ Watch Recording
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeedbackReport;
