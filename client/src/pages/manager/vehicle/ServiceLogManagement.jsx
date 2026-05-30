import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Wrench, Plus, Search, Pencil, Trash2, X, ChevronDown,
  Calendar, DollarSign, Gauge, FileText, AlertCircle, Check
} from "lucide-react";

const API = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

const SERVICE_TYPES = [
  { value: "oil_change", label: "Oil Change" },
  { value: "tire", label: "Tire Service" },
  { value: "brake", label: "Brake Service" },
  { value: "engine", label: "Engine Repair" },
  { value: "body_repair", label: "Body Repair" },
  { value: "general_service", label: "General Service" },
  { value: "insurance_renewal", label: "Insurance Renewal" },
  { value: "license_renewal", label: "License Renewal" },
  { value: "wash_detail", label: "Wash / Detail" },
  { value: "other", label: "Other" },
];

const typeLabel = (val) => SERVICE_TYPES.find((t) => t.value === val)?.label || val;

const typeBadgeColor = (val) => {
  const map = {
    oil_change: "bg-amber-100 text-amber-800",
    tire: "bg-slate-100 text-slate-800",
    brake: "bg-red-100 text-red-800",
    engine: "bg-orange-100 text-orange-800",
    body_repair: "bg-purple-100 text-purple-800",
    general_service: "bg-blue-100 text-blue-800",
    insurance_renewal: "bg-emerald-100 text-emerald-800",
    license_renewal: "bg-teal-100 text-teal-800",
    wash_detail: "bg-cyan-100 text-cyan-800",
    other: "bg-gray-100 text-gray-700",
  };
  return map[val] || "bg-gray-100 text-gray-700";
};

const money = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";
};

const EMPTY_FORM = {
  vehicleId: "",
  serviceType: "",
  description: "",
  servicedAt: new Date().toISOString().split("T")[0],
  mileageAtService: "",
  cost: "",
  vendor: "",
  performedBy: "",
  nextServiceDue: "",
  nextServiceMileage: "",
  notes: "",
};

export default function ServiceLogManagement() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchParams] = useSearchParams();
  const [filterVehicle, setFilterVehicle] = useState(searchParams.get("vehicle") || "");
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [receiptFile, setReceiptFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Load ─────────────────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true);
      const [logsRes, vehiclesRes] = await Promise.all([
        axios.get(`${API}/manager/service-logs`),
        axios.get(`${API}/vehicles`),
      ]);
      setLogs(Array.isArray(logsRes.data?.data) ? logsRes.data.data : []);
      setVehicles(Array.isArray(vehiclesRes.data?.data) ? vehiclesRes.data.data : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Filter ───────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter((log) => {
      if (filterVehicle && String(log.vehicleId) !== filterVehicle) return false;
      if (filterType && log.serviceType !== filterType) return false;
      if (q) {
        const haystack = `${log.description || ""} ${log.vendor || ""} ${log.performedBy || ""} ${log.vehicle?.plateNumber || ""} ${log.vehicle?.brand || ""} ${log.vehicle?.model || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [logs, filterVehicle, filterType, search]);

  // ── Open modal ───────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setReceiptFile(null);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (log) => {
    setEditingId(log.id);
    setForm({
      vehicleId: String(log.vehicleId || ""),
      serviceType: log.serviceType || "",
      description: log.description || "",
      servicedAt: log.servicedAt || "",
      mileageAtService: log.mileageAtService ?? "",
      cost: log.cost ?? "",
      vendor: log.vendor || "",
      performedBy: log.performedBy || "",
      nextServiceDue: log.nextServiceDue || "",
      nextServiceMileage: log.nextServiceMileage ?? "",
      notes: log.notes || "",
    });
    setReceiptFile(null);
    setFormErrors({});
    setModalOpen(true);
  };

  // ── Save ─────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== null && val !== undefined && val !== "") formData.append(key, val);
      });
      if (receiptFile) formData.append("receiptImage", receiptFile);

      if (editingId) {
        await axios.put(`${API}/manager/service-logs/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post(`${API}/manager/service-logs`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        setFormErrors({ _general: err.response?.data?.message || err.message });
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/manager/service-logs/${deleteId}`);
      setDeleteId(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── Stats ────────────────────────────────────────
  const totalCost = useMemo(() => filtered.reduce((acc, l) => acc + Number(l.cost || 0), 0), [filtered]);
  const upcomingServices = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
    return logs.filter((l) => l.nextServiceDue && l.nextServiceDue >= today && l.nextServiceDue <= thirtyDays);
  }, [logs]);

  // ── Vehicle helper ───────────────────────────────
  const vehicleName = (log) => {
    const v = log.vehicle;
    if (v) return `${v.brand || ""} ${v.model || ""} (${v.plateNumber})`.trim();
    const found = vehicles.find((veh) => veh.id === log.vehicleId);
    if (found) return `${found.brand || ""} ${found.model || ""} (${found.plateNumber})`.trim();
    return `Vehicle #${log.vehicleId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="h-6 w-6 text-blue-600" /> Service Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track vehicle maintenance, service history, and upcoming due dates.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition">
          <Plus className="h-4 w-4" /> Add Service Log
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Total Records</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{filtered.length}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Total Cost</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">{money(totalCost)}</div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wide text-amber-600">Due in 30 Days</div>
          <div className="mt-1 text-2xl font-bold text-amber-800">{upcomingServices.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description, vendor, plate..."
            className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400">
          <option value="">All vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={String(v.id)}>{v.brand} {v.model} ({v.plateNumber})</option>
          ))}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400">
          <option value="">All types</option>
          {SERVICE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">Loading service logs...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <Wrench className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-lg font-semibold text-slate-700">No service logs found</p>
          <p className="text-sm text-slate-500">Add a service log to start tracking maintenance.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Mileage</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Next Due</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{vehicleName(log)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${typeBadgeColor(log.serviceType)}`}>
                      {typeLabel(log.serviceType)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-[220px] truncate">{log.description}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-700">{log.servicedAt}</td>
                  <td className="px-4 py-3 text-slate-700">{log.mileageAtService ? `${Number(log.mileageAtService).toLocaleString()} km` : "—"}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{money(log.cost)}</td>
                  <td className="px-4 py-3 text-slate-600">{log.vendor || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {log.nextServiceDue ? (
                      <span className={`text-xs font-semibold ${new Date(log.nextServiceDue) < new Date() ? "text-red-600" : "text-slate-700"}`}>
                        {log.nextServiceDue}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1 items-center">
                      {log.receiptUrl && (
                        <a href={log.receiptUrl} target="_blank" rel="noreferrer" className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50 transition" title="View Receipt">
                          <FileText className="h-4 w-4" />
                        </a>
                      )}
                      <button onClick={() => openEdit(log)} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(log.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit Modal ────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit Service Log" : "Add Service Log"}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {formErrors._general && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {formErrors._general}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehicle */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vehicle *</label>
                  <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="">Select vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={String(v.id)}>{v.brand} {v.model} ({v.plateNumber})</option>
                    ))}
                  </select>
                  {formErrors.vehicleId && <p className="text-xs text-red-600 mt-1">{formErrors.vehicleId}</p>}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Service Type *</label>
                  <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="">Select type</option>
                    {SERVICE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  {formErrors.serviceType && <p className="text-xs text-red-600 mt-1">{formErrors.serviceType}</p>}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Service Date *</label>
                  <input type="date" value={form.servicedAt} onChange={(e) => setForm({ ...form, servicedAt: e.target.value })} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  {formErrors.servicedAt && <p className="text-xs text-red-600 mt-1">{formErrors.servicedAt}</p>}
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mileage (km)</label>
                  <input type="number" min="0" value={form.mileageAtService} onChange={(e) => setForm({ ...form, mileageAtService: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="e.g. 45000" />
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cost ($)</label>
                  <input type="number" min="0" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="0.00" />
                  {formErrors.cost && <p className="text-xs text-red-600 mt-1">{formErrors.cost}</p>}
                </div>

                {/* Vendor */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vendor / Workshop</label>
                  <input type="text" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="e.g. AutoPro Garage" />
                </div>

                {/* Performed by */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Performed By</label>
                  <input type="text" value={form.performedBy} onChange={(e) => setForm({ ...form, performedBy: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="Mechanic name" />
                </div>

                {/* Next service due */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Next Service Due</label>
                  <input type="date" value={form.nextServiceDue} onChange={(e) => setForm({ ...form, nextServiceDue: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>

                {/* Next service mileage */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Next Service Mileage</label>
                  <input type="number" min="0" value={form.nextServiceMileage} onChange={(e) => setForm({ ...form, nextServiceMileage: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="e.g. 50000" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description *</label>
                <textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="What was done?" />
                {formErrors.description && <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Notes</label>
                <textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="Additional notes..." />
              </div>

              {/* Receipt File */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Receipt / Invoice (Image or PDF)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formErrors.receiptImage && <p className="text-xs text-red-600 mt-1">{formErrors.receiptImage}</p>}
                {editingId && (
                  <p className="text-xs text-slate-500 mt-1">Uploading a new file will replace the existing receipt.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition">
                  {saving ? "Saving..." : editingId ? "Update Log" : "Create Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ─────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeleteId(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">Delete Service Log?</h3>
            <p className="mt-2 text-sm text-slate-600">This action cannot be undone. The record will be permanently removed.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
