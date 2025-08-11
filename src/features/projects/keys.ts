export const projectKeys = {
  all: ["projects"] as const,
  list: (p: unknown) => ["projects", "list", p] as const,
};
