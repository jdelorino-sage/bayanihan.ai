export interface Case {
  id: number;
  grNumber: string;
  title: string;
  dateDecided: string;
  court: CourtType;
  division?: string;
  ponente?: string;
  fullText: string;
  digest?: string;
  dispositive?: string;
  caseType?: CaseCategory;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Statute {
  id: number;
  type: StatuteType;
  number: string;
  title: string;
  dateEnacted?: string;
  dateEffectivity?: string;
  fullText: string;
  status: StatuteStatus;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Provision {
  id: number;
  statuteId: number;
  articleNumber?: string;
  sectionNumber?: string;
  text: string;
  createdAt: string;
}

export interface Citation {
  id: number;
  sourceType: "case" | "statute";
  sourceId: number;
  targetType: "case" | "statute";
  targetId: number;
  citationType: CitationType;
  contextExcerpt?: string;
  createdAt: string;
}

export type CourtType = "SC" | "CA" | "CTA" | "Sandiganbayan" | "RTC" | "MTC";

export type CaseCategory =
  | "Criminal"
  | "Civil"
  | "Labor"
  | "Tax"
  | "Administrative"
  | "Constitutional"
  | "Commercial"
  | "Special Proceedings";

export type StatuteType = "RA" | "PD" | "EO" | "AO" | "BP" | "CA";

export type StatuteStatus = "active" | "amended" | "repealed";

export type CitationType = "positive" | "negative" | "distinguished" | "cited";
