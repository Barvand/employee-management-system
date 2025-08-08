import { useUserLogsStore } from "../stores/UserStatsStore";
import { useEffect } from "react";

function HourReview({ userId }) {
  const { logs, fetchLogs, loading: logsLoading } = useUserLogsStore();

  useEffect(() => {
    if (userId) fetchLogs(userId);
  }, [userId]);

  return (
    <div>
      {/** After the submit button and success message **/}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Your Logged Hours</h2>

        {logsLoading ? (
          <p>Loading your logs...</p>
        ) : logs.length === 0 ? (
          <p>No logs yet.</p>
        ) : (
          <ul className="space-y-4">
            {logs.map((log) => (
              <li key={log.$id} className="border p-3 rounded shadow">
                <p className="font-medium">
                  {new Date(log.timestamp).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700">
                  {log.startTime} → {log.endTime} ({log.hoursAdded}h total,
                  break: {log.breakMinutes} min)
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default HourReview;
