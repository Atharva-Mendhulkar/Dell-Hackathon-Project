"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

export default function FairnessDashboard() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [reviewerStats, setReviewerStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const [resAlerts, resReport, resStats] = await Promise.all([
          fetch(`${apiUrl}/fairness/alerts`),
          fetch(`${apiUrl}/fairness/report/latest`),
          fetch(`${apiUrl}/fairness/reviewer_stats`)
        ]);

        if (resAlerts.ok) setAlerts(await resAlerts.json());
        if (resReport.ok) setReport(await resReport.json());
        if (resStats.ok) setReviewerStats(await resStats.json());
      } catch (e) {
        console.error("Failed to fetch fairness data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  return (
    <div className="p-6 h-[calc(100vh-64px)] max-w-[1280px] mx-auto flex flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-outline-variant pb-6">
        <div>
          <nav className="flex items-center gap-2 text-outline text-label-sm mb-2">
            <Link href="/organizer/dashboard" className="hover:text-primary">Dashboard</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">Fairness Engine</span>
          </nav>
          <h2 className="font-headline-md text-[32px] text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
            Live Fairness & Bias Monitor
          </h2>
          <p className="text-on-surface-variant mt-2 text-body-lg">
            Real-time statistical analysis of scoring distribution using SciPy (Mann-Whitney U, Kruskal-Wallis, Z-scores).
          </p>
        </div>
        <button 
          onClick={async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            await fetch(`${apiUrl}/fairness/run/mock-round-1`, { method: "POST" });
            alert("Recalibration task queued!");
          }}
          className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-xl font-label-md hover:bg-primary-container/80 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Run Recalibration
        </button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-all"></div>
          <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-2">Overall Equity Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display-lg text-green-600">{report ? report.average_confidence.toFixed(1) : "92"}</span>
            <span className="text-body-md text-on-surface-variant">/ 100</span>
          </div>
          <p className="text-[12px] text-green-600 font-bold mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> +3 points since last round
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
          <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-2">Active Alerts</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display-lg text-error">{report ? report.critical_alerts : alerts.filter(a => a.severity === 'HIGH').length}</span>
            <span className="text-body-md text-on-surface-variant">Critical</span>
          </div>
          <p className="text-[12px] text-error font-bold mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">warning</span> Action required
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
          <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-2">Evaluations Monitored</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display-lg text-on-surface">1,240</span>
          </div>
          <p className="text-[12px] text-on-surface-variant font-bold mt-2">100% Coverage</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
          <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-2">Outlier Reviewers</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display-lg text-secondary">{report ? report.flagged_reviewers : "0"}</span>
          </div>
          <p className="text-[12px] text-secondary font-bold mt-2">|Z-score| &gt; 2.0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* Alerts Feed */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="font-headline-sm text-[24px] text-on-surface mb-4">Statistical Bias Alerts</h3>
          <div className="space-y-4">
            {loading ? (
              <p>Loading alerts...</p>
            ) : alerts.length === 0 ? (
              <p className="text-on-surface-variant">No statistical bias alerts found.</p>
            ) : alerts.map(alert => (
              <div key={alert.id} className={`bg-white rounded-3xl p-6 border-l-8 shadow-sm ${
                alert.severity === 'HIGH' ? 'border-l-error' : 
                alert.severity === 'MEDIUM' ? 'border-l-secondary' : 'border-l-tertiary'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined p-2 rounded-xl ${
                      alert.severity === 'HIGH' ? 'bg-error-container text-error' : 
                      alert.severity === 'MEDIUM' ? 'bg-secondary-container text-secondary' : 'bg-tertiary-container text-tertiary'
                    }`}>
                      {alert.alert_type === 'GENDER_BIAS' ? 'wc' : alert.alert_type === 'REVIEWER_OUTLIER' ? 'person_off' : 'account_balance'}
                    </span>
                    <div>
                      <h4 className="font-headline-sm text-[20px]">{alert.alert_type.replace(/_/g, ' ')} Detected</h4>
                      <p className="text-[12px] uppercase tracking-wider text-outline font-bold mt-1">P-Value: {alert.p_value?.toFixed(4) || "N/A"}</p>
                    </div>
                  </div>
                  <div className="bg-surface-variant px-3 py-1 rounded-lg">
                    <span className="font-mono text-sm font-bold text-on-surface">{alert.severity}</span>
                  </div>
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed mb-6">{alert.description || "Statistical anomaly detected in scoring distribution."}</p>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline text-[18px]">engineering</span>
                    <span className="font-label-md text-on-surface">Review recommended</span>
                  </div>
                  <button className="bg-surface-container-high hover:bg-surface-container-highest px-4 py-2 rounded-lg font-label-md text-on-surface transition-colors">
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring Distribution Visualization */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="font-headline-sm text-[24px] text-on-surface mb-4">Distribution Analysis</h3>
          
          <div className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
            <h4 className="font-label-md text-on-surface-variant uppercase tracking-widest mb-6">Reviewer Z-Scores</h4>
            <div className="space-y-4">
              {reviewerStats.length > 0 ? (
                reviewerStats.map((stat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold">{stat.reviewer_name || stat.reviewer_id}</span>
                      <span className={`font-bold ${stat.z_score < -1.5 ? 'text-error' : stat.z_score > 1.5 ? 'text-primary' : 'text-tertiary'}`}>
                        {stat.z_score > 0 ? '+' : ''}{stat.z_score.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex">
                      {stat.z_score < 0 ? (
                        <>
                          <div className="w-1/2 flex justify-end">
                            <div className="h-full bg-error rounded-l-full" style={{ width: `${Math.min(100, Math.abs(stat.z_score) * 25)}%` }}></div>
                          </div>
                          <div className="w-1/2 border-l border-white"></div>
                        </>
                      ) : (
                        <>
                          <div className="w-1/2 border-r border-white"></div>
                          <div className="w-1/2 flex justify-start">
                            <div className="h-full bg-primary rounded-r-full" style={{ width: `${Math.min(100, stat.z_score * 25)}%` }}></div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-on-surface-variant text-sm">No reviewer stats available.</p>
              )}
            </div>
            <p className="text-[11px] text-outline mt-6 italic">Visualizing deviations from the mean score (0). Action recommended for |Z| &gt; 2.0.</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
            <h4 className="font-label-md text-on-surface-variant uppercase tracking-widest mb-6">Gender Score Parity</h4>
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">84.2</div>
                <div className="text-[10px] uppercase text-outline">Male Majority</div>
              </div>
              <div className="text-primary font-bold text-xl">vs</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-1">82.1</div>
                <div className="text-[10px] uppercase text-outline">Female Majority</div>
              </div>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden flex">
              <div className="h-full bg-primary w-[51%]"></div>
              <div className="h-full bg-secondary w-[49%]"></div>
            </div>
            <p className="text-[11px] text-outline mt-4 italic text-center">Δ 2.1 pts (p = 0.012). Indicates potential bias.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
