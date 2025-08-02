// src/components/ProjectItem.tsx
import React from "react";
import { Link } from "react-router-dom";

interface Project {
  $id: string;
  name: string;
  totalHours: number;
  isActive: boolean;
}

const ProjectItem: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <li className="bg-white p-4 rounded border shadow-sm hover:shadow transition">
      <Link to={`/projects/${project.$id}`} className="block">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <span
            className={`text-sm font-medium px-2 py-1 rounded ${
              project.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {project.isActive ? "Active" : "Expired"}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Total hours: {project.totalHours}
        </p>
      </Link>
    </li>
  );
};

export default ProjectItem;
