"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AuditDashboard() {
  const [auditResult, setAuditResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/audit/verify`);
      if (res.ok) {
        setAuditResult(await res.json());
      } else {
        const err = await res.json();
        setAuditResult(err.detail || err);
      }
    } catch (e) {
      console.error("Failed to fetch audit data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  return (
    <div className="p-6 h-[calc(100vh-64px)] max-w-[1280px] mx-auto flex flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-outline-variant pb-6">
        <div>
          <nav className="flex items-center gap-2 text-outline text-label-sm mb-2">
            <Link href="/organizer/dashboard" className="hover:text-primary">Dashboard</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">Audit Trail</span>
          </nav>
          <h2 className="font-headline-md text-[32px] text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            Cryptographic Audit Chain
          </h2>
          <p className="text-on-surface-variant mt-2 text-body-lg">
            Immutable log of all system state changes secured via SHA-256 Merkle chain.
          </p>
        </div>
        <button 
          onClick={fetchAudit}
          className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-xl font-label-md hover:bg-primary-container/80 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Verify Chain Integrity
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
          <p className="text-on-surface-variant font-medium">Verifying SHA-256 Hash Chain...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Integrity Status Card */}
          <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-6 ${
            auditResult?.valid ? "bg-green-500/10 border-green-500/30" : "bg-error-container/50 border-error/30"
          }`}>
            <span className={`material-symbols-outlined text-[48px] ${auditResult?.valid ? "text-green-600" : "text-error"}`}>
              {auditResult?.valid ? "verified_user" : "gpp_bad"}
            </span>
            <div>
              <h3 className={`font-headline-sm text-[24px] ${auditResult?.valid ? "text-green-700" : "text-error"}`}>
                {auditResult?.valid ? "Chain Intact and Verified" : "Chain Integrity Compromised!"}
              </h3>
              <p className="text-body-lg text-on-surface-variant mt-1">
                {auditResult?.message}
              </p>
              {!auditResult?.valid && auditResult?.broken_at_id && (
                <p className="text-label-md text-error font-bold mt-2">
                  Hash mismatch detected at log ID: {auditResult.broken_at_id}
                </p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
            <h4 className="font-label-md text-on-surface-variant uppercase tracking-widest mb-4">Chain Verification Details</h4>
            <div className="bg-surface-container-highest p-4 rounded-xl font-mono text-sm text-on-surface overflow-x-auto">
              <pre>{JSON.stringify(auditResult, null, 2)}</pre>
            </div>
            <p className="text-[12px] text-outline mt-4 italic">
              Verification recomputes `SHA256(prev_hash + payload)` for every log entry sequentially from the Genesis Block to ensure zero tampering.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
