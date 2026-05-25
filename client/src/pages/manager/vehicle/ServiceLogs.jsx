import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function ServiceLogs() {
  const { vehicleId } = useParams();
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
  const token = localStorage.getItem('managerToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
  const config = useMemo(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    [token]
  );

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ serviceType: "", performedAt: "", cost: "", performedBy: "", nextServiceDue: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendBaseUrl}/vehicles/${vehicleId}/service-logs`, config);
      setLogs(res.data?.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load service logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [backendBaseUrl, vehicleId, config]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.serviceType) return setError('Service type is required');
    try {
      setSubmitting(true);
      setError("");
      const payload = { ...form };
      await axios.post(`${backendBaseUrl}/vehicles/${vehicleId}/service-logs`, payload, config);
      setForm({ serviceType: "", performedAt: "", cost: "", performedBy: "", nextServiceDue: "", description: "" });
      await fetchLogs();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create service log');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service log?')) return;
    try {
      await axios.delete(`${backendBaseUrl}/service-logs/${id}`, config);
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/manager/vehicles" className="text-sky-600 inline-flex items-center gap-2"> <ArrowLeft /> Back to vehicles</Link>
          <h1 className="text-2xl font-bold">Service Logs</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border p-4">
              <h2 className="font-semibold mb-4">Recent service logs</h2>
              {loading ? (
                <div className="py-8 text-center text-slate-500">Loading...</div>
              ) : error ? (
                <div className="py-6 text-center text-rose-600">{error}</div>
              ) : logs.length === 0 ? (
                <div className="py-8 text-center text-slate-500">No service logs found.</div>
              ) : (
                <ul className="space-y-3">
                  {logs.map((log) => (
                    <li key={log.id} className="flex items-start justify-between gap-4 rounded-xl border p-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-bold">{log.serviceType}</div>
                          <div className="text-xs text-slate-500">• {new Date(log.performedAt).toLocaleDateString()}</div>
                        </div>
                        <div className="text-sm text-slate-600">{log.description}</div>
                        <div className="text-xs text-slate-500 mt-2">By: {log.performedBy || '—'} • Cost: ${Number(log.cost || 0).toFixed(2)}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xs text-slate-400">Next: {log.nextServiceDue ? new Date(log.nextServiceDue).toLocaleDateString() : '—'}</div>
                        <button onClick={() => handleDelete(log.id)} className="inline-flex items-center gap-2 text-sm text-rose-600">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside>
            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Add service log</h3>
                <div className="text-xs text-slate-400">{logs.length} logs</div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold">Service Type</label>
                  <input value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs font-semibold">Performed At</label>
                  <input type="date" value={form.performedAt} onChange={(e) => setForm({ ...form, performedAt: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs font-semibold">Cost</label>
                  <input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs font-semibold">Performed By</label>
                  <input value={form.performedBy} onChange={(e) => setForm({ ...form, performedBy: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs font-semibold">Next Service Due</label>
                  <input type="date" value={form.nextServiceDue} onChange={(e) => setForm({ ...form, nextServiceDue: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs font-semibold">Description</label>
                  <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
                </div>

                {error && <div className="text-xs text-rose-600">{error}</div>}

                <div>
                  <button disabled={submitting} type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 text-white px-4 py-2">
                    <Plus className="w-4 h-4" /> {submitting ? 'Adding...' : 'Add log'}
                  </button>
                </div>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
