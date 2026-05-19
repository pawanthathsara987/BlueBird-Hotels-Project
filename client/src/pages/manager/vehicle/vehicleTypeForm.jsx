import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { X, Save } from "lucide-react";

export default function VehicleTypeForm({ onCancel, onSaved }) {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!maxCapacity || Number(maxCapacity) <= 0) e.maxCapacity = "Enter a valid capacity";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("managerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const payload = { name: name.trim(), description: description.trim() || null, maxCapacity: Number(maxCapacity) };
      const res = await axios.post(`${backendBaseUrl}/vehicle-types`, payload, config);
      toast.success("Vehicle type created.");
      if (onSaved) onSaved(res.data?.data ?? null);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to create vehicle type.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Add Vehicle Type</h3>
          <p className="text-sm text-slate-500 mt-1">Create a vehicle type for categorizing fleet vehicles.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700">
            <X className="w-4 h-4" />
            Close
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase">Name <span className="text-red-500">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50" placeholder="e.g. Sedan, Van, SUV" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50" rows={3} />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase">Max Capacity <span className="text-red-500">*</span></label>
          <input type="number" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50" />
          {errors.maxCapacity && <p className="text-xs text-red-500 mt-1">{errors.maxCapacity}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white">
            <Save className="w-4 h-4" /> {isSubmitting ? "Saving..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
