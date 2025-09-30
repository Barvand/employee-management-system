// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import ProjectForm from "../components/ProjectForm";
import ProjectItem from "../components/ProjectItem";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Project } from "../types";
import { useAuth } from "../features/auth/useAuth";
import { makeRequest } from "../axios";

export default function Dashboard() {
  const { logout, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "active" | "completed" | "inactive"
  >("active");
  const [search, setSearch] = useState("");
  const [showAddProject, setShowAddProject] = useState(false);

  const TAB_CONFIG: Record<
    "active" | "completed" | "inactive",
    { label: string; filter: (p: Project) => boolean }
  > = {
    active: {
      label: "Aktive Prosjekter",
      filter: (p) => p.status === "active",
    },
    completed: {
      label: "Avsluttede Prosjekter",
      filter: (p) => p.status === "completed",
    },
    inactive: {
      label: "Inaktive Prosjekter",
      filter: (p) => p.status === "inactive",
    },
  };

  // ---- FETCH: GET /api/projects
  const {
    data: projects = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await makeRequest.get("/projects");
      return data;
    },
  });

  // ---- local form state
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    status: "active",
    startDate: "",
    completionDate: "", // mapped to endDate in API
  });

  // ---- CREATE: POST /api/projects (+ optional log)
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { name, description, status, startDate, completionDate } = payload;

      // Create project
      const { data: created } = await makeRequest.post("/projects", {
        name,
        description,
        status,
        startDate: startDate || null, // backend expects "YYYY-MM-DD" or null
        endDate: completionDate || null,
      });

      // Optional: create a log entry
      try {
        if (currentUser?.id) {
          await makeRequest.post(`/projects/${created.id}/logs`, {
            action: "created",
            userId: currentUser.id,
            userName: currentUser.name,
            note: `Prosjekt opprettet av ${currentUser.name}`,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (e) {
        // Logging failure shouldn't block UI
        console.warn("Could not write project log", e);
      }

      return created;
    },
    onSuccess: () => {
      setFormData({
        name: "",
        description: "",
        status: "active",
        startDate: "",
        completionDate: "",
      });
      setShowAddProject(false);
      refetch();
    },
  });

  // Debug
  useEffect(() => {
    if (projects.length > 0) {
      console.log("Fetched projects:", projects);
      console.log("First project structure:", projects[0]);
    }
  }, [projects]);

  // ---- filter by tab + search
  const displayedProjects = projects
    .filter(TAB_CONFIG[activeTab].filter)
    .filter((p) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    });

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-end items-center mb-4">
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:underline"
        >
          Log ut
        </button>
      </div>

      {/* Tabs */}
      <div className="flex mb-4 space-x-4">
        {(
          Object.entries(TAB_CONFIG) as Array<
            [keyof typeof TAB_CONFIG, (typeof TAB_CONFIG)["active"]]
          >
        ).map(([key, cfg]) => {
          const count = projects.filter(cfg.filter).length;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded ${
                activeTab === key ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Prosjekt Dashboard</h1>
        <button
          onClick={() => refetch()}
          className="text-sm text-blue-600 hover:underline"
          disabled={isLoading}
        >
          {isLoading ? "Laster..." : "Oppdater"}
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Søk prosjekter..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      {/* Notices */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {(error as any)?.message ||
            "Kunne ikke laste prosjekter. Prøv igjen senere."}
        </div>
      )}

      {/* Add Project Accordion */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddProject((prev) => !prev)}
          className="w-full text-left flex justify-between items-center bg-gray-100 px-4 py-3 rounded hover:bg-gray-200 transition"
        >
          <span className="text-xl font-semibold">Legg til nytt prosjekt</span>
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 ${
              showAddProject ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
            showAddProject ? "max-h-[1000px] mt-4" : "max-h-0"
          }`}
        >
          <div className="p-4 bg-gray-50 rounded border">
            <ProjectForm
              formData={formData}
              onChange={(
                e: React.ChangeEvent<
                  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                >
              ) => {
                const { name, value } = e.target;
                setFormData((prev: any) => ({ ...prev, [name]: value }));
              }}
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                if (!formData.name.trim()) return;
                createMutation.mutate(formData);
              }}
            />

            {createMutation.isError && (
              <div className="mt-2 text-red-600 text-sm">
                {(createMutation.error as any)?.message ||
                  "Kunne ikke opprette prosjekt."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {TAB_CONFIG[activeTab].label}
          </h2>
          <span className="text-sm text-gray-500">
            {displayedProjects.length} prosjekt
            {displayedProjects.length !== 1 ? "er" : ""}
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Laster prosjekter...</p>
          </div>
        ) : displayedProjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              {search
                ? "Ingen prosjekter funnet som matcher søket."
                : "Ingen prosjekter funnet."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-blue-600 hover:underline text-sm mt-2"
              >
                Fjern søkefilter
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {displayedProjects.map((p) => (
              <ProjectItem key={p.id} project={p} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
