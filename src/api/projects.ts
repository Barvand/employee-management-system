// api/projects.ts
import {
  databases,
  DB_ID,
  PROJECTS_COLLECTION,
  account,
} from "../lib/appwrite";
import { Query, ID } from "appwrite";

export type Project = {
  $id: string;
  nr?: number; // auto-generated 111, 112, 113...
  name: string;
  description?: string;
  client?: string;
  status?: "inactive" | "active" | "completed"; // maps to Inaktiv / Aktiv / avsluttet
  isActive?: boolean; // derived convenience
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  totalHours?: number;
  totalMinutes?: number;
  createdAt?: string; // convenience when you need it
};

export async function fetchProjects(): Promise<Project[]> {
  const res = await databases.listDocuments(DB_ID, PROJECTS_COLLECTION, [
    Query.orderDesc("$createdAt"),
    Query.limit(100),
  ]);
  // Normalize boolean for UI (status drives isActive)
  const docs = res.documents as any[];
  return docs.map((d) => ({
    ...d,
    isActive: d?.status ? d.status === "active" : !!d?.isActive,
  })) as Project[];
}

type NewProjectInput = {
  name: string;
  description?: string;
  client?: string;
  totalHours?: number;
  initialHours?: number;
};

export async function createProject(data: NewProjectInput) {
  const currentUser = await account.get();
  if (!currentUser) {
    throw new Error("User not authenticated");
  }
  const payload: any = {
    name: data.name,
    description: data.description ?? "",
    totalHours: data.totalHours ?? 0,
    createdBy: currentUser.$id,
  };

  // 1) create
  const created: any = await databases.createDocument(
    DB_ID,
    PROJECTS_COLLECTION,
    ID.unique(),
    payload
  );

  return created as Project;

  // Optionally also set 'id' to that human number as a string:
  const updated = await databases.updateDocument(
    DB_ID,
    PROJECTS_COLLECTION,
    ID.unique(),
    payload
  );

  return updated;
}

/** Update a project by id. Only send changed fields. */
export async function updateProject(id: string, patch: Partial<Project>) {
  // Keep status <-> isActive consistent
  let next = { ...patch } as any;
  if (patch.status) next.isActive = patch.status === "active";
  if (typeof patch.isActive === "boolean" && !patch.status) {
    next.status = patch.isActive ? "active" : "inactive";
  }
  return databases.updateDocument(DB_ID, PROJECTS_COLLECTION, id, next);
}
