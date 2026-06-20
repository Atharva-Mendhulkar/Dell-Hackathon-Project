import { create } from 'zustand';

export interface HackathonBasicInfo {
  name: string;
  theme: string;
  description: string;
  registration_start: string;
  registration_end: string;
  event_start: string;
  event_end: string;
  min_team_size: number;
  max_team_size: number;
}

export interface ProblemStatement {
  id?: string;
  title: string;
  domain: string;
  difficulty: string;
  description: string;
}

export interface RubricCriterion {
  id?: string;
  name: string;
  weight: number;
  score_min: number;
  score_max: number;
}

export interface ReviewerInvite {
  name: string;
  email: string;
  institution: string;
  expertise_domains: string[];
}

interface HackathonStore {
  draftId: string | null;
  setDraftId: (id: string | null) => void;
  
  basicInfo: HackathonBasicInfo;
  setBasicInfo: (info: Partial<HackathonBasicInfo>) => void;
  
  problemStatements: ProblemStatement[];
  setProblemStatements: (statements: ProblemStatement[]) => void;
  
  rubrics: RubricCriterion[];
  setRubrics: (rubrics: RubricCriterion[]) => void;
  
  reviewers: ReviewerInvite[];
  setReviewers: (reviewers: ReviewerInvite[]) => void;
  
  resetStore: () => void;
}

const defaultBasicInfo: HackathonBasicInfo = {
  name: '',
  theme: 'Social Impact',
  description: '',
  registration_start: '',
  registration_end: '',
  event_start: '',
  event_end: '',
  min_team_size: 1,
  max_team_size: 4,
};

export const useHackathonStore = create<HackathonStore>((set) => ({
  draftId: null,
  setDraftId: (id) => set({ draftId: id }),
  
  basicInfo: { ...defaultBasicInfo },
  setBasicInfo: (info) => set((state) => ({ basicInfo: { ...state.basicInfo, ...info } })),
  
  problemStatements: [],
  setProblemStatements: (statements) => set({ problemStatements: statements }),
  
  rubrics: [],
  setRubrics: (rubrics) => set({ rubrics }),
  
  reviewers: [],
  setReviewers: (reviewers) => set({ reviewers }),
  
  resetStore: () => set({
    draftId: null,
    basicInfo: { ...defaultBasicInfo },
    problemStatements: [],
    rubrics: [],
    reviewers: []
  }),
}));
