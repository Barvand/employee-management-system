import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { databases } from "../lib/appwrite";
import ProjectForm from "../components/ProjectForm";
import { Client, Account, ID, Query } from "appwrite";
import type { Models } from "appwrite";
import ConfirmModal from "./ConfirmModal";
import type { Project } from "../types.ts";

const DB_ID = "688cf1f200298c50183d";
const PROJECTS_COLLECTION = "688cf200000b6fdbfe61";
const PROJECT_LOGS_COLLECTION = "688cf3c800172f6bf40c";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("688cf0f10002a903a086");

const account = new Account(client);

const ProjectDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logs, setLogs] = useState<ProjectLog[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  type ProjectLog = Models.Document & {
    projectId: string;
    userId: string;
    userName: string;
    action?: "created" | "updated" | "deleted" | "hoursAdded";
    note?: string;
    hoursAdded?: number;
    timestamp: string; // ISO
  };

  const totalHours = logs.reduce((sum, log) => sum + (log.hoursAdded || 0), 0);

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
      setProject(res as any);
      setEditFormData(res); // preload edit form
    } catch (err) {
      console.error("Failed to fetch project:", err);
      setError("Prosjekt ikke funnet.");
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await databases.listDocuments(
        DB_ID,
        PROJECT_LOGS_COLLECTION,
        [Query.equal("projectId", id!), Query.orderDesc("timestamp")]
      );
      setLogs(res.documents as any);
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const updated = await databases.updateDocument(
        DB_ID,
        PROJECTS_COLLECTION,
        id!,
        {
          name: editFormData.name,
          description: editFormData.description,
          status: editFormData.status,
          startDate: editFormData.startDate || null,
          completionDate: editFormData.completionDate || null,
        }
      );

      // Log the update
      if (user) {
        await databases.createDocument(
          DB_ID,
          PROJECT_LOGS_COLLECTION,
          ID.unique(),
          {
            projectId: id,
            userId: user.$id,
            userName: user.name,
            action: "updated",
            note: "Prosjekt oppdatert",
            timestamp: new Date().toISOString(),
          }
        );
      }

      setProject(updated as any);
      setSuccess("Prosjekt oppdatert.");
      setIsEditing(false);
      fetchLogs();
    } catch (err) {
      console.error("Update failed:", err);
      setError("Kunne ikke oppdatere prosjekt.");
    }
  };

  const handleDelete = async () => {
    try {
      await databases.deleteDocument(DB_ID, PROJECTS_COLLECTION, id!);
      navigate("/"); // back to dashboard
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Kunne ikke slette prosjekt.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aktiv":
        return "text-green-600";
      case "avsluttet":
        return "text-blue-600";
      case "inaktiv":
        return "text-red-500";
      default:
        return "text-gray-500";
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

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!project) return <div className="p-4">Laster...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Link to="/" className="text-blue-600 hover:underline">
        &larr; Tilbake til Dashboard
      </Link>

      {isEditing ? (
        <>
          <h2 className="text-xl font-semibold mt-6 mb-2">Rediger Prosjekt</h2>
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
            Avbryt
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mt-4">{project.name}</h1>

          <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded">
            <div>
              <span className="font-medium">Beskrivelse:</span>
              <p className="mt-1">
                {project.description || "Ingen beskrivelse"}
              </p>
            </div>

            <div>
              <span className="font-medium">Status:</span>
              <span
                className={`ml-2 font-semibold ${getStatusColor(
                  project.status
                )}`}
              >
                {getStatusText(project.status)}
              </span>
            </div>

            {project.startDate && (
              <div>
                <span className="font-medium">Oppstart:</span>
                <span className="ml-2">
                  {new Date(project.startDate).toLocaleDateString("no-NO")}
                </span>
              </div>
            )}

            {project.completionDate && (
              <div>
                <span className="font-medium">Ferdigstilt:</span>
                <span className="ml-2">
                  {new Date(project.completionDate).toLocaleDateString("no-NO")}
                </span>
              </div>
            )}

            <div className="text-sm text-gray-500 pt-2 border-t">
              {project.createdBy && (
                <p>
                  Opprettet av:{" "}
                  <span className="font-semibold">{project.createdBy}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Rediger
            </button>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Slett
            </button>
          </div>

          {logs.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Aktivitetslogg</h3>
              <h2 className="text-xl font-bold">{project.name}</h2>
              <p className="text-gray-700">Totalt antall timer: {totalHours}</p>

              <ul className="space-y-3">
                {logs.map((log) => (
                  <li key={log.$id} className="p-3 bg-gray-100 rounded">
                    <p>
                      <span className="font-semibold">{log.userName}</span>
                      {log.action && <span> {log.action}</span>}
                      {log.hoursAdded && (
                        <span>
                          {" "}
                          la til{" "}
                          <span className="font-semibold">
                            {log.hoursAdded}
                          </span>{" "}
                          timer
                        </span>
                      )}
                    </p>
                    {log.note && (
                      <p className="text-sm text-gray-600 italic">
                        "{log.note}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString("no-NO")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showConfirmModal && (
            <ConfirmModal
              title={project.name}
              message="Er du sikker på at du vil slette dette prosjektet? Denne handlingen kan ikke angres."
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
