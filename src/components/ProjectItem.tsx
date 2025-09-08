import React from "react";
import { Link } from "react-router-dom";
import type { Project } from "../api/projects";

// Normalize API status to Norwegian UI status
type UiStatus = "aktiv" | "inaktiv" | "avsluttet";
const toUiStatus = (s?: "active" | "inactive" | "completed"): UiStatus => {
  const map = {
    active: "aktiv",
    inactive: "inaktiv",
    completed: "avsluttet",
  } as const;
  return map[s ?? "active"];
};

const getStatusColor = (status: UiStatus) => {
  switch (status) {
    case "aktiv":
      return "bg-green-100 text-green-800";
    case "avsluttet":
      return "bg-blue-100 text-blue-800";
    case "inaktiv":
      return "bg-red-100 text-red-800";
  }
};

const getStatusText = (status: UiStatus) => {
  switch (status) {
    case "aktiv":
      return "Aktiv";
    case "avsluttet":
      return "Avsluttet";
    case "inaktiv":
      return "Inaktiv";
  }
};

const formatDate = (dateString?: string) =>
  dateString
    ? new Date(dateString).toLocaleDateString("no-NO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

const ProjectItem: React.FC<{ project: Project }> = ({ project }) => {
  const uiStatus = toUiStatus(project.status as any);

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
                  uiStatus
                )}`}
              >
                {getStatusText(uiStatus)}
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
