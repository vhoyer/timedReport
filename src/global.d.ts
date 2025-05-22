export interface Task {
  id: string;
  title: string;
  project: string;
  description: string;
  time: number;
  eta: number;
  taskState: number;
  percentage: number;
  isSelected: boolean;
  isHidden: boolean;
  createdAt: string; // ISO date string YYYY-MM-DD
  billable: boolean;
} 