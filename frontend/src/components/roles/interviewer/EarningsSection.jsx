import React, { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useForm } from "../../hooks/useForm";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Input, Select } from "../ui/Form";
import {
  PLATFORM_FEE,
  CREDIT_TO_USDRATE,
  PAYMENT_METHODS,
  API_ENDPOINTS,
} from "../../constants/api";
import { Wallet, TrendingUp, CheckCircle2 } from "lucide-react";

const EarningsSection = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [done, setDone] = useState(false);

  // Fetch user stats
  const { data: stats, request: fetchStats, loading: statsLoading } = useApi(
    API_ENDPOINTS.USER.PROFILE,
    "GET",
    { creditBalance: 0, totalEarned: 0, completedSessions: 0 }
  );

  // Submit withdrawal request
  const { request: submitWithdrawal, loading: withdrawalLoading } = useApi(
    API_ENDPOINTS.PAYOUTS.REQUEST,
    "POST"
  );

  // Withdrawal form handling
  const { values, errors, touched, handleChange, handleSubmit, resetForm } =
    useForm(
      { paymentMethod: "PAYPAL", paymentDetail: "" },
      async (formData) => {
        try {
          await submitWithdrawal(formData);
          setDone(true);
          setSuccessMsg(
            "Withdrawal request submitted! Admin will review and approve soon."
          );
          setTimeout(() => {
            setOpenDialog(false);
            setTimeout(() => {
              setDone(false);
              resetForm();
            }, 300);
          }, 2000);
          await fetchStats();
        } catch (err) {
          throw err;
        }
      },
      (values) => {
        const newErrors = {};
        if (!values.paymentDetail?.trim()) {
          newErrors.paymentDetail = "Payment details are required";
        }
        return newErrors;
      }
    );

  useEffect(() => {
    fetchStats();
  }, []);

  const balance = (stats.creditBalance || 0) * CREDIT_TO_USDRATE;
  const totalEarnedDollars = (stats.totalEarned || 0) * CREDIT_TO_USDRATE;
  const feeAmount = (balance * PLATFORM_FEE).toFixed(2);
  const netAmount = (balance * (1 - PLATFORM_FEE)).toFixed(2);

  return (
    <section className="flex flex-col gap-6">
      {/* SUCCESS ALERT */}
      {successMsg && (
        <Alert
          type="success"
          message={successMsg}
          onClose={() => setSuccessMsg("")}
        />
      )}

      {/* STATS ROW - 3 COLUMN GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Credit Balance */}
        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
          <span className="text-lg">
            <Wallet size={16} className="text-amber-400" />
          </span>
          <p className="font-serif text-4xl leading-none tracking-tight bg-linear-to-br from-amber-300 to-amber-500 bg-clip-text text-transparent">
            {stats.creditBalance ?? 0}
          </p>
          <p className="text-xs text-stone-600">credits</p>
          <p className="text-xs text-stone-500">
            Credit balance (${balance.toFixed(2)})
          </p>
        </div>

        {/* Total Earned */}
        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
          <span className="text-lg">
            <TrendingUp size={16} className="text-stone-400" />
          </span>
          <p className="font-serif text-4xl leading-none tracking-tight text-stone-100">
            {stats.totalEarned ?? 0}
          </p>
          <p className="text-xs text-stone-600">credits</p>
          <p className="text-xs text-stone-500">
            Total earned (${totalEarnedDollars.toFixed(2)})
          </p>
        </div>

        {/* Sessions Completed */}
        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
          <span className="text-lg">
            <CheckCircle2 size={16} className="text-stone-400" />
          </span>
          <p className="font-serif text-4xl leading-none tracking-tight text-stone-100">
            {stats.completedSessions ?? 0}
          </p>
          <p className="text-xs text-stone-600">completed</p>
          <p className="text-xs text-stone-500">Sessions done</p>
        </div>
      </div>

      {/* WITHDRAWAL TRIGGER CARD */}
      <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl tracking-tight text-stone-100">
            Withdraw earnings
          </h2>
          <p className="text-xs text-stone-500 font-light mt-1">
            20% platform fee applies. Processed within 2–3 business days.
          </p>
        </div>
        <Button
          variant="default"
          disabled={balance <= 0}
          onClick={() => setOpenDialog(true)}
          className="shrink-0 whitespace-nowrap"
        >
          Request withdrawal
        </Button>
      </div>

      {/* WITHDRAWAL DIALOG */}
      <Modal
        isOpen={openDialog}
        title={done ? "Request submitted" : "Request withdrawal"}
        onClose={() => {
          if (!done && !withdrawalLoading) {
            setOpenDialog(false);
            resetForm();
          }
        }}
        onConfirm={done ? () => { } : handleSubmit}
        loading={withdrawalLoading}
        confirmText="Confirm withdrawal"
      >
        {done ? (
          <div className="py-8 text-center flex flex-col items-center gap-4">
            <span className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl">
              ✓
            </span>
            <p className="font-serif text-xl text-stone-100">
              Request submitted
            </p>
            <p className="text-xs text-stone-500 font-light">
              We'll process your withdrawal within 2–3 business days.
            </p>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* FEE BREAKDOWN */}
            <div className="rounded-xl bg-[#141417] border border-white/8 p-4 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-stone-500">
                <span>Balance (1 Cr = ${CREDIT_TO_USDRATE})</span>
                <span className="text-green-400">${balance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-500">
                <span>Platform fee (20%)</span>
                <span className="text-red-400">− ${feeAmount}</span>
              </div>
              <div className="border-t border-white/8 pt-2 flex justify-between text-sm font-medium">
                <span className="text-stone-300">You receive</span>
                <span className="text-amber-400">${netAmount}</span>
              </div>
            </div>

            {/* PAYMENT METHOD - TABS STYLE */}
            <div className="flex flex-col gap-2">
              <label className="text-stone-400 text-xs font-medium">
                Payment method
              </label>
              <div className="flex gap-2 bg-[#141417] border border-white/10 rounded-lg p-1">
                {[
                  { value: "PAYPAL", label: "PayPal" },
                  { value: "BANK", label: "Bank Transfer" },
                ].map((m) => (
                  <button
                    key={m.value}
                    onClick={() => {
                      handleChange({
                        target: { name: "paymentMethod", value: m.value },
                      });
                      handleChange({ target: { name: "paymentDetail", value: "" } });
                    }}
                    className={`flex-1 text-xs py-2 px-3 rounded transition-all ${
                      values.paymentMethod === m.value
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "text-stone-400 hover:text-stone-300"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PAYMENT DETAIL INPUT */}
            <div className="flex flex-col gap-2">
              <label className="text-stone-400 text-xs font-medium">
                {values.paymentMethod === "PAYPAL"
                  ? "PayPal email"
                  : "Bank account"}
              </label>
              <Input
                name="paymentDetail"
                type="text"
                placeholder={
                  values.paymentMethod === "PAYPAL"
                    ? "your@paypal.com"
                    : "Account / routing info"
                }
                value={values.paymentDetail}
                onChange={handleChange}
                error={touched.paymentDetail && errors.paymentDetail}
              />
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default EarningsSection;
