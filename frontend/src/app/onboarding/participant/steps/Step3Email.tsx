"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import StepWrapper from "@/components/onboarding/StepWrapper";
import { ArrowRight, Mail, CheckCircle2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";

type OTPState = "idle" | "sending" | "sent" | "verifying" | "verified";

export default function Step3Email() {
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email");
  const { email, updateData, nextStep } = useOnboardingStore();
  const [localEmail, setLocalEmail] = useState(email || urlEmail || "");
  const [otpState, setOtpState] = useState<OTPState>("sent");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (urlEmail && !email) {
      updateData({ email: urlEmail });
    }
  }, [urlEmail, email, updateData]);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setLocalEmail(user.email);
        updateData({ email: user.email });
      }
    };
    if (!localEmail) {
      fetchUser();
    }
  }, [localEmail, updateData]);

  useEffect(() => {
    // Focus the first OTP input after render
    if (otpState === "sent") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [otpState]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]; // only take last char
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto advance
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify when complete
    if (index === 5 && value !== "" && newOtp.every(v => v !== "")) {
      setOtpState("verifying");
      setTimeout(() => {
        setOtpState("verified");
        updateData({ emailVerified: true });
        setTimeout(() => {
          nextStep();
        }, 1500); // Wait for success animation
      }, 2000);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <StepWrapper>
      <div className="text-center mb-10">
        <h1 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight">Verify your email</h1>
        <p className="text-on-surface-variant text-[16px]">We'll use this for announcements and updates.</p>
      </div>

      <AnimatePresence mode="wait">
        {otpState === "verifying" || otpState === "verified" || otpState === "sent" ? (
          <motion.div
            key="otp-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex justify-center gap-3 md:gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={otpState === "verifying" || otpState === "verified"}
                  className="w-12 h-14 md:w-14 md:h-16 bg-surface-container-low border border-outline-variant/30 rounded-xl text-center text-[24px] font-bold text-primary focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all disabled:opacity-50"
                  maxLength={1}
                />
              ))}
            </div>

            <div className="h-12 flex items-center justify-center">
              {otpState === "verifying" && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-primary font-medium"
                >
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Verifying code...
                </motion.div>
              )}
              {otpState === "verified" && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-green-600 font-bold"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  Verified successfully!
                </motion.div>
              )}
              {otpState === "sent" && (
                <p className="text-[13px] text-on-surface-variant font-medium">
                  Code sent to <span className="text-on-surface font-bold">{localEmail || "your email"}</span>
                </p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </StepWrapper>
  );
}
