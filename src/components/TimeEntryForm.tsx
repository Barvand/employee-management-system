// /src/components/TimeEntryForm.jsx
import { useState } from "react";
import { databases } from "../lib/appwrite";

const DB_ID = "688cf1f200298c50183d";
const PROJECTS_COLLECTION = "688cf200000b6fdbfe61";
const TIME_ENTRIES_COLLECTION = "688cf3c800172f6bf40c";

interface TimeEntryFormProps {
  projectId: string;
  userName: string;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  projectId,
  userName,
}) => {
  const [hours, setHours] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create time entry document
      await databases.createDocument(
        DB_ID,
        TIME_ENTRIES_COLLECTION,
        "unique()",
        {
          projectId,
          userName,
          hours: parseFloat(hours),
          date,
          note,
        }
      );

      // Step 2: Get current project to read existing totalHours
      const project = await databases.getDocument(
        DB_ID,
        PROJECTS_COLLECTION,
        projectId
      );
      const currentHours = project.totalHours || 0;

      // Step 3: Update totalHours in the project
      await databases.updateDocument(DB_ID, PROJECTS_COLLECTION, projectId, {
        totalHours: currentHours + parseFloat(hours),
      });

      alert("Time entry added and project updated!");
      setHours("");
      setDate("");
      setNote("");
    } catch (error) {
      console.error(error);
      alert("Failed to save time entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="border p-1"
        />
      </div>

      <div>
        <label>Hours:</label>
        <input
          type="number"
          step="0.1"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          required
          className="border p-1"
        />
      </div>

      <div>
        <label>Note:</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border p-1 w-full"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Saving..." : "Add Entry"}
      </button>
    </form>
  );
};

export default TimeEntryForm;
