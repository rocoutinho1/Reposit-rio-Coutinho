export interface ProposalHeader {
  proposalNumber?: string;
  client: string;
  project: string;
  date: string;
  periodStart: string;
  periodEnd: string;
  contact: string;
}

export interface VideoGroup {
  quantity: number;
  name: string;
  customName?: string;
  format: string;
  duration: string;
}

export interface VideoDeliverable {
  groups: VideoGroup[];
}

export interface Deliverables {
  video: VideoDeliverable;
  photoQuantity: number;
  rawFootageQuantity: number;
}

export interface Processes {
  preProduction: string[];
  production: string[];
  postProduction: string[];
}

export interface CustomProcess {
  label: string;
  phase: "pre-production" | "production" | "post-production";
}

export interface TeamMember {
  selected: boolean;
  diarias: number;
  hoursPerDiaria: number;
  date?: string;
  dates?: string[];
  customRate?: number;
}

export interface CustomTeamMember {
  label: string;
  phase: "pre-production" | "production" | "post-production";
  ratePerHour: number;
  diarias: number;
  hoursPerDiaria: number;
  dates?: string[];
}

export type TeamSelection = Record<string, TeamMember>;

export interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface IncludedItems {
  included: string[];
  excluded: string[];
}

export interface Logistics {
  displacement: {
    enabled: boolean;
    ratePerKm: number;
    kilometers: number;
    customValue: number;
  };
  meals: {
    enabled: boolean;
    ratePerPerson: number;
    people: number;
  };
  studio: {
    enabled: boolean;
    value: number;
  };
}

export interface GeneralConditions {
  validityStart: string;
  validityEnd: string;
  paymentMethod: string;
  revisions: string;
}

export interface CustomInvestmentValue {
  label: string;
  amount: number;
}

export interface CustomInvestmentItem {
  name: string;
  directValue: number;
  values: CustomInvestmentValue[];
}

export interface ProposalFormData {
  header: ProposalHeader;
  aboutProject: string;
  deliverables: Deliverables;
  processes: Processes;
  customProcesses: CustomProcess[];
  team: TeamSelection;
  customTeam: CustomTeamMember[];
  equipment: EquipmentItem[];
  includedItems: IncludedItems;
  schedule: string;
  clientResponsibilities: string;
  logistics: Logistics;
  generalConditions: GeneralConditions;
  feesRate: number;
  discountRate: number;
  customInvestmentItems: CustomInvestmentItem[];
}

export interface PhaseSubtotal {
  phase: string;
  label: string;
  subtotal: number;
}

export interface InvestmentSummary {
  preProduction: number;
  production: number;
  postProduction: number;
  equipment: number;
  logistics: number;
  subtotal: number;
  taxes: number;
  fees: number;
  total: number;
}
