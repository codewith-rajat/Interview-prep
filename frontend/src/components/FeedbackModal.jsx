import React, { useState } from "react";
import { useApi } from "../hooks/useApi";
import { useForm } from "../hooks/useForm";
import { Modal } from "./ui/Modal";
import { Alert } from "./ui/Alert";
import { API_ENDPOINTS } from "../constants/api";
import { Sparkles } from "lucide-react";

const RATING_CONFIG = {
  1: {
    label: "Poor",
    emoji: "😟",
    className: "border-red-500/30 text-red-400",
    bg: "from-red-600/20",
  },
  2: {
    label: "Average",
    emoji: "😐",
    className: "border-orange-500/30 text-orange-400",
    bg: "from-orange-600/20",
  },
  3: {
    label: "Good",
    emoji: "😊",
    className: "border-blue-500/30 text-blue-400",
    bg: "from-blue-600/20",
  },
  4: {
    label: "Very Good",
    emoji: "😄",
    className: "border-green-500/30 text-green-400",
    bg: "from-green-600/20",
  },
  5: {
    label: "Excellent",
    emoji: "🤩",
    className: "border-amber-500/30 text-amber-400",
    bg: "from-amber-600/20",
  },
};

const FeedbackModal = ({ isOpen, onClose, interview, onSubmit }) => {
  const [errorMsg, setErrorMsg] = useState("");

  // Submit feedback API request
  const { request: submitFeedback, loading: submitting } = useApi(
    `${API_ENDPOINTS.INTERVIEWS.BASE}/${interview?._id}/feedback`,
    "POST"
  );

  // Form handling with validation
  const { values, errors, touched, handleChange, handleSubmit, resetForm } =
    useForm(
      { rating: 0, comment: "" },
      async (formData) => {
        try {
          setErrorMsg("");
          await submitFeedback(formData);
          resetForm();
          onSubmit?.();
          onClose();
        } catch (err) {
          setErrorMsg(err?.message || "Error submitting feedback");
        }
      },
      (values) => {
        const newErrors = {};
        if (!values.rating) {
          newErrors.rating = "Please select a rating";
        }
        return newErrors;
      }
    );

  const rating = RATING_CONFIG[values.rating];

  return (
    <Modal
      isOpen={isOpen}
      title="Rate Your Interview"
      onClose={() => {
        onClose();
        resetForm();
      }}
      onConfirm={handleSubmit}
      loading={submitting}
      confirmText="Submit Feedback"
    >
      <div className="space-y-6">
        {/* ERROR ALERT */}
        {errorMsg && (
          <Alert
            type="error"
            message={errorMsg}
            onClose={() => setErrorMsg("")}
          />
        )}

        {/* RATING DISPLAY */}
        {rating && (
          <div
            className={`rounded-2xl border ${rating.className} bg-linear-to-br ${rating.bg} to-transparent p-6 flex items-center justify-between`}
          >
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-60">
                Overall rating
              </p>
              <p className="font-serif text-3xl text-stone-100">
                {rating.label}
              </p>
            </div>
            <span className="text-4xl">{rating.emoji}</span>
          </div>
        )}

        {/* RATING STARS */}
        <div>
          <p className="text-sm font-semibold text-stone-100 mb-4">
            How was your interview?
          </p>
          <div className="flex gap-3 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() =>
                  handleChange({ target: { name: "rating", value: star } })
                }
                className={`text-5xl transition-all transform duration-200 ${
                  star <= values.rating
                    ? "scale-125"
                    : "scale-100 hover:scale-110"
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        {/* COMMENT TEXTAREA */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={13} className="text-amber-400" />
            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
              Comments
            </label>
          </div>
          <textarea
            name="comment"
            value={values.comment}
            onChange={handleChange}
            placeholder="Share your experience..."
            maxLength={500}
            rows={4}
            className="w-full px-4 py-2.5 bg-[#141417] border border-white/8 rounded-lg text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all resize-none text-sm"
          />
          <p className="text-right text-xs text-stone-600 mt-1">
            {values.comment.length}/500
          </p>
        </div>

        {touched.rating && errors.rating && (
          <Alert type="error" message={errors.rating} />
        )}
      </div>
    </Modal>
  );
};

export default FeedbackModal;
