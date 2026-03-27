
export interface Option {
  id: number;
  label: string;
}

export interface Item {
  id: string; // The key used in the coefficients table (e.g., "Respirer")
  title: string;
  description?: string;
  options: Option[];
}

export interface MetaDimension {
  id: string;
  name: string;
  items: Item[];
}

export interface UserAnswers {
  [itemId: string]: number; // itemId -> levelId
}

export interface Demographics {
  gender: string;
  ageRange: string;
  maritalStatus: string;
  occupation: string;
  education: string;
  income: string;
  livesWithAdult: string;
  region: string;
  ethnicGroup: string;
  responsibleForChildren: string;
  patientId?: string;
}

export interface HealthData {
  isSmoker: string;
  hasChronicCondition: string;
  conditions: string[];
  generalHealth: string;
  consultations: {
    familyDoctor: string;
    specialist: string;
    nurse: string;
    pharmacist: string;
    dentist: string;
    other: string;
  };
}

export interface ScoreResult {
  utility: number;
  breakdown: {
    dimensionName: string;
    score: number;
  }[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
