// src/api/logs.ts
import { databases, DB_ID, PROJECT_LOGS_COLLECTION } from "../lib/appwrite";
import { Query } from "appwrite";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Log = {
  $id: string;
  userId: string;
  projectId: string;
  timestamp: string; // ISO (00:00)
  startTime: string; // "08:00"
  endTime: string; // "16:00"
  breakMinutes: number;
  hoursAdded: number;
  note?: string;
};

export type UpdateLogData = {
  startTime?: string;
  endTime?: string;
  breakMinutes?: number;
  hoursAdded?: number;
  note?: string;
};

export async function listLogsByUser(userId: string): Promise<Log[]> {
  const res = await databases.listDocuments(DB_ID, PROJECT_LOGS_COLLECTION, [
    Query.equal("userId", userId), // <-- requires schema attr + index
    Query.orderDesc("timestamp"),
    Query.limit(500),
  ]);
  return res.documents as unknown as Log[];
}

export async function updateLog(
  logId: string,
  data: UpdateLogData
): Promise<Log> {
  const res = await databases.updateDocument(
    DB_ID,
    PROJECT_LOGS_COLLECTION,
    logId,
    data
  );
  return res as unknown as Log;
}

export function useUserLogs(userId?: string) {
  return useQuery<Log[], Error>({
    queryKey: ["logs", "user", userId],
    enabled: !!userId,
    queryFn: () => listLogsByUser(userId!),
    staleTime: 60_000,
  });
}

export function useUpdateLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ logId, data }: { logId: string; data: UpdateLogData }) =>
      updateLog(logId, data),
    onSuccess: (updatedLog) => {
      // Update the user logs cache
      queryClient.setQueryData(
        ["logs", "user", updatedLog.userId],
        (oldData: Log[] = []) => {
          return oldData.map((log) =>
            log.$id === updatedLog.$id ? updatedLog : log
          );
        }
      );
      // Optionally invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["logs", "user", updatedLog.userId],
      });
    },
  });
}
export async function deleteLog(logId: string, userId: string, projectId: string) {
  await databases.deleteDocument(DB_ID, PROJECT_LOGS_COLLECTION, logId);
  return { logId, userId, projectId };
}

export function useDeleteLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ logId, userId, projectId }: { logId: string; userId: string; projectId: string }) =>
      deleteLog(logId, userId, projectId),
    onSuccess: ({ logId, userId }) => {
      // Remove the deleted log from the cache
      queryClient.setQueryData(["logs", "user", userId], (oldData: Log[] = []) => {
        return oldData.filter((log) => log.$id !== logId);
      });
      // Optionally invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["logs", "user", userId],
      });
    },
  });
}
