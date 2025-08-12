import { useEffect, useMemo, useState } from "react";
import { useProjectStore } from "../../stores/ProjectStore";
import { databases, account } from "../../appwriteConfig";
import { ID } from "appwrite";
import HourReview from "../HourReview";

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

  // week state for the right panel (you can wire this into HourReview if it supports it)
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    fetchProjects();
    account.get().then(setUser).catch(console.error);
  }, [fetchProjects]);

  // live preview of worked hours
  const preview = useMemo(() => {
    if (!formData.date || !formData.startTime || !formData.endTime) return null;
    const start = new Date(`${formData.date}T${formData.startTime}`);
    const end = new Date(`${formData.date}T${formData.endTime}`);
    const ms = end.getTime() - start.getTime() - formData.breakMinutes * 60_000;
    const hours = Math.round((ms / 3_600_000) * 100) / 100;
    if (!isFinite(hours)) return null;
    return {
      startStr: formData.startTime,
      endStr: formData.endTime,
      breakStr: `${formData.breakMinutes || 0} minutes`,
      hours,
      valid: hours > 0,
    };
  }, [formData]);

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
      const currentUser = await account.get();

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
        userId: currentUser.$id,
        userName: currentUser.name || currentUser.email,
        projectId: formData.projectId,
        timestamp: new Date(`${formData.date}T00:00:00`).toISOString(),
        hoursAdded: Math.round(hoursWorked * 100) / 100,
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
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <p className="p-6">Loading projects...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  // helpers for “Week 21” title – shows the ISO week number based on offset
  const current = new Date();
  const monday = new Date(current);
  const day = (current.getDay() + 6) % 7; // 0=Mon
  monday.setDate(current.getDate() - day + weekOffset * 7);
  const weekNumber = getISOWeek(monday);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Title */}
      <h1 className="text-center text-3xl font-semibold">Employee dashboard</h1>

      {/* Greeting + Two-column layout */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,420px]">
        {/* LEFT: form column */}
        <div>
          <h2 className="text-2xl font-bold">
            Hi {user?.name || "{Employee}"} How are you today?
          </h2>

          {/* Project card */}
          <section className="mt-6 rounded-lg bg-neutral-200 p-6">
            <h3 className="text-2xl font-semibold">
              What project are you working on?
            </h3>
            <p className="mt-1 text-sm">Select project from the dropdown</p>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className="mt-3 w-full rounded border bg-white p-3"
            >
              <option value="">Select…</option>
              {projects.map((project) => (
                <option key={project.$id} value={project.$id}>
                  {project.name}
                </option>
              ))}
            </select>
          </section>

          {/* Times row */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <section className="rounded-lg bg-neutral-200 p-4">
              <label className="block text-sm font-medium">
                What time did you start work?
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="mt-2 w-full rounded border bg-white p-2"
              />
            </section>

            <section className="rounded-lg bg-neutral-200 p-4">
              <label className="block text-sm font-medium">
                What time did you end work?
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="mt-2 w-full rounded border bg-white p-2"
              />
            </section>

            <section className="rounded-lg bg-neutral-200 p-4">
              <label className="block text-sm font-medium">
                Did you take a break?
              </label>
              <input
                type="number"
                min={0}
                name="breakMinutes"
                value={formData.breakMinutes}
                onChange={handleChange}
                className="mt-2 w-full rounded border bg-white p-2"
                placeholder="Break (minutes)"
              />
            </section>
          </div>

          {/* Date picker + submit */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="sm:w-60">
              <label className="block text-sm font-medium">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-2 w-full rounded border bg-white p-2"
              />
            </div>

            <button
              disabled={submitting}
              onClick={handleSubmit}
              className="mt-2 inline-flex h-11 items-center justify-center rounded bg-emerald-500 px-5 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50 sm:mt-0"
            >
              {submitting ? "Submitting…" : "Submit your working day"}
            </button>
          </div>

          {/* Error / success */}
          {submitError && (
            <p className="mt-3 text-sm text-red-600">{submitError}</p>
          )}
          {successMessage && (
            <p className="mt-3 text-sm text-emerald-700">{successMessage}</p>
          )}

          {/* Preview / status card */}
          <section className="mt-6 rounded-lg bg-neutral-200 p-6">
            {preview && preview.valid ? (
              <>
                <p className="font-semibold">
                  You have not yet registered your working day yet.
                </p>
                <p className="mt-3 text-sm">
                  You have worked today from <b>{preview.startStr}</b> to{" "}
                  <b>{preview.endStr}</b> and you took a break of{" "}
                  <b>{preview.breakStr}</b>.<br />
                  In total you have worked for <b>{preview.hours} hours</b>
                </p>
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="mt-4 text-sm font-medium text-red-600 underline"
                >
                  Edit your workday
                </button>
              </>
            ) : (
              <>
                <p className="font-semibold">
                  You have not yet registered your working day yet.
                </p>
                <p className="mt-2 text-sm">
                  Fill out the form above to see a preview here.
                </p>
              </>
            )}
          </section>
        </div>

        {/* RIGHT: weekly panel */}
        <aside className="rounded-lg bg-neutral-200 p-6 lg:sticky lg:top-8 lg:h-fit">
          <div className="mb-4 flex items-center justify-center gap-6">
            <button
              aria-label="Previous week"
              className="text-xl"
              onClick={() => setWeekOffset((w) => w - 1)}
            >
              ←
            </button>
            <h3 className="text-2xl font-bold">Week {weekNumber}</h3>
            <button
              aria-label="Next week"
              className="text-xl"
              onClick={() => setWeekOffset((w) => w + 1)}
            >
              →
            </button>
          </div>

          {/* Inject your existing weekly list */}
          <div className="space-y-5">
            {/* If HourReview already renders its own blocks, great.
                Otherwise you can style it inside here. */}
            {user && <HourReview userId={user.$id} />}
          </div>

          {/* Example footer total (you can compute inside HourReview and render here if you prefer) */}
          <div className="mt-6 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Total hours:</span>
              {/* Replace with your real computed weekly total */}
              <span className="opacity-80">—</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default EmployeeDashboard;

/** Helpers */
function getISOWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return weekNo;
}
