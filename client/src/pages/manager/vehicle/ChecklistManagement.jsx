import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { ClipboardCheck, Plus, Search, Pencil, Trash2, X, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";

const API = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

const EMPTY_FORM = {
  bookingId: "",
  vehicleId: "",
  type: "pickup",
  inspectedBy: "",
  inspectedAt: new Date().toISOString().slice(0, 16),
  fuelLevel: "Full",
  mileage: "",
  exteriorBody: "ok",
  tires: "ok",
  windshield: "ok",
  lights: "ok",
  mirrors: "ok",
  interior: "ok",
  ac: "ok",
  damageNotes: "",
  customerSignature: false,
};

const STATUS_ICONS = {
  ok: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  damaged: <AlertTriangle className="h-4 w-4 text-red-500" />,
  missing: <AlertTriangle className="h-4 w-4 text-orange-500" />,
  na: <HelpCircle className="h-4 w-4 text-slate-400" />
};

export default function ChecklistManagement() {
  const [checklists, setChecklists] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // ── Load Data ──────────────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true);
      const [chkRes, bkgRes] = await Promise.all([
        axios.get(`${API}/manager/checklists`),
        axios.get(`${API}/manager/vehicle-bookings`),
      ]);
      setChecklists(chkRes.data?.data || []);
      setBookings(bkgRes.data?.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Handlers ───────────────────────────────────────
  const filtered = useMemo(() => {
    return checklists.filter(c => {
      if (filterType && c.type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        const v = c.vehicle;
        const b = c.booking;
        const text = `${c.inspectedBy} ${v?.plateNumber} ${v?.brand} ${v?.model} BKG-${c.bookingId}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [checklists, search, filterType]);

  const handleBookingChange = (bkgId) => {
    const bkg = bookings.find(b => b.id === Number(bkgId));
    setForm({ ...form, bookingId: bkgId, vehicleId: bkg ? String(bkg.vehicleId) : "" });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${API}/manager/checklists/${editingId}`, form);
      } else {
        await axios.post(`${API}/manager/checklists`, form);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/manager/checklists/${deleteId}`);
      setDeleteId(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      ...item,
      bookingId: String(item.bookingId),
      vehicleId: String(item.vehicleId),
      inspectedAt: new Date(item.inspectedAt).toISOString().slice(0, 16),
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-blue-600" /> Inspections / Checklists
          </h1>
          <p className="text-sm text-slate-500 mt-1">Pre-trip and post-trip vehicle condition reports.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition">
          <Plus className="h-4 w-4" /> Add Checklist
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by plate, inspector, booking ID..."
            className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400">
          <option value="">All Types</option>
          <option value="pickup">Pre-trip (Pickup)</option>
          <option value="return">Post-trip (Return)</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">Loading checklists...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <ClipboardCheck className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-lg font-semibold text-slate-700">No checklists found</p>
          <p className="text-sm text-slate-500">Add an inspection record for a booking to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Inspector</th>
                <th className="px-4 py-3">Mileage</th>
                <th className="px-4 py-3">Fuel</th>
                <th className="px-4 py-3">Condition (Ext/Int)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((chk) => (
                <tr key={chk.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-medium text-slate-900">BKG-{chk.bookingId}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{chk.vehicle?.plateNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${chk.type === 'pickup' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {chk.type === 'pickup' ? 'Pre-trip' : 'Post-trip'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{new Date(chk.inspectedAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700">{chk.inspectedBy}</td>
                  <td className="px-4 py-3 text-slate-700">{chk.mileage} km</td>
                  <td className="px-4 py-3 text-slate-700">{chk.fuelLevel}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span title={`Exterior: ${chk.exteriorBody}`}>{STATUS_ICONS[chk.exteriorBody]}</span>
                      <span title={`Interior: ${chk.interior}`}>{STATUS_ICONS[chk.interior]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(chk)} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteId(chk.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Form Modal ───────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex justify-between border-b border-slate-100 bg-white px-6 py-4 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit Checklist" : "Add Checklist"}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Booking</label>
                  <select required disabled={!!editingId} value={form.bookingId} onChange={(e) => handleBookingChange(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50">
                    <option value="">Select booking</option>
                    {bookings.map(b => (
                      <option key={b.id} value={b.id}>BKG-{b.id} (Vehicle #{b.vehicleId})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Type</label>
                  <select required value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400">
                    <option value="pickup">Pre-trip (Pickup)</option>
                    <option value="return">Post-trip (Return)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Date & Time</label>
                  <input type="datetime-local" required value={form.inspectedAt} onChange={(e) => setForm({...form, inspectedAt: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Inspector Name</label>
                  <input type="text" required value={form.inspectedBy} onChange={(e) => setForm({...form, inspectedBy: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mileage (km)</label>
                  <input type="number" required value={form.mileage} onChange={(e) => setForm({...form, mileage: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Fuel Level</label>
                  <select required value={form.fuelLevel} onChange={(e) => setForm({...form, fuelLevel: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400">
                    <option value="Empty">Empty</option>
                    <option value="1/4">1/4</option>
                    <option value="1/2">1/2</option>
                    <option value="3/4">3/4</option>
                    <option value="Full">Full</option>
                  </select>
                </div>
              </div>

              <h3 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-100 pb-2 mb-4">Condition Report</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {['exteriorBody', 'tires', 'windshield', 'lights', 'mirrors', 'interior', 'ac'].map(field => (
                  <div key={field}>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                    <select value={form[field]} onChange={(e) => setForm({...form, [field]: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400">
                      <option value="ok">✅ OK</option>
                      <option value="damaged">❌ Damaged</option>
                      <option value="missing">⚠️ Missing</option>
                      <option value="na">➖ N/A</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Damage Notes</label>
                <textarea rows="3" value={form.damageNotes} onChange={(e) => setForm({...form, damageNotes: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="Describe any damage..."></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Saving..." : "Save Checklist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* ── Delete Confirm ─────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setDeleteId(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">Delete Checklist?</h3>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
              <button onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
