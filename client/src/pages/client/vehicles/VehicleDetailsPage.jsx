import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Users, Fuel, ArrowRight } from "lucide-react";

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "$0.00";
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendBaseUrl}/vehicles/${id}`);
        setVehicle(res.data?.data || res.data || null);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load vehicle.");
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  if (loading) return <div className="min-h-screen p-8">Loading vehicle...</div>;
  if (error) return <div className="min-h-screen p-8 text-rose-600">{error}</div>;
  if (!vehicle) return <div className="min-h-screen p-8">Vehicle not found.</div>;

  const features = Array.isArray(vehicle.features)
    ? vehicle.features
    : typeof vehicle.features === "string"
      ? (() => { try { return JSON.parse(vehicle.features); } catch { return []; } })()
      : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/vehicles" className="inline-block text-sm font-semibold text-sky-700 mb-4">← Back to fleet</Link>

        <div className="rounded-3xl bg-white p-6 shadow">
          <div className="overflow-hidden rounded-2xl">
            <img
              src={vehicle.image || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"}
              alt={`${vehicle.brand || "Vehicle"} ${vehicle.model || ""}`}
              className="h-72 w-full object-cover"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <h1 className="text-3xl font-black text-slate-950">{vehicle.brand || "Premium"} {vehicle.model || "Vehicle"}</h1>
              <p className="mt-2 text-sm text-slate-600">{vehicle.description || "Premium rental vehicle."}</p>

              <div className="mt-6 grid grid-cols-3 gap-3 text-sm text-slate-700">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs font-bold uppercase text-slate-400">Capacity</div>
                  <div className="mt-1 font-semibold"><Users className="inline-block mr-2" />{vehicle.capacity || "-"} seats</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs font-bold uppercase text-slate-400">Fuel</div>
                  <div className="mt-1 font-semibold capitalize"><Fuel className="inline-block mr-2" />{vehicle.fuelType || "-"}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs font-bold uppercase text-slate-400">Transmission</div>
                  <div className="mt-1 font-semibold capitalize">{vehicle.transmission || "-"}</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-xs font-bold uppercase text-slate-400">Description</div>
                <p className="mt-2 text-slate-600 leading-7">{vehicle.longDescription || vehicle.description || "This vehicle is prepared for comfortable travel."}</p>
              </div>

              {features.length > 0 && (
                <div className="mt-6">
                  <div className="text-xs font-bold uppercase text-slate-400 mb-3">Features</div>
                  <div className="flex flex-wrap gap-2">
                    {features.map((f, i) => (
                      <span key={i} className="inline-block rounded-full bg-sky-50 border border-sky-100 px-3 py-1 text-xs font-medium text-sky-700">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-5">
                <div className="text-xs font-bold uppercase text-slate-400">Starting from</div>
                <div className="mt-1 text-3xl font-black text-slate-950">{formatMoney(vehicle.pricePerDay)}</div>
                <div className="text-xs text-slate-500 mt-1">per day</div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-3">
                <div className="text-sm font-semibold text-slate-700">Vehicle details</div>
                <ul className="text-xs text-slate-600 space-y-2">
                  {vehicle.year && <li className="flex items-start gap-2"><span className="text-slate-400 mt-0.5 font-bold">Year</span> {vehicle.year}</li>}
                  {vehicle.color && <li className="flex items-start gap-2"><span className="text-slate-400 mt-0.5 font-bold">Color</span> <span className="capitalize">{vehicle.color}</span></li>}
                  {vehicle.plateNumber && <li className="flex items-start gap-2"><span className="text-slate-400 mt-0.5 font-bold">Plate</span> {vehicle.plateNumber}</li>}
                  {vehicle.insuranceExpiry && <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> Insured until {vehicle.insuranceExpiry}</li>}
                  <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> Optional driver available</li>
                </ul>
              </div>

              <button
                onClick={() => navigate(`/vehicles/${vehicle.id}/book`, { state: { vehicle } })}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-4 text-base font-semibold text-white transition hover:bg-sky-700 shadow-lg shadow-sky-600/20"
              >
                Book This Vehicle
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link to="/contact" className="block w-full text-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Ask a question</Link>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
