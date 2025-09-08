// src/types.ts
export interface Project {
  $id: string;
  name: string;
  description?: string;
  status: "inaktiv" | "aktiv" | "avsluttet";
  startDate?: string;
  completionDate?: string;
  createdAt?: string;
  createdBy?: string;
}

export type CreateProjectInput = {
  name: string;
  description?: string;
  status: "aktiv" | "inaktiv" | "avsluttet";
  startDate?: string;
  completionDate?: string;
};
