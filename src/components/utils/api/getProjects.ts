import { useQuery } from "@tanstack/react-query";
import { databases } from "../appwriteConfig"; // keep your path
import { Query } from "appwrite";

const DB_ID = "688cf1f200298c50183d";
const PROJECTS_COLLECTION = "688cf200000b6fdbfe61";

// (Optional) map Appwrite doc -> domain type
export type Project = {
  id: string;
  name: string;
  code?: string;
  client?: string;
  status?: string;
  startAt?: string;
  endAt?: string;
};

function toProject(doc: any): Project {
  return {
    id: doc.$id,
    name: doc.name,
    code: doc.code,
    client: doc.client,
    status: doc.status,
    startAt: doc.startAt,
    endAt: doc.endAt,
  };
}

async function fetchProjects({ limit = 100 }: { limit?: number } = {}) {
  const res = await databases.listDocuments(DB_ID, PROJECTS_COLLECTION, [
    Query.limit(limit),
  ]);
  // return raw docs or mapped domain objects
  return res.documents.map(toProject);
}

export function useProjects(params: { limit?: number } = { limit: 100 }) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => fetchProjects(params),
    staleTime: 30_000, // cache fresh for 30s
    refetchOnWindowFocus: true, // auto refresh when tab refocuses
    retry: 2, // retry transient errors
  });
}
