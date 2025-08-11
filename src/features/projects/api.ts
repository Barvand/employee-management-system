import { ID, Query } from "appwrite";
import {
  databases,
  DB_ID,
  PROJECTS_COLLECTION,
  PROJECT_LOGS_COLLECTION,
} from "../../appwriteConfig";
import type { Project, CreateProjectInput } from "./types";

function toProject(doc: any): Project {
  return {
    id: doc.$id,
    name: doc.name,
    description: doc.description,
    client: doc.client,
    totalHours: typeof doc.totalHours === "number" ? doc.totalHours : 0,
    isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
    createdAt: doc.createdAt || doc.$createdAt,
    createdBy: doc.createdBy,
  };
}

export async function apiListProjects(params?: {
  isActive?: boolean;
  search?: string;
  limit?: number;
}) {
  const queries: any[] = [];
  if (typeof params?.isActive === "boolean")
    queries.push(Query.equal("isActive", params.isActive));
  if (params?.search) queries.push(Query.search("name", params.search));
  queries.push(Query.limit(params?.limit ?? 100));

  const res = await databases.listDocuments(
    DB_ID,
    PROJECTS_COLLECTION,
    queries
  );
  return res.documents.map(toProject);
}

export async function apiCreateProject(
  input: CreateProjectInput & { createdBy?: string }
) {
  const payload = {
    name: input.name,
    description: input.description || "",
    client: input.client || "",
    totalHours: input.totalHours ?? 0,
    isActive: input.isActive ?? true,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy || "Unknown",
    initialHours: input.totalHours ?? 0,
  };

  const doc = await databases.createDocument(
    DB_ID,
    PROJECTS_COLLECTION,
    ID.unique(),
    payload
  );
  const project = toProject(doc);
  return project;
}

export async function apiCreateProjectLog(
  projectId: string,
  user: { id: string; name: string },
  hoursAdded: number,
  note = "Hours at creation"
) {
  return databases.createDocument(DB_ID, PROJECT_LOGS_COLLECTION, ID.unique(), {
    projectId,
    userId: user.id,
    userName: user.name,
    hoursAdded,
    note,
    timestamp: new Date().toISOString(),
  });
}
