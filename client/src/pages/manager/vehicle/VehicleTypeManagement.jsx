import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, CarFront, RefreshCw } from "lucide-react";
import VehicleTypeForm from "./vehicleTypeForm";

export default function VehicleTypeManagement() {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
  
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("managerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken");
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const fetchVehicleTypes = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${backendBaseUrl}/vehicle-types`, config);
      setVehicleTypes(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load vehicle types.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const openAddForm = () => {
    setSelectedType(null);
    setShowForm(true);
  };

  const openEditForm = (type) => {
    setSelectedType(type);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedType(null);
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Are you sure you want to delete the vehicle type "${name}"?`);
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await axios.delete(`${backendBaseUrl}/vehicle-types/${id}`, config);
      setVehicleTypes(prev => prev.filter(vt => vt.id !== id));
      toast.success("Vehicle type deleted successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete vehicle type.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-full bg-linear-to-b from-sky-50 via-blue-50 to-slate-50 px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-100 text-blue-700 text-sm font-semibold mb-3">
              <CarFront className="w-4 h-4" />
              Vehicle Categories
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-800">Vehicle Types</h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Manage the types of vehicles available in your fleet (e.g. SUV, Sedan, Luxury).
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchVehicleTypes}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle Type
            </button>
          </div>
        </div>

        {/* List Section */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-20 text-center text-slate-500">
            Loading vehicle types...
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-20 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
            <button onClick={fetchVehicleTypes} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold">Retry</button>
          </div>
        ) : vehicleTypes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-20 text-center">
            <CarFront className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">No Vehicle Types</h2>
            <p className="text-slate-500 mt-2">Use the button above to add your first vehicle type.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Max Capacity</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Description</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicleTypes.map((type) => (
                    <tr key={type.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">{type.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
                          {type.maxCapacity} seats
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell max-w-xs truncate">
                        {type.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditForm(type)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(type.id, type.name)}
                            disabled={deletingId === type.id}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Popup Modal for Add/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <VehicleTypeForm
              vehicleType={selectedType}
              onCancel={closeForm}
              onSaved={() => {
                fetchVehicleTypes();
                closeForm();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
