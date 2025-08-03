// Enhanced /src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { databases } from "../appwriteConfig";
import { Client, Account, ID } from "appwrite";
import type { Models } from "appwrite";
import { v4 as uuidv4 } from "uuid";
import ProjectForm from "../components/ProjectForm";
import ProjectItem from "../components/ProjectItem";

const DB_ID = "688cf1f200298c50183d";
const PROJECTS_COLLECTION = "688cf200000b6fdbfe61";
const PROJECT_LOGS_COLLECTION = "688cf3c800172f6bf40c"; // <- your actual logs collection ID

interface Project extends Models.Document {
  name: string;
  description?: string;
  client?: string;
  totalHours: number;
  isActive: boolean;
  createdAt: string;
}

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("688cf0f10002a903a086");

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"current" | "expired">("current");
  const [showAddProject, setShowAddProject] = useState(false);
  const [formData, setFormData] = useState({
    id: uuidv4(),
    name: "",
    description: "",
    client: "",
    totalHours: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProjects = async () => {
    setError("");
    try {
      const res = await databases.listDocuments<Project>(
        DB_ID,
        PROJECTS_COLLECTION
      );
      setProjects(res.documents); // now this works fine
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Unable to load projects. Please try again later.");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const account = new Account(client);
  account.get().then(console.log).catch(console.error);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 4000); // Message disappears after 4 seconds

      return () => clearTimeout(timer); // cleanup if component unmounts
    }
  }, [error, success]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Project name is required.");
      return;
    }

    const data = {
      ...formData,
      createdAt: new Date().toISOString(),
      createdBy: user?.name || "Unknown",
      initialHours: formData.totalHours,
    };

    try {
      const newProject = await databases.createDocument<Project>(
        DB_ID,
        PROJECTS_COLLECTION,
        uuidv4(),
        data
      );

      if (user) {
        await databases.createDocument(
          DB_ID,
          PROJECT_LOGS_COLLECTION,
          ID.unique(),
          {
            projectId: newProject.$id,
            userId: user.$id,
            userName: user.name,
            hoursAdded: formData.totalHours,
            note: "Hours at creation",
            timestamp: new Date().toISOString(),
          }
        );
      }

      setProjects((prev) => [...prev, newProject]);
      setSuccess("Project created successfully.");
      setFormData({
        id: uuidv4(),
        name: "",
        description: "",
        client: "",
        totalHours: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to create project:", err);
      setError("Something went wrong while creating the project.");
    }
  };

  {
    /* MAKE A SEPARATED COMPONENT  */
  }
  const filteredProjects = projects
    .filter((project) =>
      activeTab === "current" ? project.isActive : !project.isActive
    )
    .filter((project) =>
      project.name.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* MAKE A SEPARATED COMPONENT  */}
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
        {/* MAKE A SEPARATED COMPONENT  */}
      </div>
      <h1 className="text-2xl font-bold mb-4">Projects Dashboard</h1>
      <input
        type="text"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
          {success}
        </div>
      )}
      {/* MAKE A SEPARATED COMPONENT  */}
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
          <div className="p-4 bg-gray-50 rounded border">
            <ProjectForm
              formData={formData}
              onChange={(e) => {
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
              onSubmit={handleCreateProject}
            />
          </div>
        </div>
      </div>
      {/* MAKE A SEPARATED COMPONENT  */}
      <ul className="space-y-2">
        {filteredProjects.length === 0 ? (
          <p className="text-gray-600 text-sm">No projects found.</p>
        ) : (
          filteredProjects.map((project) => (
            <ProjectItem key={project.$id} project={project} />
          ))
        )}
      </ul>
    </div>
  );
};

export default Dashboard;
