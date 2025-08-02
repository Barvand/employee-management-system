export interface Project {
  $id: string;
  name: string;
  description?: string;
  client?: string;
  totalHours: number;
  isActive: boolean;
  createdAt: string;
}
