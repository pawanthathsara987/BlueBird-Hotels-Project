import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Users, Fuel, ArrowRight, Gauge, Calendar, ShieldCheck, Sparkles, ChevronLeft } from "lucide-react";

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

const formatMoney = (value) => {
  const amount = Number(value);
  const currency = import.meta.env.VITE_CURRENCY_TYPE || "LKR";
  if (!Number.isFinite(amount)) return `${currency} 0.00`;
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

import Header from "../../../components/header";
import Footer from "../../../components/footer";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-12 text-slate-500">Loading details...</div>
        <Footer />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 p-6 sm:p-8">
          <div className="mx-auto max-w-2xl rounded-3xl border border-slate-100 bg-white p-8 shadow-xl text-center">
            <h1 className="text-2xl font-black text-slate-950">Vehicle unavailable</h1>
            <p className="mt-3 text-slate-600">{error || "This vehicle could not be loaded."}</p>
            <Link to="/vehicles" className="mt-6 inline-flex items-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Return to fleet
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const features = Array.isArray(vehicle.features)
    ? vehicle.features
    : typeof vehicle.features === "string"
      ? (() => { try { return JSON.parse(vehicle.features); } catch { return []; } })()
      : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/" className="hover:text-slate-600 transition">Home</Link>
          <span>/</span>
          <Link to="/vehicles" className="hover:text-slate-600 transition">Fleet</Link>
          <span>/</span>
          <span className="text-slate-600 truncate">{vehicle.brand} {vehicle.model}</span>
        </div>

        {/* Back Link Button */}
        <Link 
          to="/vehicles" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Fleet Catalog
        </Link>

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Media & Specifications */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Visual Cover Card */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-100 border border-slate-200/50 shadow-sm group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
              <img
                src={vehicle.image || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="h-[380px] w-full object-cover transition duration-700 group-hover:scale-[1.015]"
              />
              <div className="absolute left-6 bottom-6 z-20 text-white space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-[10px] font-black uppercase tracking-wider text-white shadow-md mb-2">
                  <Sparkles className="w-3 h-3 animate-pulse" /> Premium Range
                </span>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <p className="text-xs md:text-sm text-slate-200/90 font-medium">
                  Available for immediate rental reservations
                </p>
              </div>
            </div>

            {/* Specifications Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacity</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{vehicle.capacity || "-"} Seats</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs flex items-center gap-3">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fuel Type</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 capitalize">{vehicle.fuelType || "-"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transmission</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 capitalize">{vehicle.transmission || "-"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manufacture</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{vehicle.year || "Premium"}</p>
                </div>
              </div>
            </div>

            {/* Description & Overview */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Vehicle Overview</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {vehicle.longDescription || vehicle.description || "Experience top-tier quality and reliability on your journey with this curated vehicle option."}
              </p>
            </div>

            {/* Exclusive Amenities & Features */}
            {features.length > 0 && (
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Key Features</h2>
                <div className="flex flex-wrap gap-2.5">
                  {features.map((f, i) => (
                    <span 
                      key={i} 
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50/50 border border-blue-100 px-3.5 py-2 text-xs font-semibold text-blue-700"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Sticky Sidebar Reservation Widget */}
          <div className="lg:col-span-4 lg:sticky lg:top-6">
            <div className="rounded-3xl border border-white/70 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.06)] backdrop-blur-md p-6 space-y-6">
              
              {/* Pricing Section */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Daily Rental Fee</span>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl font-black text-slate-900">{formatMoney(vehicle.pricePerDay)}</h3>
                  <span className="text-xs text-slate-500 font-semibold">/ Day</span>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Included with Hire</h4>
                <ul className="text-xs text-slate-500 space-y-2.5">
                  <li className="flex items-center gap-2 font-medium">
                    <span className="text-emerald-500 font-black">✓</span> Complete Third-Party Insurance Cover
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <span className="text-emerald-500 font-black">✓</span> Professional Driver Option available
                  </li>
                  {vehicle.color && (
                    <li className="flex items-center gap-2 font-medium">
                      <span className="text-emerald-500 font-black">✓</span> Color: <span className="capitalize">{vehicle.color}</span>
                    </li>
                  )}
                  {vehicle.insuranceExpiry && (
                    <li className="flex items-center gap-2 font-medium">
                      <span className="text-emerald-500 font-black">✓</span> Insured Validity: {vehicle.insuranceExpiry}
                    </li>
                  )}
                </ul>
              </div>

              {/* Book Button */}
              <button
                onClick={() => navigate(`/vehicles/${vehicle.id}/book`, { state: { vehicle } })}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 shadow-lg shadow-blue-600/20 active:scale-[0.98] transition cursor-pointer"
              >
                Reserve This Vehicle
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Contact / Question link */}
              <Link 
                to="/contact" 
                className="block w-full text-center rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-350 transition"
              >
                Inquire about this Fleet vehicle
              </Link>

            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
