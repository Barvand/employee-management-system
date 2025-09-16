// src/types.ts
export type ProjectStatus = "active" | "inactive" | "completed" | "cancelled";

export type Project = {
  $id: string;
  name: string;
  totalHours: number;
  description?: string;
  createdBy: string;
  status: ProjectStatus;
  startDate?: string | null;
  completionDate?: string | null;
  client?: string | null;
  $createdAt: string;
  $updatedAt: string;
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  status: "active" | "inactive" | "completed" | "cancelled";
  startDate?: string;
  completionDate?: string;
};
