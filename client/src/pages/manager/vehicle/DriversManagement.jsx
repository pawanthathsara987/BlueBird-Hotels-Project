import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Plus, RefreshCw, Users } from "lucide-react";
import DriverForm from "./DriverForm";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>{children}</div>
);

const formatMoney = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : "$0.00";
};

export default function DriversManagement() {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
  const [drivers, setDrivers] = useState([]);
  const [driverPricing, setDriverPricing] = useState({ id: 1, driverPricePerDay: 0 });
  const [loading, setLoading] = useState(true);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceSaving, setPriceSaving] = useState(false);
  const [error, setError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [priceForm, setPriceForm] = useState("0");
  const [showForm, setShowForm] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("managerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken");
  const config = useMemo(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    [token]
  );

  const fetchDriverPrice = useCallback(async () => {
    try {
      setPriceLoading(true);
      const res = await axios.get(`${backendBaseUrl}/manager/driver-price`, config);
      const setting = res.data?.data || { id: 1, driverPricePerDay: 0 };
      setDriverPricing(setting);
      setPriceForm(String(setting.driverPricePerDay ?? 0));
      setPriceError("");
    } catch (err) {
      setPriceError(err.response?.data?.message || err.message || "Failed to load driver price");
    } finally {
      setPriceLoading(false);
    }
  }, [backendBaseUrl, config]);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendBaseUrl}/manager/drivers`, config);
      setDrivers(res.data?.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load drivers");
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, [backendBaseUrl, config]);

  useEffect(() => {
    fetchDrivers();
    fetchDriverPrice();
  }, [fetchDrivers, fetchDriverPrice]);

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

  const handleSaveDriverPrice = async (e) => {
    e.preventDefault();
    try {
      setPriceSaving(true);
      const res = await axios.put(`${backendBaseUrl}/manager/driver-price`, { driverPricePerDay: priceForm }, config);
      const setting = res.data?.data || driverPricing;
      setDriverPricing(setting);
      setPriceForm(String(setting.driverPricePerDay ?? priceForm));
      setPriceError("");
      toast.success("Driver price updated");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to update driver price";
      const apiErrors = err.response?.data?.errors;
      setPriceError(apiErrors?.driverPricePerDay || msg);
      toast.error(msg);
    } finally {
      setPriceSaving(false);
    }
  };

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

        <Card>
          <form onSubmit={handleSaveDriverPrice} className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500">Shared Driver Price Per Day</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={priceForm}
                onChange={(e) => setPriceForm(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 outline-none border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                placeholder="Enter shared driver price"
              />
              <p className="text-xs text-slate-500 mt-1">This price is used for every driver.</p>
              {priceError && <p className="text-xs text-red-500 mt-1">{priceError}</p>}
            </div>
            <div className="md:w-56">
              <div className="text-xs font-semibold text-slate-500 mb-1">Current shared price</div>
              <div className="text-2xl font-black text-emerald-700">{priceLoading ? 'Loading...' : formatMoney(driverPricing.driverPricePerDay)}</div>
            </div>
            <button type="submit" disabled={priceSaving || priceLoading} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-60">
              {priceSaving ? 'Saving...' : 'Save Price'}
            </button>
          </form>
        </Card>

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
                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 shrink-0">
                  {d.driverImage ? <img src={d.driverImage} alt={d.fullName} className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{d.fullName}</h3>
                      <p className="text-sm text-slate-600">{d.phone} • {d.nicNo}</p>
                      <p className="text-sm text-slate-500">{Array.isArray(d.languageSkills) ? d.languageSkills.join(', ') : (d.languageSkills || '')}</p>
                      <p className="text-sm font-semibold text-emerald-700 mt-1">Shared driver price: {formatMoney(driverPricing.driverPricePerDay)}</p>
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
