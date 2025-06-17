export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rate: string;
  cost: string;
  workHours: string;
  accessRights: string;
  groups: string[];
}

export interface TeamGroup {
  id: string;
  name: string;
  description?: string;
  members: string[];
  access: string;
}
