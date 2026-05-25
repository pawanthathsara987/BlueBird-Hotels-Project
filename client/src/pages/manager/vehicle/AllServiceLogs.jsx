import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

export default function AllServiceLogs() {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
  const token = localStorage.getItem('managerToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
  const config = useMemo(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    [token]
  );
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendBaseUrl}/service-logs`, config);
      setLogs(res.data?.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load service logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [backendBaseUrl, config]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/manager" className="text-sky-600 inline-flex items-center gap-2"> <ArrowLeft /> Back</Link>
          <h1 className="text-2xl font-bold">All Service Logs</h1>
        </div>

        <div className="bg-white rounded-2xl border p-4">
          {loading ? (
            <div className="py-8 text-center text-slate-500">Loading...</div>
          ) : error ? (
            <div className="py-8 text-center text-rose-600">{error}</div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-slate-500">No service logs found.</div>
          ) : (
            <ul className="space-y-3">
              {logs.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-4 rounded-xl border p-3">
                  <div>
                    <div className="font-bold">{log.serviceType} <span className="text-xs text-slate-400">• {new Date(log.performedAt).toLocaleDateString()}</span></div>
                    <div className="text-sm text-slate-600">{log.description}</div>
                    <div className="text-xs text-slate-500 mt-2">Vehicle ID: <Link to={`/manager/vehicles`} className="text-sky-600">{log.vehicleId}</Link> • By: {log.performedBy || '—'}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold">${Number(log.cost || 0).toFixed(2)}</div>
                    <div className="text-xs text-slate-400 mt-1">Next: {log.nextServiceDue ? new Date(log.nextServiceDue).toLocaleDateString() : '—'}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
