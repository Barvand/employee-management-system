import { useEffect, useState } from "react";
import { useProjectStore } from "../stores/ProjectStore";
import { databases, account } from "../appwriteConfig";
import { ID } from "appwrite";
import HourReview from "./HourReview";

const DB_ID = "688cf1f200298c50183d";
const COLLECTION_ID = "688cf3c800172f6bf40c";

interface LogFormData {
  projectId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  note: string;
}

function EmployeeDashboard() {
  useEffect(() => {
    fetchProjects();
    account.get().then(setUser).catch(console.error);
  }, []);

  const { projects, isLoading, error, fetchProjects } = useProjectStore();
  const [user, setUser] = useState<{
    $id: string;
    name?: string;
    email?: string;
  } | null>(null);

  const [formData, setFormData] = useState<LogFormData>({
    projectId: "",
    date: "",
    startTime: "",
    endTime: "",
    breakMinutes: 0,
    note: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "breakMinutes" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const user = await account.get();

      // Compute worked hours
      const start = new Date(`${formData.date}T${formData.startTime}`);
      const end = new Date(`${formData.date}T${formData.endTime}`);
      const breakMs = formData.breakMinutes * 60 * 1000;
      const hoursWorked =
        (end.getTime() - start.getTime() - breakMs) / (1000 * 60 * 60);

      if (hoursWorked <= 0) {
        setSubmitError(
          "End time must be after start time, accounting for breaks."
        );
        setSubmitting(false);
        return;
      }

      await databases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), {
        userId: user.$id,
        userName: user.name || user.email,
        projectId: formData.projectId,
        timestamp: new Date(`${formData.date}T00:00:00`).toISOString(),
        hoursAdded: Math.round(hoursWorked * 100) / 100, // round to 2 decimals
        note: formData.note || "",
        startTime: formData.startTime,
        endTime: formData.endTime,
        breakMinutes: formData.breakMinutes,
      });

      setSuccessMessage("Hours logged successfully!");
      setFormData({
        projectId: "",
        date: "",
        startTime: "",
        endTime: "",
        breakMinutes: 0,
        note: "",
      });
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Something went wrong.");
    }

    setSubmitting(false);
  };

  if (isLoading) return <p>Loading projects...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Log Your Hours</h1>

      {/* Project Selection */}
      <label className="block mb-2">Select Project</label>
      <select
        name="projectId"
        value={formData.projectId}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">Select...</option>
        {projects.map((project) => (
          <option key={project.$id} value={project.$id}>
            {project.name}
          </option>
        ))}
      </select>

      {/* Date */}
      <label className="block mb-2">Date</label>
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      {/* Time */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block mb-2">Start Time</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
          />
        </div>
        <div className="flex-1">
          <label className="block mb-2">End Time</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
          />
        </div>
      </div>

      {/* Break */}
      <label className="block mb-2">Break (minutes)</label>
      <input
        type="number"
        name="breakMinutes"
        min={0}
        value={formData.breakMinutes}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      {/* Note */}
      <label className="block mb-2">Note (optional)</label>
      <textarea
        name="note"
        value={formData.note}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      {/* Submit Button */}
      <button
        disabled={submitting}
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Hours"}
      </button>

      {submitError && <p className="text-red-600 mt-4">{submitError}</p>}
      {successMessage && (
        <p className="text-green-600 mt-4">{successMessage}</p>
      )}
      {user && <HourReview userId={user.$id} />}
    </div>
  );
}

export default EmployeeDashboard;
