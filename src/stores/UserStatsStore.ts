// stores/UserLogsStore.ts
import { create } from "zustand";
import { databases } from "../appwriteConfig";
import { Query } from "appwrite";

const DB_ID = "688cf1f200298c50183d";
const COLLECTION_ID = "688cf3c800172f6bf40c";

interface LogEntry {
  $id: string;
  timestamp: string;
  startTime: string;
  endTime: string;
  hoursAdded: number;
  breakMinutes: number;
  projectId: string;
}

interface UserLogsState {
  logs: LogEntry[];
  loading: boolean;
  error: string | null;
  fetchLogs: (userId: string) => Promise<void>;
}

export const useUserLogsStore = create<UserLogsState>((set) => ({
  logs: [],
  loading: false,
  error: null,
  fetchLogs: async (userId) => {
    set({ loading: true, error: null });

    try {
      const res = await databases.listDocuments(DB_ID, COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.orderDesc("timestamp"),
        Query.limit(50),
      ]);
      set({ logs: res.documents as LogEntry[], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
