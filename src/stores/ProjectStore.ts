import { create } from "zustand";
import { databases } from "../appwriteConfig"; // adjust path
import { ID, Query } from "appwrite";

const DB_ID = "688cf1f200298c50183d";
const PROJECTS_COLLECTION = "688cf200000b6fdbfe61";

export const useProjectStore = create((set) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await databases.listDocuments(DB_ID, PROJECTS_COLLECTION, [
        Query.limit(100), // adjust if needed
      ]);

      set({ projects: res.documents, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      set({ error: err.message, isLoading: false });
    }
  },
}));
