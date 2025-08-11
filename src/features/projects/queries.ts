import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiListProjects, apiCreateProject, apiCreateProjectLog } from "./api";
import { projectKeys } from "./keys";
import type { CreateProjectInput, Project } from "./types";

export function useProjects(
  params: { isActive?: boolean; search?: string; limit?: number } = {
    limit: 100,
  }
) {
  return useQuery<Project[]>({
    queryKey: projectKeys.list(params),
    queryFn: () => apiListProjects(params),
    staleTime: 30_000,
    keepPreviousData: true,
  });
}

export function useCreateProject(options?: {
  onCreated?: (p: Project) => void;
  withLog?: boolean;
  user?: { id: string; name: string };
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const project = await apiCreateProject({
        ...input,
        createdBy: options?.user?.name,
      });
      if (options?.withLog && options.user) {
        await apiCreateProjectLog(
          project.id,
          { id: options.user.id, name: options.user.name },
          input.totalHours ?? 0
        );
      }
      return project;
    },
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
      options?.onCreated?.(project);
    },
  });
}
