"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Hackathon {
  id: string;
  name: string;
  theme: string;
  description: string;
  status: string;
  registration_start: string;
  registration_end: string;
  event_start: string;
  event_end: string;
  public_slug: string;
}

export default function OrganizerDashboard() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/hackathons/')
      .then(res => res.json())
      .then(data => {
        setHackathons(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load hackathons", err);
        setIsLoading(false);
      });
  }, []);

  const activeCount = hackathons.filter(h => h.status === 'active' || h.status === 'published').length;

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-64px)] max-w-7xl mx-auto flex flex-col gap-4 md:gap-6 w-full overflow-hidden">
      {/* Page Heading */}
      <div className="flex justify-between items-end flex-shrink-0">
        <div>
          <h2 className="font-headline-md text-[24px] md:text-[28px] text-primary">Dashboard Overview</h2>
          <p className="text-on-surface-variant mt-1 text-sm">Welcome back. Here's what's happening across your {hackathons.length} hackathons.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center px-4 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 text-label-sm gap-2">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            <span>Oct 1 - Oct 31, 2023</span>
          </div>
          <Link href="/organizer/hackathons/create/step-1">
            <button className="bg-primary text-white px-5 py-2 rounded-lg font-label-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Hackathon
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 flex-shrink-0">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-1">Hackathons</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{isLoading ? "-" : hackathons.length}</span>
            <span className="text-primary text-[10px] font-bold bg-primary-fixed px-1.5 py-0.5 rounded">All</span>
          </div>
          <p className="text-[9px] text-on-surface-variant/40 mt-1">All time events</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-1">Active</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{isLoading ? "-" : activeCount}</span>
            <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></span>
          </div>
          <p className="text-[9px] text-on-surface-variant/40 mt-1">Currently running</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-1">Registrations</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">4,852</span>
          </div>
          <p className="text-[10px] text-primary mt-1 font-medium">↑ 12% vs last month</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-1">Submissions</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">1,240</span>
          </div>
          <p className="text-[9px] text-on-surface-variant/40 mt-1">75% completion rate</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-1">Reviewers</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">45</span>
          </div>
          <p className="text-[9px] text-on-surface-variant/40 mt-1">Verified experts</p>
        </div>
        
        <div className="bg-error-container/30 p-4 rounded-xl shadow-sm border border-error/10 hover:shadow-md transition-shadow">
          <p className="text-[9px] uppercase tracking-widest text-on-error-container font-bold mb-1">Reviewer Risk Alerts</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-error-container">2</span>
          </div>
          <p className="text-[9px] text-on-error-container/60 mt-1 font-bold">High Priority Action</p>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Column (Main Charts & Data) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 md:gap-6 min-h-0 overflow-hidden overflow-y-auto custom-scrollbar pr-2">
          
          {/* Your Hackathons Section */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <h3 className="font-headline-sm text-[18px] text-primary font-bold">Your Hackathons</h3>
              <Link href="/organizer/hackathons/create/step-1" className="text-primary font-label-sm hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">add</span> Create New
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading && <p className="text-sm text-on-surface-variant">Loading hackathons...</p>}
              {!isLoading && hackathons.length === 0 && (
                <div className="col-span-2 text-center p-8 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/50">
                  <p className="text-sm text-on-surface-variant mb-2">You haven't created any hackathons yet.</p>
                  <Link href="/organizer/hackathons/create/step-1">
                    <button className="text-primary font-bold text-sm">Create your first hackathon →</button>
                  </Link>
                </div>
              )}
              
              {hackathons.map((h) => (
                <Link key={h.id} href={`/organizer/hackathons/${h.public_slug || h.id}`} className="block group">
                  <div className="bg-white rounded-xl border border-outline-variant/30 p-4 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-primary-container/20 p-2 rounded-lg text-primary">
                        <span className="material-symbols-outlined text-[24px]">event</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${h.status === 'draft' ? 'bg-surface-variant text-on-surface-variant' : 'bg-green-100 text-green-700'}`}>
                        {h.status}
                      </span>
                    </div>
                    <h4 className="font-headline-sm text-[16px] text-on-surface font-bold group-hover:text-primary transition-colors">{h.name}</h4>
                    <p className="text-[12px] text-on-surface-variant mt-1 line-clamp-2 flex-grow">{h.description || h.theme || 'No description provided.'}</p>
                    
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-outline-variant/20">
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Starts</p>
                        <p className="font-bold text-[12px] text-on-surface">
                          {h.event_start ? new Date(h.event_start).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                      <div className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-low group-hover:bg-primary/10 text-on-surface-variant group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="font-headline-sm text-[18px] text-primary font-bold">Recent Activity</h3>
              <button className="text-tertiary font-label-sm hover:underline">View All</button>
            </div>
            <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
              <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/10">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">New registration: <span className="text-primary">Alex Rivera</span> (Stanford)</p>
                  <p className="text-[10px] text-on-surface-variant/60">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/10">
                <div className="w-7 h-7 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[16px]">groups</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Team created: <span className="text-primary">'EcoSync'</span> (4 members)</p>
                  <p className="text-[10px] text-on-surface-variant/60">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/10">
                <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Submission uploaded: <span className="text-primary">'BioTrace'</span> Project</p>
                  <p className="text-[10px] text-on-surface-variant/60">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/10">
                <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">assignment_ind</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Reviewer assigned: <span className="text-primary">Dr. Sarah Chen</span> to 'EcoSync'</p>
                  <p className="text-[10px] text-on-surface-variant/60">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress & Alerts Grid */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 flex-shrink-0">
            {/* Evaluation Progress */}
            <div className="bg-white p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Evaluation Progress</h3>
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90">
                    <circle className="text-surface-container-high" cx="40" cy="40" fill="transparent" r="32" stroke="currentColor" strokeWidth="6"></circle>
                    <circle className="text-primary" cx="40" cy="40" fill="transparent" r="32" stroke="currentColor" strokeDasharray="201" strokeDashoffset="50.25" strokeWidth="6"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">75%</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-primary rounded-sm"></span>
                    <p className="text-xs">Completed (1,240)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-surface-container-high rounded-sm"></span>
                    <p className="text-xs">Pending (412)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Duplicate Alerts */}
            <div className="bg-white p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center mb-3 flex-shrink-0">
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Duplicate Flags</h3>
                <span className="bg-secondary-container/50 text-secondary font-bold text-[9px] px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="space-y-2 overflow-y-auto">
                <div className="p-2.5 bg-background rounded-lg border border-outline-variant/20 flex items-center gap-2">
                  <div className="w-8 h-8 bg-error-container/30 text-on-error-container flex items-center justify-center rounded-md flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px]">person_search</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold truncate">Alex Chen vs. A. Chen</p>
                      <span className="text-[7px] px-1.5 py-[1px] bg-error text-white rounded-full uppercase">High</span>
                    </div>
                    <p className="text-[9px] text-on-surface-variant/60 truncate">94% Similarity • Resume Similarity</p>
                  </div>
                </div>
                <div className="p-2.5 bg-background rounded-lg border border-outline-variant/20 flex items-center gap-2">
                  <div className="w-8 h-8 bg-error-container/30 text-on-error-container flex items-center justify-center rounded-md flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px]">person_search</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold truncate">MIT Tech Club x 4</p>
                      <span className="text-[7px] px-1.5 py-[1px] bg-secondary text-white rounded-full uppercase">Medium</span>
                    </div>
                    <p className="text-[9px] text-on-surface-variant/60 truncate">82% Similarity • College Match</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Sections) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 md:gap-6 min-h-0 overflow-hidden">
          {/* Notifications & Deadlines */}
          <div className="bg-white p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col flex-1 min-h-0">
            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Upcoming Deadlines</h3>
            </div>
            <div className="space-y-4 overflow-y-auto pr-2 flex-1">
              <div className="relative pl-5 border-l-[1.5px] border-tertiary/30">
                <div className="absolute -left-[4px] top-0 w-[6.5px] h-[6.5px] rounded-full bg-tertiary"></div>
                <div className="flex justify-between items-start">
                  <p className="text-[9px] font-bold text-tertiary uppercase tracking-wider">In 2 Days</p>
                  <span className="text-[7px] px-1.5 py-[1px] bg-error text-white rounded-full uppercase font-bold">Urgent</span>
                </div>
                <p className="text-sm font-bold text-primary mt-0.5">HackOS (MIT) Submissions Close</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Hard deadline at 11:59 PM EST.</p>
              </div>
              <div className="relative pl-5 border-l-[1.5px] border-primary/30">
                <div className="absolute -left-[4px] top-0 w-[6.5px] h-[6.5px] rounded-full bg-primary"></div>
                <div className="flex justify-between items-start">
                  <p className="text-[9px] font-bold text-primary uppercase tracking-wider">In 12h</p>
                  <span className="text-[7px] px-1.5 py-[1px] bg-secondary text-white rounded-full uppercase font-bold">High</span>
                </div>
                <p className="text-sm font-bold text-primary mt-0.5">Reviewer Onboarding Session</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Virtual meet-and-greet with 45 experts.</p>
              </div>
            </div>
            <button className="w-full mt-4 py-2 border border-outline-variant/30 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors flex-shrink-0">
              View Full Calendar
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-secondary-container/20 p-5 rounded-xl border border-secondary/20 flex-shrink-0">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">Quick Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="flex items-center gap-2 text-sm text-secondary hover:translate-x-1 transition-transform">
                  <span className="material-symbols-outlined text-[16px]">article</span>
                  HackOS Template 2026
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center gap-2 text-sm text-secondary hover:translate-x-1 transition-transform">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  Code of Conduct Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center gap-2 text-sm text-secondary hover:translate-x-1 transition-transform">
                  <span className="material-symbols-outlined text-[16px]">contact_support</span>
                  Help Center & API Docs
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
