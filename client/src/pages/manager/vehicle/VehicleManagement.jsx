import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
    case "booked":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "pending_inspection":
      return "bg-violet-50 text-violet-700 border-violet-200";
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
    case "booked":
      return "border-blue-200/80 bg-linear-to-br from-blue-50/40 via-white to-white";
    case "pending_inspection":
      return "border-violet-200/80 bg-linear-to-br from-violet-50/40 via-white to-white";
    case "maintenance":
      return "border-amber-200/80 bg-linear-to-br from-amber-50/40 via-white to-white";
    case "retired":
      return "border-slate-200 bg-linear-to-br from-slate-100/50 via-white to-white";
    default:
      return "border-rose-200/80 bg-linear-to-br from-rose-50/40 via-white to-white";
  }
}

const getExpiryStatus = (dateString) => {
	if (!dateString) return null;
	const expiry = new Date(dateString);
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
	
	if (diffDays < 0) return { status: 'expired', message: 'Expired' };
	if (diffDays <= 30) return { status: 'expiring', message: `Exp in ${Math.ceil(diffDays)}d` };
	return null;
};

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
            <Link
              to="/manager/vehicle-types"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Manage Vehicle Types
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Vehicles" value={stats.total} accent="border-slate-200" />
          <StatCard label="Available" value={stats.available} accent="border-emerald-200" />
          <StatCard label="Maintenance" value={stats.maintenance} accent="border-amber-200" />
          <StatCard
            label="Average Price / Day"
            value={`${import.meta.env.VITE_CURRENCY_TYPE || "LKR"} ${stats.averagePrice.toFixed(0)}`}
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
                className={`group flex flex-col gap-0 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white rounded-2xl relative ring-1 ring-slate-100 ${getStatusCardStyles(vehicle.status)}`}
              >
                <div className="relative w-full h-48 bg-slate-100 shrink-0 overflow-hidden">
                  {vehicle.image ? (
                    <img 
                      src={vehicle.image} 
                      alt={`${vehicle.brand || "Vehicle"} ${vehicle.model || ""}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-linear-to-br from-slate-50 to-slate-100">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-semibold tracking-wider uppercase opacity-50">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-white/90 border ${getStatusStyles(vehicle.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
                      {vehicle.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-5 md:p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        {vehicle.vehicleType || "Vehicle"}
                      </span>
                      <span className="text-slate-400 text-xs font-semibold px-1">•</span>
                      <span className="text-slate-600 text-xs font-bold font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        {vehicle.plateNumber || "N/A"}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-800 leading-tight">
                      {vehicle.brand || "Vehicle"} {vehicle.model}
                    </h2>
                  </div>

                  {(getExpiryStatus(vehicle.insuranceExpiry) || getExpiryStatus(vehicle.revenueLicenseExpiry)) && (
                    <div className="flex flex-col gap-2 mb-5 p-3 rounded-xl bg-orange-50/50 border border-orange-100/50">
                      {getExpiryStatus(vehicle.insuranceExpiry) && (
                        <div className={`flex items-center gap-2 text-xs font-bold ${getExpiryStatus(vehicle.insuranceExpiry).status === 'expired' ? 'text-red-600' : 'text-orange-600'}`}>
                          <span className="shrink-0">🛡️</span> 
                          <span>Insurance: {getExpiryStatus(vehicle.insuranceExpiry).message}</span>
                        </div>
                      )}
                      {getExpiryStatus(vehicle.revenueLicenseExpiry) && (
                        <div className={`flex items-center gap-2 text-xs font-bold ${getExpiryStatus(vehicle.revenueLicenseExpiry).status === 'expired' ? 'text-red-600' : 'text-orange-600'}`}>
                          <span className="shrink-0">📄</span> 
                          <span>License: {getExpiryStatus(vehicle.revenueLicenseExpiry).message}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3 text-sm mb-5 bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Seats</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        {vehicle.capacity ?? "-"}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-slate-200 pl-3">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Fuel</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5 capitalize">
                        <Fuel className="w-3.5 h-3.5 text-blue-500" />
                        {vehicle.fuelType || "-"}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-slate-200 pl-3">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Rate / Day</span>
                      <span className="font-bold text-blue-600 flex items-center gap-1">
                        <Banknote className="w-3.5 h-3.5" />
                        {import.meta.env.VITE_CURRENCY_TYPE || "LKR"} {Number(vehicle.pricePerDay || 0).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-5 flex-1">
                    {Array.isArray(vehicle.features) && vehicle.features.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {vehicle.features.map((feature) => (
                          <span key={feature} className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold shadow-[0_1px_2px_rgb(0,0,0,0.02)]">
                            {feature}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 italic">No specific features listed</span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => handleDeleteVehicle(vehicle)}
                      disabled={deletingId === vehicle.id}
                      className="p-2.5 rounded-lg border border-transparent text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all disabled:opacity-50"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/manager/service-logs?vehicle=${vehicle.id}`} 
                        className="px-4 py-2 rounded-lg bg-sky-50 text-sky-700 font-semibold text-sm hover:bg-sky-100 transition-colors"
                      >
                        Service Logs
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEditForm(vehicle)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors shadow-md shadow-slate-900/10"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>
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