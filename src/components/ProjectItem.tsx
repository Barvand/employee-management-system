import React from "react";
import { Link } from "react-router-dom";
import type { Project } from "../types";
// Backend statuses
type Status = "active" | "inactive" | "completed";

// Label + color dictionaries
const STATUS_LABEL: Record<Status, string> = {
  active: "Aktiv",
  inactive: "Inaktiv",
  completed: "Avsluttet",
};

const STATUS_COLOR: Record<Status, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

// Date formatter
// const formatDate = (dateString?: string) =>
//   dateString
//     ? new Date(dateString).toLocaleDateString("no-NO", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       })
//     : null;

const ProjectItem: React.FC<{ project: Project }> = ({ project }) => {
  // make sure TS knows project.status is of type Status
  const status = project.status as Status;

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
                className={`text-sm font-medium px-2 py-1 rounded-full ${STATUS_COLOR[status]}`}
              >
                {STATUS_LABEL[status]}
              </span>
            </div>

            {project.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {project.description}
              </p>
            )}
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
