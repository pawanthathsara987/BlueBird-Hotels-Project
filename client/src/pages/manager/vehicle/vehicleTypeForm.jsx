import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { X, Save } from "lucide-react";

export default function VehicleTypeForm({ vehicleType, onCancel, onSaved }) {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = !!vehicleType;

  useEffect(() => {
    if (vehicleType) {
      setName(vehicleType.name || "");
      setDescription(vehicleType.description || "");
      setMaxCapacity(vehicleType.maxCapacity || 4);
    }
  }, [vehicleType]);

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

      const payload = { 
        name: name.trim(), 
        description: description.trim() || null, 
        maxCapacity: Number(maxCapacity) 
      };

      if (isEdit) {
        await axios.put(`${backendBaseUrl}/vehicle-types/${vehicleType.id}`, payload, config);
        toast.success("Vehicle type updated.");
      } else {
        await axios.post(`${backendBaseUrl}/vehicle-types`, payload, config);
        toast.success("Vehicle type created.");
      }
      
      if (onSaved) onSaved();
    } catch (err) {
      const message = err.response?.data?.message || err.message || `Failed to ${isEdit ? 'update' : 'create'} vehicle type.`;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{isEdit ? 'Edit Vehicle Type' : 'Add Vehicle Type'}</h3>
          <p className="text-sm text-slate-500 mt-1">{isEdit ? 'Update the details for this category.' : 'Create a new vehicle category.'}</p>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Name <span className="text-red-500">*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white" placeholder="e.g. SUV, Luxury" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Max Capacity <span className="text-red-500">*</span></label>
            <input type="number" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white" />
            {errors.maxCapacity && <p className="text-xs text-red-500 mt-1">{errors.maxCapacity}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white" rows={2} placeholder="Optional description..." />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button type="button" onClick={onCancel} className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
              <Save className="w-4 h-4" /> {isSubmitting ? "Saving..." : (isEdit ? "Update Type" : "Save Type")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
