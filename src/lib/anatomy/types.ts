export interface Position {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
}

export interface AnatomyRegion {
  id: string;
  name: string;
  nameIndonesian: string;
  category: "head" | "torso" | "limbs" | "back";
  description: string;
  view: "front" | "back" | "both";
  frontPosition?: Position;
  backPosition?: Position;
  symptoms: Symptom[];
  conditions: Condition[];
}

export interface Symptom {
  id: string;
  name: string;
  category?: string;
  isEmergencyWarning?: boolean;
}

export interface Condition {
  id: string;
  name: string;
  category: string;
  commonSymptoms: string[];
  description: string;
  typicalSeverity: "ringan" | "sedang" | "tinggi";
}

export interface AssessmentInput {
  regionId: string;
  regionName: string;
  symptoms: string[];
  selectedConditions: string[];
  additionalNotes?: string;
}

export interface PossibleConditionResult {
  name: string;
  likelihood: number; // 0-100
  reason: string;
  severity: "ringan" | "sedang" | "tinggi";
}

export interface AIAssessmentResult {
  summary: string;
  primaryCondition: PossibleConditionResult;
  differentialConditions: PossibleConditionResult[];
  matchedSymptoms: string[];
  recommendations: string[];
  isEmergency: boolean;
  emergencyMessage?: string;
  disclaimer: string;
}
