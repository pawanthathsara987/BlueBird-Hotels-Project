import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { ClipboardCheck, Plus, Search, Pencil, Trash2, X, CheckCircle, AlertTriangle, HelpCircle, Eye } from "lucide-react";

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
  const [viewItem, setViewItem] = useState(null);

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
        const text = `${c.inspectedBy} ${v?.plateNumber} ${v?.brand} ${v?.model} ${c.booking?.bookingNo || ''} BKG-${c.bookingId}`.toLowerCase();
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
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 text-slate-900">
      {/* Premium Dashboard Header Card */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase bg-blue-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <ClipboardCheck size={12} className="animate-pulse" />
              Quality & Condition
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            Vehicle Checklists & Inspections
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
            Record pre-trip (pickup) and post-trip (return) vehicle safety, mileage, and damage parameters.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto shrink-0">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Checklist
          </button>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto space-y-6">

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
                  <td className="px-4 py-3 font-semibold text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => setViewItem(chk)}>{chk.booking?.bookingNo || `BKG-${chk.bookingId}`}</td>
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
                    <div className="inline-flex gap-1 items-center">
                      <button onClick={() => setViewItem(chk)} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition" title="View Details"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => openEdit(chk)} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition" title="Edit"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(chk.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition" title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
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
                      <option key={b.id} value={b.id}>
                        {b.bookingNo} ({b.vehicle?.brand} {b.vehicle?.model} - {b.vehicle?.plateNumber})
                      </option>
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

      {/* ── View Details Modal ───────────────────────── */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setViewItem(null)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-100" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 z-10 flex justify-between items-center border-b border-slate-100 bg-white px-6 py-5 rounded-t-3xl">
              <div>
                <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${viewItem.type === 'pickup' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {viewItem.type === 'pickup' ? 'Pre-Trip Inspection' : 'Post-Trip Inspection'}
                </span>
                <h2 className="text-lg font-black text-slate-800 tracking-tight mt-1">
                  Inspection Report - {viewItem.booking?.bookingNo || `BKG-${viewItem.bookingId}`}
                </h2>
              </div>
              <button onClick={() => setViewItem(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 transition cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[9px]">Inspector</span>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{viewItem.inspectedBy}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[9px]">Date & Time</span>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{new Date(viewItem.inspectedAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[9px]">Mileage</span>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{Number(viewItem.mileage).toLocaleString()} km</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[9px]">Fuel Level</span>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{viewItem.fuelLevel}</p>
                </div>
              </div>

              {/* Vehicle Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[9px]">Vehicle Details</h4>
                <div className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl bg-white shadow-2xs">
                  <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{viewItem.vehicle?.brand} {viewItem.vehicle?.model}</p>
                    <p className="text-xs font-semibold text-slate-400">Plate Number: <span className="text-slate-600 font-bold">{viewItem.vehicle?.plateNumber}</span></p>
                  </div>
                </div>
              </div>

              {/* Checklist Parameters */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[9px]">Condition Report Checklist</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'exteriorBody', label: 'Exterior Body' },
                    { key: 'tires', label: 'Tires' },
                    { key: 'windshield', label: 'Windshield' },
                    { key: 'lights', label: 'Lights' },
                    { key: 'mirrors', label: 'Mirrors' },
                    { key: 'interior', label: 'Interior' },
                    { key: 'ac', label: 'A/C System' }
                  ].map(param => (
                    <div key={param.key} className="flex justify-between items-center px-4 py-3 border border-slate-100 rounded-xl bg-slate-50/20 hover:bg-slate-50/50 transition">
                      <span className="text-xs font-bold text-slate-600">{param.label}</span>
                      <div className="flex items-center gap-2">
                        {STATUS_ICONS[viewItem[param.key]]}
                        <span className="text-xs font-black uppercase text-slate-700">{viewItem[param.key]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Damage Notes */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[9px]">Damage / Inspection Notes</h4>
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-xs text-slate-600 leading-relaxed min-h-[60px]">
                  {viewItem.damageNotes || 'No damages or issues noted.'}
                </div>
              </div>

              {/* Signature Status */}
              <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div>
                  <h5 className="text-xs font-bold text-slate-700">Customer Signature / Sign-off</h5>
                  <p className="text-[10px] text-slate-400 font-medium">Verify that the guest signed off the terms of this inspection sheet.</p>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${viewItem.customerSignature ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    {viewItem.customerSignature ? <CheckCircle size={12} /> : null}
                    {viewItem.customerSignature ? 'Signed Off' : 'Not Signed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-slate-100 bg-slate-50/20 sticky bottom-0">
              <button onClick={() => setViewItem(null)} className="rounded-2xl bg-slate-800 hover:bg-slate-900 px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition cursor-pointer">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
