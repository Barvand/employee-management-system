export type Project = {
  $id: string;
  name: string;
  totalMinutes?: number;
  isActive?: boolean;
  client?: string;
};

export type Log = {
  $id: string;
  projectId: string; // string (or relationship id)
  userId: string;
  workDate: string; // ISO at midnight or YYYY-MM-DD
  startMinutes: number;
  endMinutes: number;
  breakMinutes: number;
  durationMinutes: number;
  note?: string;
};
