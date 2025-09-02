// hooks/projects.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject, updateProject } from "../api/projects";
import type { Project } from "../api/projects";

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Project) => createProject(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject(options?: { onUpdated?: () => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; patch: Partial<Project> }) =>
      updateProject(input.id, input.patch),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["projects"] });
      options?.onUpdated?.();
    },
  });
}
