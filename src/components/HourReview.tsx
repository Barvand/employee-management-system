import { useMemo, useState } from "react";
import { useUserLogs, useUpdateLog, type Log } from "../api/logs";
import { useDeleteLog } from "../api/logs";
type Props = { userId: string; weekOffset: number };

/* ISO week helpers (UTC, Mon–Sun) */
function isoWeekKey(d: Date) {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = x.getUTCDay() || 7; // Mon=1..Sun=7
  x.setUTCDate(x.getUTCDate() + 4 - day); // Thursday
  const year = x.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(
    ((x.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return { year, week, key: `${year}-W${String(week).padStart(2, "0")}` };
}

function mondayOfISOWeek(year: number, week: number) {
  const d = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + (1 - dow));
  return d;
}

function calculateHours(
  startTime: string,
  endTime: string,
  breakMinutes: number
): number {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const startTotalMinutes = startHour * 60 + startMin;
  const endTotalMinutes = endHour * 60 + endMin;
  const workMinutes = endTotalMinutes - startTotalMinutes - breakMinutes;
  return Math.max(0, workMinutes / 60);
}

type EditingLogProps = {
  log: Log;
  onSave: (logId: string, data: any) => void;
  onCancel: () => void;
  isUpdating: boolean;
};

function EditingLog({ log, onSave, onCancel, isUpdating }: EditingLogProps) {
  const [startTime, setStartTime] = useState(log.startTime);
  const [endTime, setEndTime] = useState(log.endTime);
  const [breakMinutes, setBreakMinutes] = useState(log.breakMinutes.toString());
  const [note, setNote] = useState(log.note || "");

  const calculatedHours = useMemo(() => {
    if (!startTime || !endTime || !breakMinutes) return 0;
    return calculateHours(startTime, endTime, Number(breakMinutes));
  }, [startTime, endTime, breakMinutes]);

  const handleSave = () => {
    const breakMins = Number(breakMinutes) || 0;
    onSave(log.$id, {
      startTime,
      endTime,
      breakMinutes: breakMins,
      hoursAdded: calculatedHours,
      note: note || undefined,
    });
  };

  const del = useDeleteLog();

  const handleDelete = () => {
    if (!confirm("Delete this log?")) return;
    del.mutate(
      { logId: log.$id, userId: log.userId, projectId: log.projectId },
      { onSuccess: () => onCancel?.() }
    );
  };

  return (
    <li className="rounded border bg-blue-50 p-3 shadow-sm">
      <div className="flex flex-wrap justify-between gap-2 mb-3">
        <span className="font-medium">
          {new Date(log.timestamp).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isUpdating ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onCancel}
            disabled={isUpdating}
            className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isUpdating}
            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded"
            disabled={isUpdating}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded"
            disabled={isUpdating}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">
            Break (minutes)
          </label>
          <input
            type="number"
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded"
            min="0"
            disabled={isUpdating}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">
            Calculated Hours
          </label>
          <div className="px-2 py-1 text-sm bg-gray-100 rounded">
            {calculatedHours.toFixed(2)} h
          </div>
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-xs font-medium mb-1">Note</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note..."
          className="w-full px-2 py-1 text-sm border rounded"
          disabled={isUpdating}
        />
      </div>
    </li>
  );
}

type LogItemProps = {
  log: Log;
  onEdit: () => void;
};

function LogItem({ log, onEdit }: LogItemProps) {
  return (
    <li className="rounded border bg-white p-3 shadow-sm">
      <div className="flex flex-wrap justify-between gap-2">
        <span className="font-medium">
          {new Date(log.timestamp).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-80">
            {log.startTime} → {log.endTime}
          </span>
          <button
            onClick={onEdit}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
        </div>
      </div>
      <div className="mt-1 text-sm opacity-80">
        {Number(log.hoursAdded).toFixed(2)} h • break {log.breakMinutes} min
        {log.note ? <> • {log.note}</> : null}
      </div>
    </li>
  );
}

export default function HourReview({ userId, weekOffset }: Props) {
  const { data: logs = [], isLoading, isError, error } = useUserLogs(userId);
  const updateLogMutation = useUpdateLog();
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Week window from offset
  const { targetKey, monday, sunday } = useMemo(() => {
    const nowKey = isoWeekKey(new Date());
    const baseMonday = mondayOfISOWeek(nowKey.year, nowKey.week);
    const targetMonday = new Date(baseMonday);
    targetMonday.setUTCDate(baseMonday.getUTCDate() + weekOffset * 7);
    const { key } = isoWeekKey(targetMonday);
    const endSunday = new Date(targetMonday);
    endSunday.setUTCDate(targetMonday.getUTCDate() + 6);
    return { targetKey: key, monday: targetMonday, sunday: endSunday };
  }, [weekOffset]);

  // Filter logs to that ISO week
  const { items, total } = useMemo(() => {
    const selected = logs
      .filter((l) => isoWeekKey(new Date(l.timestamp)).key === targetKey)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    const sum = selected.reduce((s, l) => s + (Number(l.hoursAdded) || 0), 0);
    return { items: selected, total: sum };
  }, [logs, targetKey]);

  const handleSaveLog = (logId: string, data: any) => {
    updateLogMutation.mutate(
      { logId, data },
      {
        onSuccess: () => {
          setEditingLogId(null);
        },
        onError: (error) => {
          console.error("Failed to update log:", error);
          // You might want to show a toast notification here
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
  };

  return (
    <div className="mt-8">
      <h2 className="mb-2 text-xl font-semibold">
        Your Logged Hours – {monday.toLocaleDateString()} →{" "}
        {sunday.toLocaleDateString()}
      </h2>
      {isLoading ? (
        <p>Loading your logs...</p>
      ) : isError ? (
        <p className="text-red-600">Error: {error?.message}</p>
      ) : items.length === 0 ? (
        <p>No logs for this week.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((log) =>
              editingLogId === log.$id ? (
                <EditingLog
                  key={log.$id}
                  log={log}
                  onSave={handleSaveLog}
                  onCancel={handleCancelEdit}
                  isUpdating={updateLogMutation.isPending}
                />
              ) : (
                <LogItem
                  key={log.$id}
                  log={log}
                  onEdit={() => setEditingLogId(log.$id)}
                />
              )
            )}
          </ul>
          <div className="mt-3 border-t pt-3 text-right text-sm">
            <span className="font-medium">Weekly total: </span>
            {total.toFixed(2)} h
          </div>
        </>
      )}
    </div>
  );
}
