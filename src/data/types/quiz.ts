export type MBTIDimension = 'EI' | 'SN' | 'TF' | 'JP';

export interface MBTIQuestion {
  id: number;
  text: string;
  dimension: MBTIDimension;
  reverse?: boolean;
}

export interface MBTIRadar {
  labels: string[];
  data: number[];
}

export interface MBTIMappingItem {
  type: string;
  label: string;
  summary: string;
  strengths: string[];
  blindspots: string[];
  advice: string[];
  majors: string[];
  careers: string[];
  next_steps: string[];
  radar: MBTIRadar;
}

export type MBTIMapping = Record<string, MBTIMappingItem>;
