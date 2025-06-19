// Shared Project interface for the ATB Tracker app
export interface Project {
  id: number;
  name: string;
  client?: string;
  description?: string;
  status?: string;
  progress?: number;
  billableRate?: number;
  totalHours?: number;
  billableHours?: number;
  totalCost?: number;
  members?: Array<{
    id: number;
    name: string;
    avatar?: string;
    role?: string;
  }>;
  teamMembers?: string[];
  template?: string;
  createdDate?: string;
  deadline?: string;
  isBillable?: boolean;
  recentActivity?: Array<{
    action: string;
    user: string;
    time: string;
  }>;
  budget?: number;
  spent?: number;
  hours?: number;
}
