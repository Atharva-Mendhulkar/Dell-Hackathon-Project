"use client";

export default function HackathonEvaluations() {
  return (
    <div className="p-8 max-w-[1280px] mx-auto min-h-screen flex flex-col lg:flex-row gap-6">
      {/* Center Column (Main Dashboard Content) */}
      <div className="w-full space-y-12">
        {/* Section Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-headline-md text-[48px] font-bold text-primary leading-tight">Evaluation Intelligence</h3>
            <p className="text-[18px] text-on-surface-variant mt-2 max-w-2xl font-medium">Track review progress, team scores, and judging insights across all submissions.</p>
          </div>
          <button 
            onClick={async () => {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
              const pathParts = window.location.pathname.split('/');
              const hackathonId = pathParts[3] || "mock-hackathon";
              await fetch(`${apiUrl}/evaluations/compute-results/${hackathonId}`, { method: "POST" });
              alert("Result computation task queued!");
            }}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold font-label-md hover:bg-primary/90 transition-colors shadow-md"
          >
            Compute Final Results
          </button>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/30">
            <p className="text-[12px] font-bold text-outline uppercase">Completed</p>
            <p className="font-headline-sm text-[24px] font-bold text-primary mt-1">84<span className="text-[14px] text-outline font-medium">/112</span></p>
            <div className="w-full bg-surface-variant h-1 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary h-full" style={{ width: "75%" }}></div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/30">
            <p className="text-[12px] font-bold text-outline uppercase">Pending</p>
            <p className="font-headline-sm text-[24px] font-bold text-secondary mt-1">28</p>
            <p className="text-[10px] font-medium text-secondary/60 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">schedule</span> Awaiting Review
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/30">
            <p className="text-[12px] font-bold text-outline uppercase">Avg Score</p>
            <p className="font-headline-sm text-[24px] font-bold text-primary mt-1">8.4</p>
            <p className="text-[10px] font-medium text-primary/60 mt-1">Benchmark: 7.2</p>
          </div>
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/30">
            <p className="text-[12px] font-bold text-outline uppercase">Highest</p>
            <p className="font-headline-sm text-[24px] font-bold text-primary mt-1">9.7</p>

            <p className="text-[10px] font-medium text-tertiary mt-1">Team EcoStream</p>
          </div>
        </div>
      {/* Ranking Panel */}
<div className="bg-white rounded-[32px] p-8 border border-outline-variant/50 shadow-sm w-full">
  <div className="flex items-center justify-between mb-6">
    <h4 className="font-headline-sm text-[20px] font-bold text-primary">
      Live Rankings
    </h4>

    <span className="text-[10px] bg-error text-on-error px-2 py-0.5 rounded-full font-bold animate-pulse">
      LIVE
    </span>
  </div>

  <div className="space-y-6">
    <div className="flex items-center gap-4 group cursor-pointer">
      <span className="text-[32px] font-bold text-primary/20 group-hover:text-primary transition-colors leading-none">
        01
      </span>

      <div className="flex-grow">
        <p className="font-bold text-[14px] text-on-surface">
          EcoStream
        </p>

        <div className="w-full bg-surface-variant h-1 rounded-full mt-1.5 overflow-hidden">
          <div
            className="bg-primary h-full"
            style={{ width: "97%" }}
          ></div>
        </div>
      </div>

      <span className="font-headline-sm text-[20px] font-bold text-primary leading-none">
        9.7
      </span>
    </div>

    <div className="flex items-center gap-4 group cursor-pointer">
      <span className="text-[32px] font-bold text-primary/20 group-hover:text-primary transition-colors leading-none">
        02
      </span>

      <div className="flex-grow">
        <p className="font-bold text-[14px] text-on-surface">
          HydroPulse
        </p>

        <div className="w-full bg-surface-variant h-1 rounded-full mt-1.5 overflow-hidden">
          <div
            className="bg-primary h-full"
            style={{ width: "96%" }}
          ></div>
        </div>
      </div>

      <span className="font-headline-sm text-[20px] font-bold text-primary leading-none">
        9.6
      </span>
    </div>

    <div className="flex items-center gap-4 group cursor-pointer">
      <span className="text-[32px] font-bold text-primary/20 group-hover:text-primary transition-colors leading-none">
        03
      </span>

      <div className="flex-grow">
        <p className="font-bold text-[14px] text-on-surface">
          TerraMind
        </p>

        <div className="w-full bg-surface-variant h-1 rounded-full mt-1.5 overflow-hidden">
          <div
            className="bg-primary h-full"
            style={{ width: "89%" }}
          ></div>
        </div>
      </div>

      <span className="font-headline-sm text-[20px] font-bold text-primary leading-none">
        8.9
      </span>
    </div>
  </div>
</div>

        {/* Featured Evaluation Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative overflow-hidden group bg-white rounded-[24px] p-4 shadow-sm border border-outline-variant/50 hover:shadow-md transition-shadow">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full"></div>
            <span className="material-symbols-outlined text-primary text-[32px] mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <h4 className="text-[14px] font-bold text-outline uppercase tracking-wider">Top Scoring Team</h4>
            <p className="font-headline-sm text-[24px] font-bold text-on-surface mt-2">Team EcoStream</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-[36px] font-bold text-primary leading-none">9.7</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[12px] font-bold">Overall Lead</span>
            </div>
          </div>
          <div className="relative overflow-hidden group bg-white rounded-[24px] p-4 shadow-sm border border-outline-variant/50 hover:shadow-md transition-shadow">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full"></div>
            <span className="material-symbols-outlined text-secondary text-[32px] mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            <h4 className="text-[14px] font-bold text-outline uppercase tracking-wider">Highest Innovation</h4>
            <p className="font-headline-sm text-[24px] font-bold text-on-surface mt-2">Team TerraMind</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-[36px] font-bold text-secondary leading-none">9.8</span>
              <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[12px] font-bold">Disruptor</span>
            </div>
          </div>
          <div className="relative overflow-hidden group bg-white rounded-[24px] p-4 shadow-sm border border-outline-variant/50 hover:shadow-md transition-shadow">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full"></div>
            <span className="material-symbols-outlined text-tertiary text-[32px] mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>code</span>
            <h4 className="text-[14px] font-bold text-outline uppercase tracking-wider">Best Technical</h4>
            <p className="font-headline-sm text-[24px] font-bold text-on-surface mt-2">Team HydroPulse</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-[36px] font-bold text-tertiary leading-none">9.6</span>
              <span className="px-3 py-1 bg-tertiary/10 text-tertiary rounded-full text-[12px] font-bold">Architectural</span>
            </div>
          </div>
        </div>
        {/* Rubric Breakdown */}
        <section className="bg-surface-variant/30 rounded-[32px] p-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h4 className="font-headline-sm text-[24px] font-bold text-primary">Rubric Weightage</h4>
              <p className="text-[14px] font-medium text-on-surface-variant mt-1">Standardized criteria for the 2024 Tech Bloom cohort.</p>
            </div>
            <button className="text-primary text-[14px] font-medium hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">edit_note</span> Customize Rubric
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-outline-variant/50">
              <p className="text-[12px] font-bold text-outline uppercase mb-1">Innovation</p>
              <p className="font-headline-sm text-[24px] font-bold text-primary leading-none">30%</p>
              <p className="text-[10px] font-medium text-on-surface-variant leading-tight mt-2">Novelty and original problem-solving approaches.</p>
            </div>
            <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-outline-variant/50">
              <p className="text-[12px] font-bold text-outline uppercase mb-1">Technical</p>
              <p className="font-headline-sm text-[24px] font-bold text-primary leading-none">30%</p>
              <p className="text-[10px] font-medium text-on-surface-variant leading-tight mt-2">Complexity, scalability, and code quality.</p>
            </div>
            <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-outline-variant/50">
              <p className="text-[12px] font-bold text-outline uppercase mb-1">Impact</p>
              <p className="font-headline-sm text-[24px] font-bold text-primary leading-none">20%</p>
              <p className="text-[10px] font-medium text-on-surface-variant leading-tight mt-2">Social or market reach and effectiveness.</p>
            </div>
            <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-outline-variant/50">
              <p className="text-[12px] font-bold text-outline uppercase mb-1">Feasibility</p>
              <p className="font-headline-sm text-[24px] font-bold text-primary leading-none">10%</p>
              <p className="text-[10px] font-medium text-on-surface-variant leading-tight mt-2">Business model and execution potential.</p>
            </div>
            <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-outline-variant/50">
              <p className="text-[12px] font-bold text-outline uppercase mb-1">Presentation</p>
              <p className="font-headline-sm text-[24px] font-bold text-primary leading-none">10%</p>
              <p className="text-[10px] font-medium text-on-surface-variant leading-tight mt-2">Visual clarity and pitching excellence.</p>
            </div>
          </div>
        </section>

        {/* Evaluation Table */}
        <div className="bg-white rounded-[32px] overflow-hidden border border-outline-variant/50 shadow-sm">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                <input className="pl-10 pr-4 py-2 bg-surface-variant/20 border-none rounded-full text-[14px] font-medium w-64 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Search teams or reviewers..." type="text"/>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant/50 rounded-full text-[14px] font-medium hover:bg-surface-variant/10 transition-colors">
                <span className="material-symbols-outlined text-[18px]">filter_list</span> Filters
              </button>
            </div>
            <button className="text-primary text-[14px] font-bold flex items-center gap-2 hover:underline">
              <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface-variant/10 text-outline text-[12px] font-bold uppercase tracking-wider border-b border-outline-variant/30">
                  <th className="px-6 py-4">Team</th>
                  <th className="px-6 py-4">Reviewer</th>
                  <th className="px-6 py-4">Scores (I/T/F/P)</th>
                  <th className="px-6 py-4">Final</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-[14px] text-on-surface">EcoStream</p>
                    <p className="text-[11px] font-medium text-outline truncate max-w-[150px] mt-1">Decentralized water filtration...</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary">AT</div>
                      <span className="text-[14px] font-medium">Dr. Aris Thorne</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 text-[12px] font-bold">
                      <span className="text-secondary">9.8</span>
                      <span className="text-primary">9.4</span>
                      <span className="text-primary">9.2</span>
                      <span className="text-primary">9.9</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-headline-sm text-[24px] font-bold text-primary leading-none">9.7</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full">Finalized</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="material-symbols-outlined text-outline hover:text-primary transition-colors mr-2 text-[20px]" title="View Full Feedback">comment</button>
                    <button className="material-symbols-outlined text-outline hover:text-primary transition-colors text-[20px]">more_vert</button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-[14px] text-on-surface">TerraMind</p>
                    <p className="text-[11px] font-medium text-outline truncate max-w-[150px] mt-1">AI-driven reforestation...</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container">SJ</div>
                      <span className="text-[14px] font-medium">Sarah Jenkins</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 text-[12px] font-bold">
                      <span className="text-secondary">9.8</span>
                      <span className="text-primary">8.2</span>
                      <span className="text-primary">7.5</span>
                      <span className="text-primary">8.8</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-headline-sm text-[24px] font-bold text-on-surface leading-none">8.9</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-tertiary-container/30 text-tertiary text-[10px] font-bold uppercase rounded-full">In Progress</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="material-symbols-outlined text-outline hover:text-primary transition-colors mr-2 text-[20px]" title="View Full Feedback">comment</button>
                    <button className="material-symbols-outlined text-outline hover:text-primary transition-colors text-[20px]">more_vert</button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-[14px] text-on-surface">UrbanGrid</p>
                    <p className="text-[11px] font-medium text-outline truncate max-w-[150px] mt-1">Smart city energy sharing...</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-[10px] font-bold text-outline">MC</div>
                      <span className="text-[14px] font-medium">Mark Chen</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-outline-variant italic text-[12px] font-bold">
                    Scores pending...
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-headline-sm text-[24px] font-bold text-outline leading-none">—</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-secondary-container/30 text-secondary text-[10px] font-bold uppercase rounded-full">Pending</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="material-symbols-outlined text-outline hover:text-primary transition-colors mr-2 text-[20px]" title="View Full Feedback">comment</button>
                    <button className="material-symbols-outlined text-outline hover:text-primary transition-colors text-[20px]">more_vert</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/30 flex justify-center">
            <button className="text-[14px] text-primary font-bold hover:underline">View All 112 Teams</button>
          </div>
        </div>
      </div>

      {/* Right Sidebar (Insights/Ranking) */}
      
    </div>
  );
}
