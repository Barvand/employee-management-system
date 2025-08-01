// Enhanced /src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { databases } from "/appwriteConfig";
import { v4 as uuidv4 } from "uuid";
import ConfirmModal from "./ConfirmModal";

const DB_ID = "688cf1f200298c50183d";
const PROJECTS_COLLECTION = "688cf200000b6fdbfe61";

interface Project {
  $id: string;
  name: string;
  description?: string;
  client?: string;
  totalHours: number;
  isActive: boolean;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Project>>({});
  const [showModal, setShowModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"current" | "expired">("current");
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

    const data = { ...formData, createdAt: new Date().toISOString() };

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

  const handleDeleteProject = async (id: string) => {
    try {
      await databases.deleteDocument(DB_ID, PROJECTS_COLLECTION, id);
      setProjects((prev) => prev.filter((p) => p.$id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete project.");
    }
  };

  const startEdit = (project: Project) => {
    setEditingId(project.$id);
    setEditFormData({ ...project });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === "totalHours" ? Number(value) : value,
    }));
  };

  const handleEditSave = async () => {
    if (!editingId || !editFormData.name?.trim()) return;

    // Remove unwanted system keys like $databaseId, $collectionId, $createdAt, etc.
    const {
      $id,
      $databaseId,
      $collectionId,
      $createdAt,
      $updatedAt,
      ...safeData
    } = editFormData;

    try {
      const updated = await databases.updateDocument(
        DB_ID,
        PROJECTS_COLLECTION,
        editingId,
        safeData
      );
      setProjects((prev) =>
        prev.map((p) => (p.$id === editingId ? updated : p))
      );
      setEditingId(null);
      setEditFormData({});
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to update project.");
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
      {/* MAKE A SEPARATED COMPONENT  */}
      <ul className="space-y-2">
        {filteredProjects.length === 0 ? (
          <p className="text-gray-600 text-sm">No projects found.</p>
        ) : (
          filteredProjects.map((project) => (
            <li key={project.$id} className="p-4 border rounded bg-white">
              {editingId === project.$id ? (
                <div className="space-y-2">
                  <input
                    name="name"
                    value={editFormData.name || ""}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    name="client"
                    value={editFormData.client || ""}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    name="description"
                    value={editFormData.description || ""}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    name="totalHours"
                    type="number"
                    value={editFormData.totalHours || 0}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                  />
                  <button
                    onClick={handleEditSave}
                    className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">{project.name}</h2>
                    <p className="text-sm text-gray-600">
                      Client: {project.client || "N/A"} | Status:
                      <span
                        className={`font-semibold ${
                          project.isActive ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {" "}
                        {project.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                    <p className=""> Total Hours: {project.totalHours}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(project)}
                      className="text-blue-500 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(true);
                        setProjectToDelete(project.$id);
                      }}
                      className="text-red-600 cursor-pointer"
                    >
                      Delete
                    </button>
                    <ConfirmModal
                      isOpen={showModal}
                      onCancel={() => {
                        setShowModal(false);
                        setProjectToDelete(null);
                      }}
                      onConfirm={async () => {
                        if (projectToDelete) {
                          await handleDeleteProject(projectToDelete);
                          setShowModal(false);
                          setProjectToDelete(null);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Dashboard;
