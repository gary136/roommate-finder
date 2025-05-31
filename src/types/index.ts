export interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface LocationOption {
  value: string;
  label: string;
}

export interface AreaData {
  [key: string]: LocationOption[];
}

export interface SelectedLocation {
  borough: string;
  neighborhood: string;
  id: string;
}