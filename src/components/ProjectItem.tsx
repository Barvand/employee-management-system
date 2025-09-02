// src/components/ProjectItem.tsx
import React from "react";
import { Link } from "react-router-dom";

interface Project {
  $id: string;
  name: string;
  description?: string;
  status: "inaktiv" | "aktiv" | "avsluttet";
  startDate?: string;
  completionDate?: string;
  createdAt?: string;
}

const ProjectItem: React.FC<{ project: Project }> = ({ project }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "aktiv":
        return "bg-green-100 text-green-800";
      case "avsluttet":
        return "bg-blue-100 text-blue-800";
      case "inaktiv":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "aktiv":
        return "Aktiv";
      case "avsluttet":
        return "Avsluttet";
      case "inaktiv":
        return "Inaktiv";
      default:
        return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("no-NO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <li className="bg-white p-4 rounded border shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/admin/projects/${project.$id}`} className="block">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              <span
                className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(
                  project.status
                )}`}
              >
                {getStatusText(project.status)}
              </span>
            </div>

            {project.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {project.description}
              </p>
            )}

            <div className="flex gap-4 text-xs text-gray-500">
              {project.startDate && (
                <span>Oppstart: {formatDate(project.startDate)}</span>
              )}
              {project.completionDate && (
                <span>Ferdig: {formatDate(project.completionDate)}</span>
              )}
              {project.createdAt && (
                <span>Opprettet: {formatDate(project.createdAt)}</span>
              )}
            </div>
          </div>

          <div className="ml-4 flex-shrink-0">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default ProjectItem;
