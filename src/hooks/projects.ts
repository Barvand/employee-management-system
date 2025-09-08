// hooks/projects.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject, updateProject } from "../api/projects";
import type { Project } from "../api/projects";

type UseCreateProjectOptions = {
  withLog?: boolean;
  user?: { id: string; name: string };
  onCreated?: () => void;
};

export function useCreateProject(options?: UseCreateProjectOptions) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Project) => createProject(data),
    onSuccess: () => {
      if (options?.onCreated) options.onCreated();
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
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
