// /src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { databases } from "/appwriteConfig";
import { v4 as uuidv4 } from "uuid";

const DB_ID = "688cf1f200298c50183d";
const PROJECTS_COLLECTION = "688cf200000b6fdbfe61";

interface Project {
  $id: string;
  name: string;
  description?: string;
  client?: string;
  totalHours: number;
  isActive: boolean;
}

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
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
      const res = await databases.listDocuments(DB_ID, PROJECTS_COLLECTION);
      setProjects(res.documents);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Unable to load projects. Please try again later.");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
  };

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
      createdAt: new Date().toISOString(), // ✅ make sure it's current
    };

    try {
      const newProject = await databases.createDocument(
        DB_ID,
        PROJECTS_COLLECTION,
        uuidv4(),
        data
      );
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

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Projects Dashboard</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      {/* Feedback Messages */}
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

      {/* Project Creation Form */}
      <form
        onSubmit={handleCreateProject}
        className="space-y-4 bg-gray-50 p-4 rounded shadow mb-6"
      >
        <input
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Project Name"
          required
          className="w-full p-2 border rounded"
        />
        <input
          name="client"
          value={formData.client}
          onChange={handleInputChange}
          placeholder="Client Name"
          className="w-full p-2 border rounded"
        />
        <input
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Description"
          className="w-full p-2 border rounded"
        />
        <input
          name="totalHours"
          type="number"
          value={formData.totalHours}
          onChange={handleInputChange}
          placeholder="Total Hours"
          className="w-full p-2 border rounded"
        />
        <select
          name="isActive"
          value={formData.isActive.toString()}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Project
        </button>
      </form>

      {/* Project List */}
      <ul className="space-y-2">
        {projects.length === 0 ? (
          <p className="text-gray-600 text-sm">No projects found.</p>
        ) : (
          projects.map((project) => (
            <li
              key={project.$id}
              className="p-4 border rounded bg-white flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">{project.name}</h2>
                <p className="text-sm text-gray-600">
                  Client: {project.client || "N/A"} | Status:{" "}
                  <span
                    className={`font-semibold ${
                      project.isActive ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {project.isActive ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <span className="text-sm">{project.totalHours} hrs</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Dashboard;
