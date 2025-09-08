import React, { useEffect, useMemo, useState } from "react";
import { fetchProjects } from "../api/projects";
import { useUser } from "../features/auth/useUser";
import ProjectForm from "../components/ProjectForm";
import ProjectItem from "../components/ProjectItem";
import { useQuery } from "@tanstack/react-query";
import { useCreateProject } from "../hooks/projects";
import type { Project } from "../types.ts";
import { client } from "../lib/appwrite.ts";

export default function Dashboard() {
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState<"current" | "expired">("current");
  const [search, setSearch] = useState("");
  const [showAddProject, setShowAddProject] = useState(false);

  // derive role safely
  const role = (user?.prefs as any)?.role as "employee" | "admin" | undefined;

  // log only when we actually have a role
  useEffect(() => {
    if (!role) return;
    if (role === "employee") {
      console.log("Employee logged in");
    } else {
      console.log("Admin logged in");
    }
  }, [role]);

  useEffect(() => {
    // Reset search when switching tabs
    const channel =
      "databases.688cf1f200298c50183d.collections.688cf200000b6fdbfe61.documents";

    const unsubscribe = client.subscribe(channel, (response) => {
      const events = response.events as string[];

      if (
        events.includes("create") ||
        events.includes("update") ||
        events.includes("delete")
      ) {
        console.log("Project changed:", response.payload);
        refetch();
      }
    });

    return () => {
      // important: avoid duplicate subscriptions on re-mounts
      unsubscribe();
    };
  }, [client]);

  const {
    data: projects = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    status: "aktiv",
    startDate: "",
    completionDate: "",
  });

  const createMutation = useCreateProject({
    withLog: true,
    user: user ? { id: user.$id, name: user.name } : undefined,
    onCreated: () => {
      setFormData({
        name: "",
        description: "",
        status: "aktiv",
        startDate: "",
        completionDate: "",
      });
      setShowAddProject(false);
      // Refetch projects after creating a new one
      refetch();
    },
  });

  const filtered = useMemo(() => {
    const items = Array.isArray(projects) ? projects : [];

    return items
      .map((p) => {
        // Normalize without mutating the original object
        const legacy = (p as any)?.isActive;
        // Map possible status values to allowed types
        const rawStatus =
          p.status ??
          (legacy !== undefined ? (legacy ? "aktiv" : "inaktiv") : "aktiv");
        let status: Project["status"];
        switch (rawStatus) {
          case "aktiv":
          case "active":
            status = "aktiv";
            break;
          case "inaktiv":
          case "inactive":
            status = "inaktiv";
            break;
          case "completed":
            status = "avsluttet";
            break;
          default:
            status = "aktiv";
        }
        const name = (p.name ?? "").toString();

        return { ...p, status, name };
      })
      .filter((p) => {
        const matchesTab =
          activeTab === "current"
            ? p.status === "aktiv"
            : p.status === "avsluttet" || p.status === "inaktiv";

        const matchesSearch = p.name
          .toLowerCase()
          .includes(search.toLowerCase());

        return matchesTab && matchesSearch;
      });
  }, [projects, activeTab, search]);

  // Debug logging to see what's being fetched
  React.useEffect(() => {
    if (projects && projects.length > 0) {
      console.log("Fetched projects:", projects);
      console.log("First project structure:", projects[0]);
    }
  }, [projects]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-end items-center mb-4">
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:underline cursor-pointer"
        >
          Log ut
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
          Aktive Prosjekter (
          {filtered.filter((p) => p.status === "aktiv").length})
        </button>
        <button
          onClick={() => setActiveTab("expired")}
          className={`px-4 py-2 rounded ${
            activeTab === "expired" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Avsluttede Prosjekter (
          {
            filtered.filter(
              (p) => p.status === "avsluttet" || p.status === "inaktiv"
            ).length
          }
          )
        </button>
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
                setFormData((prev: any) => ({
                  ...prev,
                  [name]: value,
                }));
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
            {activeTab === "current"
              ? "Aktive Prosjekter"
              : "Avsluttede Prosjekter"}
          </h2>
          <span className="text-sm text-gray-500">
            {projects.length} prosjekt{projects.length !== 1 ? "er" : ""}
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Laster prosjekter...</p>
          </div>
        ) : projects.length === 0 ? (
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
            {projects.map((p) => (
              <ProjectItem key={p.$id} project={p} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
