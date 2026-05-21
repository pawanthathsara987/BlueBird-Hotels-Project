import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Plus, RefreshCw, Pencil, Trash2, Users } from "lucide-react";
import DriverForm from "./DriverForm";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>{children}</div>
);

export default function DriversManagement() {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("managerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get(`${backendBaseUrl}/manager/drivers`, config);
      setDrivers(res.data?.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load drivers");
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const stats = useMemo(() => {
    const total = drivers.length;
    const active = drivers.filter((d) => d.status === "active").length;
    const onLeave = drivers.filter((d) => d.status === "on_leave").length;
    return { total, active, onLeave };
  }, [drivers]);

  const openAdd = () => { setSelectedDriver(null); setShowForm(true); };
  const openEdit = (d) => { setSelectedDriver(d); setShowForm(true); };
  const closeForm = () => { setSelectedDriver(null); setShowForm(false); };

  const handleSaved = async () => { await fetchDrivers(); closeForm(); };

  const handleDelete = async (d) => {
    if (!confirm(`Delete driver ${d.fullName}?`)) return;
    try {
      setDeletingId(d.id);
      const token = localStorage.getItem("managerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`${backendBaseUrl}/manager/drivers/${d.id}`, config);
      setDrivers((prev) => prev.filter((x) => x.id !== d.id));
      toast.success("Driver deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete driver");
    } finally { setDeletingId(null); }
  };

  return (
    <div className="min-h-full bg-linear-to-b from-sky-50 via-blue-50 to-slate-50 px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-100 text-blue-700 text-sm font-semibold mb-3">
              <Users className="w-4 h-4" />
              Driver Management
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-800">Drivers</h1>
            <p className="text-slate-500 mt-2 max-w-2xl">Manage drivers, licenses, availability and profiles.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={fetchDrivers} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-white text-slate-700">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white">
              <Plus className="w-4 h-4" /> Add Driver
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-4">
          <div className="rounded-2xl p-5 border bg-white">Total<br/><div className="text-2xl font-bold">{stats.total}</div></div>
          <div className="rounded-2xl p-5 border bg-white">Active<br/><div className="text-2xl font-bold">{stats.active}</div></div>
          <div className="rounded-2xl p-5 border bg-white">On Leave<br/><div className="text-2xl font-bold">{stats.onLeave}</div></div>
        </div>

        {loading && <Card><div className="py-16 text-center">Loading drivers...</div></Card>}

        {!loading && error && <Card><div className="py-10 text-center text-red-600">{error}</div></Card>}

        {!loading && !error && drivers.length === 0 && (
          <Card>
            <div className="py-20 text-center">
              <h2 className="text-2xl font-bold">No drivers yet</h2>
              <p className="text-slate-500 mt-2">Add a driver using the button on the top-right.</p>
            </div>
          </Card>
        )}

        {!loading && drivers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivers.map((d) => (
              <Card key={d.id} className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                  {d.driverImage ? <img src={d.driverImage} alt={d.fullName} className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{d.fullName}</h3>
                      <p className="text-sm text-slate-600">{d.phone} • {d.nicNo}</p>
                      <p className="text-sm text-slate-500">{Array.isArray(d.languageSkills) ? d.languageSkills.join(', ') : (d.languageSkills || '')}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => openEdit(d)} className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500 text-white">Edit</button>
                      <button disabled={deletingId===d.id} onClick={() => handleDelete(d)} className="inline-flex items-center gap-2 px-3 py-1 rounded bg-rose-600 text-white">{deletingId===d.id ? 'Deleting...' : 'Delete'}</button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm overflow-y-auto py-8 px-4">
            <div className="max-w-3xl mx-auto">
              <DriverForm driver={selectedDriver} onCancel={closeForm} onSaved={handleSaved} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
