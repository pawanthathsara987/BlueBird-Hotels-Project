import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { CarFront, Plus, RefreshCw, Pencil, Trash2, Users, Fuel, Banknote, Image as ImageIcon } from "lucide-react";
import VehicleForm from "./vehicleForm";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ label, value, accent }) => (
  <div className={`rounded-2xl p-5 border ${accent} bg-white shadow-sm`}>
    <p className="text-sm text-slate-500 font-medium">{label}</p>
    <p className="text-3xl font-black text-slate-800 mt-2">{value}</p>
  </div>
);

function getStatusStyles(status) {
  switch (status) {
    case "available":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "maintenance":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "retired":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-rose-50 text-rose-700 border-rose-200";
  }
}

function getStatusCardStyles(status) {
  switch (status) {
    case "available":
      return "border-emerald-200/80 bg-linear-to-br from-emerald-50/40 via-white to-white";
    case "maintenance":
      return "border-amber-200/80 bg-linear-to-br from-amber-50/40 via-white to-white";
    case "retired":
      return "border-slate-200 bg-linear-to-br from-slate-100/50 via-white to-white";
    default:
      return "border-rose-200/80 bg-linear-to-br from-rose-50/40 via-white to-white";
  }
}

export default function VehicleManagement() {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendBaseUrl}/vehicles`);
      setVehicles(Array.isArray(response.data?.data) ? response.data.data : []);
      setError("");
    } catch (requestError) {
      const message = requestError.response?.data?.message || requestError.message || "Failed to load vehicles.";
      setError(message);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [backendBaseUrl]);

  const stats = useMemo(() => {
    const total = vehicles.length;
    const available = vehicles.filter((vehicle) => vehicle.status === "available").length;
    const maintenance = vehicles.filter((vehicle) => vehicle.status === "maintenance").length;
    const averagePrice =
      total > 0
        ? vehicles.reduce((sum, vehicle) => sum + (Number(vehicle.pricePerDay) || 0), 0) / total
        : 0;

    return { total, available, maintenance, averagePrice };
  }, [vehicles]);

  const openAddForm = () => {
    setSelectedVehicle(null);
    setShowForm(true);
  };

  const openEditForm = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedVehicle(null);
  };

  const handleSaved = async () => {
    await fetchVehicles();
    closeForm();
  };

  const handleDeleteVehicle = async (vehicle) => {
    const confirmed = window.confirm(
      `Delete vehicle ${vehicle.plateNumber || ""}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(vehicle.id);
      const token = localStorage.getItem("managerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      await axios.delete(`${backendBaseUrl}/vehicles/${vehicle.id}`, config);
      setVehicles((prev) => prev.filter((item) => item.id !== vehicle.id));
      toast.success("Vehicle deleted successfully.");
    } catch (requestError) {
      const message = requestError.response?.data?.message || requestError.message || "Failed to delete vehicle.";
      toast.error(message);
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-full bg-linear-to-b from-sky-50 via-blue-50 to-slate-50 px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-100 text-blue-700 text-sm font-semibold mb-3">
              <CarFront className="w-4 h-4" />
              Manager Vehicles
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-800">Vehicle Management</h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Add, review, and maintain the hotel vehicle inventory from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchVehicles}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Vehicles" value={stats.total} accent="border-slate-200" />
          <StatCard label="Available" value={stats.available} accent="border-emerald-200" />
          <StatCard label="Maintenance" value={stats.maintenance} accent="border-amber-200" />
          <StatCard
            label="Average Price / Day"
            value={`$${stats.averagePrice.toFixed(0)}`}
            accent="border-blue-200"
          />
        </div>

        {loading && (
          <Card>
            <div className="py-20 text-center text-slate-600">Loading vehicles...</div>
          </Card>
        )}

        {!loading && error && (
          <Card>
            <div className="py-10 text-center">
              <p className="text-red-600 font-semibold">{error}</p>
              <button
                type="button"
                onClick={fetchVehicles}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </Card>
        )}

        {!loading && !error && vehicles.length === 0 && (
          <Card>
            <div className="py-20 text-center">
              <CarFront className="w-12 h-12 text-blue-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800">No vehicles yet</h2>
              <p className="text-slate-500 mt-2">Use the Add Vehicle button to create the first record.</p>
              <button
                type="button"
                onClick={openAddForm}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Vehicle
              </button>
            </div>
          </Card>
        )}

        {!loading && !error && vehicles.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className={`flex flex-col gap-4 border shadow-sm hover:shadow-lg transition-all duration-200 ${getStatusCardStyles(vehicle.status)}`}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-44 h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                    {vehicle.image ? (
                      <img src={vehicle.image} alt={`${vehicle.brand || "Vehicle"} ${vehicle.model || ""}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-7 h-7 mb-2" />
                        <span className="text-xs font-semibold">No image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-2xl font-black tracking-tight text-slate-800">
                            {vehicle.brand || "Vehicle"} {vehicle.model}
                          </h2>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(vehicle.status)}`}>
                            {vehicle.status || "unknown"}
                          </span>
                        </div>
                        <p className="text-slate-500 mt-1">{vehicle.vehicleType || "-"} • Plate {vehicle.plateNumber || "-"}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(vehicle)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVehicle(vehicle)}
                          disabled={deletingId === vehicle.id}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deletingId === vehicle.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mt-4">
                      <div className="rounded-xl bg-white/80 border border-slate-200 p-3">
                        <p className="text-slate-500 text-xs font-semibold mb-1">Capacity</p>
                        <p className="font-semibold text-slate-800 inline-flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-blue-600" />
                          {vehicle.capacity ?? "-"} seats
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/80 border border-slate-200 p-3">
                        <p className="text-slate-500 text-xs font-semibold mb-1">Fuel</p>
                        <p className="font-semibold text-slate-800 inline-flex items-center gap-1.5">
                          <Fuel className="w-4 h-4 text-blue-600" />
                          {vehicle.fuelType || "-"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/80 border border-slate-200 p-3 col-span-2 md:col-span-1">
                        <p className="text-slate-500 text-xs font-semibold mb-1">Price / Day</p>
                        <p className="font-semibold text-slate-800 inline-flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-blue-600" />
                          ${Number(vehicle.pricePerDay || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {vehicle.description && (
                  <p className="text-sm text-slate-600 leading-6 border-t border-slate-200 pt-4">{vehicle.description}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {Array.isArray(vehicle.features) && vehicle.features.length > 0 ? (
                    vehicle.features.map((feature) => (
                      <span key={feature} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                        {feature}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No features listed</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm overflow-y-auto py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <VehicleForm vehicle={selectedVehicle} onCancel={closeForm} onSaved={handleSaved} />
          </div>
        </div>
      )}
    </div>
  );
}