"use client";

import Link from "next/link";

export default function JoinTeam() {
  return (
    <div className="flex max-w-[1280px] mx-auto">
      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-margin-desktop bg-background min-h-[calc(100vh-80px)]">
        <div className="flex flex-col gap-stack-lg">
          {/* Hero Section */}
          <header>
            <h1 className="font-display-lg text-[32px] md:text-[48px] mb-2">Find Your Perfect Squad</h1>
            <p className="text-body-lg text-on-surface-variant max-w-2xl">Our AI analyzes your unique skill set to match you with teams tackling the world's most pressing sustainability and biotech challenges.</p>
          </header>

          {/* Metrics Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-[0_20px_30px_-10px_rgba(214,203,191,0.3)] border border-surface-container-highest">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-widest">Available Teams</span>
              <div className="text-[32px] font-headline-md mt-1">124</div>
            </div>
            <div className="bg-primary-container/20 p-6 rounded-3xl shadow-[0_20px_30px_-10px_rgba(214,203,191,0.3)] border border-primary/10">
              <span className="text-label-sm text-primary uppercase tracking-widest">AI Recommended</span>
              <div className="text-[32px] font-headline-md mt-1 text-primary">8</div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-[0_20px_30px_-10px_rgba(214,203,191,0.3)] border border-surface-container-highest">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-widest">Open Roles</span>
              <div className="text-[32px] font-headline-md mt-1">42</div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-[0_20px_30px_-10px_rgba(214,203,191,0.3)] border border-surface-container-highest">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-widest">Requests Sent</span>
              <div className="text-[32px] font-headline-md mt-1">3</div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-6 rounded-[32px] border border-surface-container-highest flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-label-sm text-on-surface-variant px-1">Problem Statement & Skills</label>
              <input className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary/20" placeholder="e.g. Urban Tech, Carbon Sequestration, React" type="text" />
            </div>
            <div className="w-full md:w-48 space-y-2">
              <label className="text-label-sm text-on-surface-variant px-1">Domain</label>
              <select className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary/20 appearance-none">
                <option>All Domains</option>
                <option>Sustainability</option>
                <option>Biotech</option>
                <option>Urban Tech</option>
              </select>
            </div>
            <div className="w-full md:w-32 space-y-2">
              <label className="text-label-sm text-on-surface-variant px-1">Size</label>
              <select className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary/20 appearance-none">
                <option>Any</option>
                <option>1-2</option>
                <option>3-4</option>
              </select>
            </div>
            <button className="bg-primary text-white h-12 px-8 rounded-2xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
              Find Teams
            </button>
          </div>

          {/* AI Recommended Teams Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-sm text-[24px] flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                Recommended for You
              </h2>
              <button className="text-primary font-medium hover:underline">View all recommendations</button>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Recommendation Card 1 */}
              <div className="group relative bg-white rounded-[32px] overflow-hidden border border-surface-container-highest transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="h-32 bg-primary-container/10 flex items-end p-6">
                  <div className="flex justify-between w-full items-end">
                    <div className="bg-primary text-white px-3 py-1 rounded-full text-label-sm font-semibold">94% Match</div>
                    <div className="flex -space-x-3">
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-surface overflow-hidden"><img className="w-full h-full object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0I5bES7EVKiCPU2EmpgcJd70ISRMdvVld_IBntAT_YyPun6Wq_kUXgZL08Ow_7-4bw-p8Y-QWZ0-tT-yDZ65PoTbj2nOTE2TSdKJeQib_cOWwNJ-nVRw7OLzjbUqhpg2WCqwOOyoN5FbczWVUPb1Rx3a5w1eWD4It2znaHQVNLTKCjo01RR4ShhDgfAyBbtLy5UUY63sBD2Y__UeD5d_gSlVf2AblYqBXSdxXEd8gekOc_fj7V_K_nx7NDq7Rf86VJTxvwzWhoas" alt="Member 1" /></div>
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-surface overflow-hidden"><img className="w-full h-full object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCy6hLar6lVOcFsOiDN0W40PpfburCY8toVgMujwoyT-x1w9auzVkVjN7BVvJc8V665ZoVcMRvlH_-qrenXGlQN-rfcF-x4eVwry6uhkT9Btn-f0q8gKWs4hcm0cWiazxqXakf8Fikbq7NrFeuoZPGNoXkFnNxUAEsNq7PMlFNY5julvEMr4F99Er9RFO_ZVRJXKAWpynPlZk5eQRz_rRVoq0hKGAK-GDdQ92ud2gD3DhAKhNnTrtMYwv2nhiAYgNfwrOhksxnO0r8" alt="Member 2" /></div>
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container flex items-center justify-center text-label-sm">+1</div>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline-sm text-[24px]">EcoStream</h3>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded text-label-sm font-semibold">Strong Frontend Fit</span>
                    </div>
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">bookmark</button>
                  </div>
                  <p className="text-on-surface-variant text-body-md line-clamp-2">Real-time monitoring of urban water waste using IoT sensors and edge computing for smarter city management.</p>
                  <div className="space-y-3">
                    <div className="flex justify-between text-label-sm text-on-surface-variant">
                      <span>Team Skill Coverage</span>
                      <span className="font-bold">82%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '82%' }}></div>
                    </div>
                    <p className="text-label-sm text-primary font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Your skills complete this team's core skill gap.
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link href="/participant/teams/workspace" className="flex-1 flex justify-center py-3 px-4 rounded-2xl bg-primary text-white font-medium hover:opacity-90 transition-all">
                      Request to Join
                    </Link>
                    <button className="py-3 px-4 rounded-2xl border border-outline-variant hover:bg-surface-container-low transition-all">Details</button>
                  </div>
                </div>
              </div>

              {/* Recommendation Card 2 */}
              <div className="group relative bg-white rounded-[32px] overflow-hidden border border-surface-container-highest transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="h-32 bg-secondary-container/10 flex items-end p-6">
                  <div className="flex justify-between w-full items-end">
                    <div className="bg-secondary text-white px-3 py-1 rounded-full text-label-sm font-semibold">89% Match</div>
                    <div className="flex -space-x-3">
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-surface overflow-hidden"><img className="w-full h-full object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6PlgQ8YtslHkDDREyNvvNuAm9SvauOAzPxgyy-TpHnW8AVi9IQ7f_ELjgxbITJ6FKy3DaeOQ7cwrkxlY244RMzLotPGlbn5v1gXzk0C-sHfaR-CX8bbxAB3d4ZKHUEMbamCymNGyEZOWl2jpTbw1HwB-nL1Zi2fidEJoVAYFsf3cEmGEdQD9sVDlbGjZ_X4Lxm0YtmXf7UFXJ3CrSf_gZTqbYZ_V6_oQHR8AQzgQ9dG3qkMiIyTWe7Fh2mCxz5gorLhq0kA0j2ss" alt="Member 1" /></div>
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container flex items-center justify-center text-label-sm">+2</div>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline-sm text-[24px]">BioSynth AI</h3>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary-container text-on-primary-container rounded text-label-sm font-semibold">Domain Expert Required</span>
                    </div>
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">bookmark</button>
                  </div>
                  <p className="text-on-surface-variant text-body-md line-clamp-2">Using generative AI to accelerate the discovery of plastic-eating enzymes for industrial recycling.</p>
                  <div className="space-y-3">
                    <div className="flex justify-between text-label-sm text-on-surface-variant">
                      <span>Team Skill Coverage</span>
                      <span className="font-bold">65%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-label-sm text-secondary font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">info</span>
                      Team needs a strong Lead Developer to guide development.
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link href="/participant/teams/workspace" className="flex-1 flex justify-center py-3 px-4 rounded-2xl bg-primary text-white font-medium hover:opacity-90 transition-all">
                      Request to Join
                    </Link>
                    <button className="py-3 px-4 rounded-2xl border border-outline-variant hover:bg-surface-container-low transition-all">Details</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Available Teams List */}
          <section>
            <h2 className="font-headline-sm text-[24px] mb-6">Available Teams</h2>
            <div className="flex flex-col gap-6">
              {/* Team Item 1 */}
              <div className="bg-white p-6 rounded-[32px] border border-surface-container-highest hover:border-primary-container transition-all grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-3">
                  <h4 className="font-semibold text-body-lg">Urban Canopy</h4>
                  <p className="text-label-sm text-primary font-medium">Urban Tech</p>
                </div>
                <div className="md:col-span-4">
                  <p className="text-on-surface-variant text-label-md line-clamp-1">AI-driven rooftop garden optimization for heat island reduction.</p>
                  <div className="flex gap-1 mt-2">
                    <span className="px-2 py-0.5 bg-surface-container-low rounded-full text-[10px] uppercase tracking-tighter">Python</span>
                    <span className="px-2 py-0.5 bg-surface-container-low rounded-full text-[10px] uppercase tracking-tighter">React Native</span>
                    <span className="px-2 py-0.5 bg-surface-container-low rounded-full text-[10px] uppercase tracking-tighter">GIS</span>
                  </div>
                </div>
                <div className="md:col-span-2 flex flex-col items-center">
                  <span className="text-label-sm text-on-surface-variant">Readiness</span>
                  <span className="font-bold text-primary">Robust</span>
                </div>
                <div className="md:col-span-3 flex justify-end gap-2">
                  <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full"><span className="material-symbols-outlined">visibility</span></button>
                  <button className="px-4 py-2 bg-surface-container-high text-on-surface font-medium rounded-xl hover:bg-surface-container-highest transition-all">Request</button>
                </div>
              </div>

              {/* Team Item 2 */}
              <div className="bg-white p-6 rounded-[32px] border border-surface-container-highest hover:border-primary-container transition-all grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-3">
                  <h4 className="font-semibold text-body-lg">Solar Trace</h4>
                  <p className="text-label-sm text-primary font-medium">Sustainability</p>
                </div>
                <div className="md:col-span-4">
                  <p className="text-on-surface-variant text-label-md line-clamp-1">Blockchain ledger for transparent community solar energy sharing.</p>
                  <div className="flex gap-1 mt-2">
                    <span className="px-2 py-0.5 bg-surface-container-low rounded-full text-[10px] uppercase tracking-tighter">Solidity</span>
                    <span className="px-2 py-0.5 bg-surface-container-low rounded-full text-[10px] uppercase tracking-tighter">Node.js</span>
                  </div>
                </div>
                <div className="md:col-span-2 flex flex-col items-center">
                  <span className="text-label-sm text-on-surface-variant">Readiness</span>
                  <span className="font-bold text-secondary">Growing</span>
                </div>
                <div className="md:col-span-3 flex justify-end gap-2">
                  <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full"><span className="material-symbols-outlined">visibility</span></button>
                  <button className="px-4 py-2 bg-surface-container-high text-on-surface font-medium rounded-xl hover:bg-surface-container-highest transition-all">Request</button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <button className="px-8 py-3 rounded-2xl border border-outline-variant font-medium hover:bg-surface-container-low transition-all">Load More Teams</button>
            </div>
          </section>
        </div>
      </main>

      {/* Right Side Panel (AI Insights) */}
      <aside className="hidden lg:block w-96 p-6 sticky top-0 h-screen overflow-y-auto bg-surface-container-lowest border-l border-outline-variant/30">
        <div className="flex flex-col gap-6">
          {/* AI Insights Card */}
          <div className="bg-primary text-white p-8 rounded-[40px] shadow-[0_20px_30px_-10px_rgba(214,203,191,0.3)] relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span className="text-label-sm font-semibold uppercase tracking-widest">Personal Analysis</span>
              </div>
              <div>
                <p className="text-white/80 text-label-sm mb-1 uppercase tracking-wider">Top Recommendation</p>
                <p className="font-headline-sm text-[24px] leading-tight italic">"Your React and UI/UX skills strongly match EcoStream."</p>
              </div>
              <p className="text-body-md text-white/90">This team is currently missing a lead frontend developer and design contributor to finalize their IoT dashboard.</p>
              <div className="space-y-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-white/70 text-label-sm uppercase mb-2">Best Matched Role</p>
                  <span className="px-3 py-1.5 bg-white/10 rounded-full border border-white/20 text-label-md font-medium">Head of Product Design</span>
                </div>
                <div>
                  <p className="text-white/70 text-label-sm uppercase mb-2">Ecosystem Demand</p>
                  <p className="text-label-md font-medium">Rust & WebGL are currently the highest in-demand missing skills.</p>
                </div>
              </div>
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Team Compatibility Analysis */}
          

          {/* Footer Card */}
          
        </div>
      </aside>
    </div>
  );
}
