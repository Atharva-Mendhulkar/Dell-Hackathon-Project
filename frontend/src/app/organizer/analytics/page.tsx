"use client";

import { useEffect } from "react";

export default function OrganizerAnalytics() {
  useEffect(() => {
    // Micro-interactions for hovering metric cards
    document.querySelectorAll('.bento-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        (card as HTMLElement).style.transform = 'translateY(-4px) scale(1.01)';
        (card as HTMLElement).style.boxShadow = '0 20px 40px -10px rgba(214, 203, 191, 0.5)';
      });
      card.addEventListener('mouseleave', () => {
        (card as HTMLElement).style.transform = 'translateY(0) scale(1)';
        (card as HTMLElement).style.boxShadow = '0 10px 30px -5px rgba(214, 203, 191, 0.3)';
      });
    });

    // Simple animation for progress bars on load
    const bars = document.querySelectorAll('.bg-primary, .bg-tertiary');
    bars.forEach(bar => {
      const el = bar as HTMLElement;
      const width = el.style.width;
      el.style.width = '0';
      setTimeout(() => {
        el.style.transition = 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.width = width;
      }, 200);
    });
  }, []);

  return (
    <div className="p-12 min-h-screen">
      <style jsx>{`
        .bento-card {
            background: #ffffff;
            border-radius: 24px;
            padding: 32px;
            box-shadow: 0 10px 30px -5px rgba(214, 203, 191, 0.3); /* Warm Stone tint shadow */
            transition: transform 0.2s ease;
        }
      `}</style>
      
      <div className="max-w-[1280px] mx-auto space-y-12">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h2 className="font-display-lg text-[48px] text-primary">Performance Analytics</h2>
          <p className="font-body-lg text-[18px] text-on-surface-variant max-w-2xl">A curated overview of engagement, efficiency, and progress for the Winter 2024 Bloom event cycle.</p>
        </div>

        {/* Metric Cards (Top Row) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="bento-card flex flex-col justify-between !p-6">
            <span className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wider">Registration Growth</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-headline-md text-[32px] text-on-surface">+12%</span>
              <span className="text-primary text-[12px] font-bold">MoM</span>
            </div>
          </div>
          <div className="bento-card flex flex-col justify-between !p-6">
            <span className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wider">Team Formation</span>
            <div className="mt-2">
              <span className="font-headline-md text-[32px] text-on-surface">88%</span>
            </div>
          </div>
          <div className="bento-card flex flex-col justify-between !p-6">
            <span className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wider">Submission Rate</span>
            <div className="mt-2">
              <span className="font-headline-md text-[32px] text-on-surface">72%</span>
            </div>
          </div>
          <div className="bento-card flex flex-col justify-between !p-6">
            <span className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wider">Eval. Completion</span>
            <div className="mt-2">
              <span className="font-headline-md text-[32px] text-on-surface">84%</span>
            </div>
          </div>
          <div className="bento-card flex flex-col justify-between !p-6">
            <span className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wider">Reviewer Efficiency</span>
            <div className="mt-2">
              <span className="font-headline-md text-[32px] text-on-surface">1.2d</span>
              <span className="text-on-surface-variant text-[12px]">avg</span>
            </div>
          </div>
          <div className="bento-card flex flex-col justify-between !p-6">
            <span className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wider">Duplicates</span>
            <div className="mt-2">
              <span className="font-headline-md text-[32px] text-on-surface">3.4%</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Detailed Charts */}
          <div className="col-span-12 space-y-6">
            {/* Registration & Team Funnels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bento-card relative overflow-hidden h-[400px]">
                <h3 className="font-headline-sm text-[24px] text-primary mb-8">Registration Funnel</h3>
                <div className="flex flex-col gap-4">
                  <div className="w-full flex items-center">
                    <div className="w-full bg-primary-container/10 h-10 rounded-full flex items-center px-4 justify-between border border-primary-container/20">
                      <span className="font-label-md text-[14px] font-semibold">Registered</span>
                      <span className="font-label-md">1,240</span>
                    </div>
                  </div>
                  <div className="w-[85%] flex items-center mx-auto">
                    <div className="w-full bg-primary-container/20 h-10 rounded-full flex items-center px-4 justify-between border border-primary-container/30">
                      <span className="font-label-md text-[14px] font-semibold">Approved</span>
                      <span className="font-label-md">860</span>
                    </div>
                  </div>
                  <div className="w-[70%] flex items-center mx-auto">
                    <div className="w-full bg-primary-container/40 h-10 rounded-full flex items-center px-4 justify-between border border-primary-container/50">
                      <span className="font-label-md text-[14px] font-semibold">Teamed</span>
                      <span className="font-label-md">720</span>
                    </div>
                  </div>
                  <div className="w-[55%] flex items-center mx-auto">
                    <div className="w-full bg-[#5B6EF5]/30 h-10 rounded-full flex items-center px-4 justify-between border border-[#5B6EF5]/40">
                      <span className="font-label-md text-[14px] font-semibold text-tertiary">Submitted</span>
                      <span className="font-label-md text-tertiary">580</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 opacity-20">
                  <span className="material-symbols-outlined text-[80px]">filter_alt</span>
                </div>
              </div>
              <div className="bento-card h-[400px]">
                <h3 className="font-headline-sm text-[24px] text-primary mb-8">Team Formation</h3>
                <div className="flex justify-center items-center h-48 relative">
                  {/* Donut Chart Mock */}
                  <div className="w-40 h-40 rounded-full border-[16px] border-primary-container/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-[16px] border-tertiary border-t-transparent border-l-transparent rotate-45"></div>
                    <div className="text-center">
                      <span className="block font-headline-md text-[32px]">720</span>
                      <span className="block font-label-sm text-[12px] text-on-surface-variant">Active Teams</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 space-y-2">
                  <div className="flex justify-between font-label-md text-[14px]">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-tertiary"></span> Complete Teams</span>
                    <span>542</span>
                  </div>
                  <div className="flex justify-between font-label-md text-[14px]">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary-container"></span> Pending Members</span>
                    <span>178</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Timeline */}
            <div className="bento-card h-[350px]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-headline-sm text-[24px] text-primary">Submission Timeline</h3>
                <div className="flex gap-2 font-label-sm text-[12px] uppercase tracking-wider text-on-surface-variant">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> 2024</span>
                  <span className="flex items-center gap-1 opacity-40"><span className="w-2 h-2 rounded-full bg-outline"></span> 2023</span>
                </div>
              </div>
              <div className="w-full h-40 flex items-end gap-2 px-2 border-b border-outline-variant/30 relative">
                {/* Visual placeholder for a line chart */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 160">
                  <path d="M0,140 Q100,130 200,100 T400,110 T600,60 T800,20" fill="none" stroke="#5B6EF5" strokeWidth="3"></path>
                  <path d="M0,150 Q100,140 200,130 T400,140 T600,100 T800,70" fill="none" stroke="#97B3AE" strokeDasharray="4" strokeWidth="2"></path>
                </svg>
              </div>
              <div className="flex justify-between mt-4 font-label-sm text-[12px] text-on-surface-variant">
                <span>Nov 01</span>
                <span>Nov 07</span>
                <span>Nov 14</span>
                <span>Nov 21</span>
                <span>Nov 28</span>
                <span>Dec 04</span>
              </div>
            </div>

            {/* Problem Statement & Score Dist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bento-card">
                <h3 className="font-headline-sm text-[24px] text-primary mb-6">Track Popularity</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 font-label-md text-[14px]">
                      <span>Sustainability</span>
                      <span>42%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 font-label-md text-[14px]">
                      <span>AI Ethics</span>
                      <span>28%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 font-label-md text-[14px]">
                      <span>Urban Mobility</span>
                      <span>18%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '18%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 font-label-md text-[14px]">
                      <span>Fintech Inclusion</span>
                      <span>12%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '12%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bento-card">
                <h3 className="font-headline-sm text-[24px] text-primary mb-6">Score Frequency</h3>
                <div className="flex items-end justify-between h-40 gap-1">
                  <div className="bg-primary-container/20 w-full h-[10%] rounded-t-sm"></div>
                  <div className="bg-primary-container/20 w-full h-[15%] rounded-t-sm"></div>
                  <div className="bg-primary-container/30 w-full h-[25%] rounded-t-sm"></div>
                  <div className="bg-primary-container/40 w-full h-[40%] rounded-t-sm"></div>
                  <div className="bg-primary-container/60 w-full h-[70%] rounded-t-sm"></div>
                  <div className="bg-primary w-full h-[95%] rounded-t-sm"></div>
                  <div className="bg-primary-container/60 w-full h-[60%] rounded-t-sm"></div>
                  <div className="bg-primary-container/40 w-full h-[30%] rounded-t-sm"></div>
                  <div className="bg-primary-container/20 w-full h-[10%] rounded-t-sm"></div>
                  <div className="bg-primary-container/10 w-full h-[5%] rounded-t-sm"></div>
                </div>
                <div className="flex justify-between mt-4 font-label-sm text-[12px] text-on-surface-variant">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Insights Panel */}
       
        </div>
      </div>
    </div>
  );
}
