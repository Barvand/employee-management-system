import React, { useMemo, useState } from "react";
import fetchProjects from "../api/projects";
import { useUser } from "../features/auth/useUser";
import ProjectForm from "../components/ProjectForm"; // reusing your existing components
import ProjectItem from "../components/ProjectItem";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState<"current" | "expired">("current");
  const [search, setSearch] = useState("");
  const [showAddProject, setShowAddProject] = useState(false);

  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  // const [formData, setFormData] = useState<CreateProjectInput>({
  //   name: "",
  //   description: "",
  //   client: "",
  //   totalHours: 0,
  //   isActive: true,
  // });

  // const createMutation = useCreateProject({
  //   withLog: true,
  //   user: user ? { id: user.$id, name: user.name } : undefined,
  //   onCreated: () => {
  //     setFormData({
  //       name: "",
  //       description: "",
  //       client: "",
  //       totalHours: 0,
  //       isActive: true,
  //     });
  //     setShowAddProject(false);
  //   },
  // });

  const filtered = useMemo(() => {
    return projects.filter(
      (p) =>
        (activeTab === "current" ? p.isActive : !p.isActive) &&
        p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [projects, activeTab, search]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-end items-center mb-4">
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:underline cursor-pointer"
        >
          Log out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex mb-4 space-x-4">
        <button
          onClick={() => setActiveTab("current")}
          className={`px-4 py-2 rounded ${
            activeTab === "current" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Current Projects
        </button>
        <button
          onClick={() => setActiveTab("expired")}
          className={`px-4 py-2 rounded ${
            activeTab === "expired" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Expired Projects
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Projects Dashboard</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      {/* Notices */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {(error as any)?.message ||
            "Unable to load projects. Please try again later."}
        </div>
      )}

      {/* Add Project Accordion */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddProject((prev) => !prev)}
          className="w-full text-left flex justify-between items-center bg-gray-100 px-4 py-3 rounded hover:bg-gray-200 transition"
        >
          <span className="text-xl font-semibold">Add New Project</span>
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 ${
              showAddProject ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showAddProject ? "max-h-[500px] mt-4" : "max-h-0"
          }`}
        >
          {/* <div className="p-4 bg-gray-50 rounded border">
            <ProjectForm
              formData={formData as any}
              onChange={(e: any) => {
                const { name, value } = e.target;
                setFormData((prev) => ({
                  ...prev,
                  [name]:
                    name === "totalHours"
                      ? Number(value)
                      : name === "isActive"
                      ? value === "true"
                      : value,
                }));
              }}
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                if (!formData.name.trim()) return;
                createMutation.mutate(formData);
              }}
            />
          </div> */}
        </div>
      </div>

      {/* List */}
      <ul className="space-y-2">
        {isLoading ? (
          <p className="text-gray-600 text-sm">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600 text-sm">No projects found.</p>
        ) : (
          filtered.map((project) => (
            <ProjectItem
              key={project.id}
              project={{ ...project, $id: project.id } as any}
            />
          ))
        )}
      </ul>
    </div>
  );
}
