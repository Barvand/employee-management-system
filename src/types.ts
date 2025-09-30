// src/types.ts
export type ProjectStatus = "active" | "completed" | "inactive";

export type Project = {
  id: number; // MySQL INT
  name: string;
  description: string | null;
  status: ProjectStatus; // keep lowercase in API/DB for consistency
  totalHours: number | null;
  startDate: string | null; // "YYYY-MM-DD"
  endDate: string | null; // replaces completionDate
  // Optional if you later add audit columns
  createdAt?: string; // ISO or "YYYY-MM-DD HH:mm:ss"
  updatedAt?: string;
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  status: "active" | "inactive" | "completed" | "cancelled";
  startDate?: string;
  completionDate?: string;
};
