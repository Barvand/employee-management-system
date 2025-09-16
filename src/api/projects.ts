// api/projects.ts
import {
  databases,
  DB_ID,
  PROJECTS_COLLECTION,
  account,
} from "../lib/appwrite";
import { Query, ID } from "appwrite";
import type { Project } from "../types.ts";

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

export type NewProjectInput = {
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

export async function updateProject(
  id: string,
  patch: Partial<
    Omit<
      Project,
      "$id" | "$databaseId" | "$collectionId" | "$createdAt" | "$updatedAt"
    >
  >
) {
  return databases.updateDocument(DB_ID, PROJECTS_COLLECTION, id, patch);
}
