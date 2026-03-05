export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  court?: string;
  dateFrom?: string;
  dateTo?: string;
  ponente?: string;
  caseType?: string;
}

export interface LegalResearchRequest {
  query: string;
  filters?: {
    court?: string[];
    dateFrom?: string;
    dateTo?: string;
    caseType?: string[];
  };
}

export interface LegalResearchResponse {
  answer: string;
  citations: CitationReference[];
  confidenceScore: number;
  disclaimer: string;
  cached: boolean;
  latencyMs: number;
}

export interface CitationReference {
  type: "case" | "statute" | "provision";
  id: number;
  identifier: string; // GR number or statute number
  title: string;
  date?: string;
  relevanceScore: number;
  excerpt?: string;
}
