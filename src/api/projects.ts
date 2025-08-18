import { databases } from "../lib/appwrite";
import { DB_ID, PROJECTS_COLLECTION } from "../lib/appwrite";
import { Query, ID } from "appwrite";

export const COL_LOGS = import.meta.env.VITE_COL_LOGS!;

export type Project = {
  $id: string;
  name: string;
  client?: string;
  totalMinutes?: number;
  isActive?: boolean;
};

export async function listProjects(): Promise<Project[]> {
  const res = await databases.listDocuments(DB_ID, PROJECTS_COLLECTION, [
    Query.orderDesc("$createdAt"),
    Query.limit(100),
  ]);
  return res.documents as any;
}

/** Fetch all projects (newest first). */
export default async function fetchProjects(): Promise<Project[]> {
  const res = await databases.listDocuments(DB_ID, PROJECTS_COLLECTION, [
    Query.orderDesc("$createdAt"),
    Query.limit(100),
  ]);
  return res.documents as unknown as Project[];
}

export async function createProject(data: { name: string; client?: string }) {
  return databases.createDocument(
    DB_ID,
    PROJECTS_COLLECTION,
    ID.unique(),
    data
  );
}
