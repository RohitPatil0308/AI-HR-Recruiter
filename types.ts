export interface Education {
  degree: string;
  institution: string;
  year?: string;
}

export interface AnalysisResult {
  id: string;
  candidateName: string;
  email?: string;
  phone?: string;
  keySkills: string[];
  education: Education[];
  totalExperience: string;
  suitableJobRoles: string[];
  jobFitScore: number;
  jobFitScoreReason: string;
}

export interface CandidateComparisonDetail {
    candidateName: string;
    strengths: string[];
    weaknesses: string[];
}

export interface ComparisonInsight {
    bestFitCandidateName: string;
    recommendationReason: string;
    candidateComparison: CandidateComparisonDetail[];
}
