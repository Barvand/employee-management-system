import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { databases } from "/appwriteConfig";
import ProjectForm from "../components/ProjectForm";
import { Client, Account, ID, Query } from "appwrite";
import ConfirmModal from "./ConfirmModal";

const DB_ID = "688cf1f200298c50183d";
const PROJECTS_COLLECTION = "688cf200000b6fdbfe61";
const PROJECT_LOGS_COLLECTION = "688cf3c800172f6bf40c"; // Replace with your actual collection ID

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // Or your custom endpoint
  .setProject("688cf0f10002a903a086"); // Replace with your actual project ID

const account = new Account(client);

const ProjectDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchUser = async () => {
    try {
      const user = await account.get();
      setUser(user);
    } catch (err) {
      console.error("Could not fetch user:", err);
    }
  };

  const fetchProject = async () => {
    try {
      const res = await databases.getDocument(DB_ID, PROJECTS_COLLECTION, id!);
      setProject(res);
      setEditFormData(res); // preload edit form
    } catch (err) {
      console.error("Failed to fetch project:", err);
      setError("Project not found.");
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await databases.listDocuments(
        DB_ID,
        PROJECT_LOGS_COLLECTION,
        [Query.equal("projectId", id!), Query.orderDesc("timestamp")]
      );
      setLogs(res.documents);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchUser();
    fetchLogs();
  }, [id]);

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev: any) => ({
      ...prev,
      [name]:
        name === "totalHours"
          ? Number(value)
          : name === "isActive"
          ? value === "true"
          : value,
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const oldHours = project.totalHours;
      const newHours = editFormData.totalHours;
      const hoursAdded = newHours - oldHours;

      await databases.updateDocument(DB_ID, PROJECTS_COLLECTION, id!, {
        name: editFormData.name,
        client: editFormData.client,
        description: editFormData.description,
        totalHours: newHours,
        isActive: editFormData.isActive,
      });

      if (hoursAdded !== 0 && user) {
        await databases.createDocument(
          DB_ID,
          PROJECT_LOGS_COLLECTION,
          ID.unique(),
          {
            projectId: id,
            userId: user.$id,
            userName: user.name,
            hoursAdded,
            note: editFormData.note || "",
            timestamp: new Date().toISOString(),
          }
        );
      }

      setSuccess("Project updated successfully.");
      setIsEditing(false);
      fetchProject();
      fetchLogs();
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to update project.");
    }
  };

  const handleDelete = async () => {
    try {
      await databases.deleteDocument(DB_ID, PROJECTS_COLLECTION, id!);
      navigate("/"); // back to dashboard
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete project.");
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;
  if (!project) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Link to="/" className="text-blue-600 hover:underline">
        &larr; Back to Dashboard
      </Link>

      {isEditing ? (
        <>
          <h2 className="text-xl font-semibold mt-6 mb-2">Edit Project</h2>
          <ProjectForm
            formData={editFormData}
            onChange={handleEditChange}
            onSubmit={handleUpdate}
            isEdit
          />
          <button
            onClick={() => setIsEditing(false)}
            className="text-sm text-gray-600 mt-2 underline"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mt-4">{project.name}</h1>
          <p className="mt-2 text-gray-600">
            Client: {project.client || "N/A"}
          </p>
          <p className="mt-2">{project.description}</p>
          <p className="mt-2">Total Hours: {project.totalHours}</p>
          <p className="mt-2">
            Status:{" "}
            <span
              className={project.isActive ? "text-green-600" : "text-red-500"}
            >
              {project.isActive ? "Active" : "Inactive"}
            </span>
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Created At: {new Date(project.createdAt).toLocaleString()}
          </p>
          {project.createdBy && (
            <p className="mt-2 text-sm text-gray-600">
              Created by:{" "}
              <span className="font-semibold">{project.createdBy}</span>
            </p>
          )}

          {project.initialHours !== undefined && (
            <p className="mt-2 text-sm text-gray-600">
              Initial hours logged:{" "}
              <span className="font-semibold">{project.initialHours}</span>
            </p>
          )}

          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
          {logs.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-2">Hour History</h3>
              <ul className="space-y-3">
                {logs.map((log) => (
                  <li key={log.$id} className="p-3 bg-gray-100 rounded">
                    <p>
                      <span className="font-semibold">{log.userName}</span>{" "}
                      added{" "}
                      <span className="font-semibold">{log.hoursAdded}</span>{" "}
                      hours
                    </p>
                    {log.note && (
                      <p className="text-sm text-gray-600 italic">
                        “{log.note}”
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {showConfirmModal && (
            <ConfirmModal
              title={project.name}
              message="Are you sure you want to delete this project? This action cannot be undone."
              onConfirm={() => {
                handleDelete();
                setShowConfirmModal(false);
              }}
              onCancel={() => setShowConfirmModal(false)}
            />
          )}
        </>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mt-4">
          {success}
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
