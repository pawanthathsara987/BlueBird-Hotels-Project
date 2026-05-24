import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Users, Fuel, MapPin, CalendarDays } from "lucide-react";

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "$0.00";
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [driverOption, setDriverOption] = useState("without");
  const navigate = useNavigate();

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

  const runAvailabilityCheck = async () => {
    if (!vehicle || !pickupDate || !returnDate) return;
    try {
      setAvailabilityLoading(true);
      const res = await axios.get(`${backendBaseUrl}/vehicles/${vehicle.id}/availability`, {
        params: { pickup: pickupDate, return: returnDate, withDriver: driverOption === "with" },
      });
      setAvailability(res.data?.data || null);
    } catch (err) {
      setAvailability({ available: false, reason: err.response?.data?.message || err.message || "Unable to check availability." });
    } finally {
      setAvailabilityLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen p-8">Loading vehicle...</div>;
  if (error) return <div className="min-h-screen p-8 text-rose-600">{error}</div>;
  if (!vehicle) return <div className="min-h-screen p-8">Vehicle not found.</div>;

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
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="text-xs font-bold uppercase text-slate-400">Price / day</div>
                <div className="mt-1 text-2xl font-black text-slate-950">{formatMoney(vehicle.pricePerDay)}</div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="text-xs font-bold uppercase text-slate-400">Check availability</div>
                <div className="mt-3 grid gap-2">
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="driver" value="without" checked={driverOption === "without"} onChange={() => setDriverOption("without")} />
                      <span className="text-sm">Without driver</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="driver" value="with" checked={driverOption === "with"} onChange={() => setDriverOption("with")} />
                      <span className="text-sm">With driver</span>
                    </label>
                  </div>
                  <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-3 py-2" />
                  <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-3 py-2" />
                  <button disabled={availabilityLoading} onClick={runAvailabilityCheck} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60">{availabilityLoading ? "Checking..." : "Check availability"}</button>
                </div>
                {availability && (
                  <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-700">{availability.available ? "Available" : "Unavailable"}</div>
                      {availability.totalPrice && <div className="font-bold">{formatMoney(availability.totalPrice)}</div>}
                    </div>
                    {availability.reason && <p className="mt-2 text-slate-500">{availability.reason}</p>}
                    {driverOption === "with" && !availability.driverFee && (
                      <p className="mt-2 text-xs text-slate-500">Driver option requested — additional driver fee may apply and will be confirmed at booking.</p>
                    )}
                    {driverOption === "without" && !availability.driverFee && (
                      <p className="mt-2 text-xs text-slate-500">No driver selected.</p>
                    )}
                    {availability.driverFee && (
                      <p className="mt-2 text-sm text-slate-700">Driver fee: {formatMoney(availability.driverFee)}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Link to="/contact" className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Ask a question</Link>
                <button 
                  disabled={!availability?.available}
                  onClick={() => navigate(`/vehicles/${vehicle.id}/book`, { 
                    state: { vehicle, pickupDate, returnDate, driverOption, availability } 
                  })} 
                  className="inline-flex flex-1 items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book now
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
