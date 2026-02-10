
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
