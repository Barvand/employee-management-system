export type Project = {
  id: string; // maps from $id
  name: string;
  description?: string;
  client?: string;
  totalHours: number;
  isActive: boolean;
  createdAt: string; // ISO
  createdBy?: string;
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  client?: string;
  totalHours?: number;
  isActive?: boolean;
};
