import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Filter, Fuel, MapPin, Search, SlidersHorizontal, Star, Users, Gauge, CalendarDays, ArrowRight, X, Sparkles, CarFront, BadgeDollarSign } from "lucide-react";

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

const cardShell = "rounded-[28px] border border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-md";

const formatMoney = (value) => {
  const amount = Number(value);
  const currency = import.meta.env.VITE_CURRENCY_TYPE || "LKR";
  if (!Number.isFinite(amount)) return `${currency} 0.00`;
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

const defaultFilters = {
  query: "",
  vehicleTypeId: "",
  fuelType: "",
  transmission: "",
  status: "available",
  minPrice: "",
  maxPrice: "",
  minCapacity: "",
  sortBy: "featured",
};

const getVehicleTypeName = (vehicle, vehicleTypesById) => {
  const directName = vehicle?.vehicleType?.name || vehicle?.vehicleTypeName || vehicle?.vehicleType;
  if (directName) return directName;

  const typeId = vehicle?.vehicleTypeId;
  if (!typeId) return "Premium Fleet";
  return vehicleTypesById.get(Number(typeId)) || "Premium Fleet";
};

import Header from "../../../components/header";
import Footer from "../../../components/footer";

export default function VehicleCatalogPage() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [vehiclesRes, typesRes] = await Promise.all([
          axios.get(`${backendBaseUrl}/vehicles?status=available`),
          axios.get(`${backendBaseUrl}/vehicle-types`),
        ]);
        setVehicles(Array.isArray(vehiclesRes.data?.data) ? vehiclesRes.data.data : []);
        setVehicleTypes(Array.isArray(typesRes.data?.data) ? typesRes.data.data : []);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load vehicles.");
        setVehicles([]);
        setVehicleTypes([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const vehicleTypesById = useMemo(() => {
    return new Map(vehicleTypes.map((type) => [Number(type.id), type.name]));
  }, [vehicleTypes]);

  const filteredVehicles = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    let next = vehicles.filter((vehicle) => {
      const vehicleName = `${vehicle.brand || ""} ${vehicle.model || ""}`.trim().toLowerCase();
      const vehicleTypeName = getVehicleTypeName(vehicle, vehicleTypesById).toLowerCase();
      const matchesQuery = !query || vehicleName.includes(query) || vehicleTypeName.includes(query);
      const matchesType = !filters.vehicleTypeId || String(vehicle.vehicleTypeId || "") === filters.vehicleTypeId;
      const matchesFuel = !filters.fuelType || vehicle.fuelType === filters.fuelType;
      const matchesTransmission = !filters.transmission || vehicle.transmission === filters.transmission;
      const matchesStatus = !filters.status || vehicle.status === filters.status;
      const matchesMinPrice = !filters.minPrice || Number(vehicle.pricePerDay) >= Number(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || Number(vehicle.pricePerDay) <= Number(filters.maxPrice);
      const matchesCapacity = !filters.minCapacity || Number(vehicle.capacity) >= Number(filters.minCapacity);

      return matchesQuery && matchesType && matchesFuel && matchesTransmission && matchesStatus && matchesMinPrice && matchesMaxPrice && matchesCapacity;
    });

    switch (filters.sortBy) {
      case "price-low":
        next = [...next].sort((a, b) => Number(a.pricePerDay) - Number(b.pricePerDay));
        break;
      case "price-high":
        next = [...next].sort((a, b) => Number(b.pricePerDay) - Number(a.pricePerDay));
        break;
      case "capacity":
        next = [...next].sort((a, b) => Number(b.capacity) - Number(a.capacity));
        break;
      default:
        next = [...next];
    }

    return next;
  }, [filters, vehicles, vehicleTypesById]);


  const clearFilters = () => setFilters(defaultFilters);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.06),transparent_40%)] bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />
      
      {/* Premium Hero Banner */}
      <section className="relative overflow-hidden border-b border-slate-200/50 py-12 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/60 to-indigo-50/40" />
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-blue-400/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Left Hero Info */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 px-4 py-2 text-xs font-bold text-blue-700 shadow-xs">
                <Sparkles className="h-3.5 w-3.5" /> Luxury Fleet Catalog
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                Travel in Comfort, <br />
                <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Drive with Prestige.</span>
              </h1>
              <p className="text-base text-slate-600 max-w-xl leading-relaxed">
                Rent from our curated collection of luxury sedans, rugged SUVs, and spacious family vans. Explore flexible options with or without a private hotel chauffeur.
              </p>
              
              {/* Quick Specs Cards */}
              <div className="grid grid-cols-3 gap-4 pt-4 max-w-md">
                <div className="bg-white/80 backdrop-blur-xs border border-white/60 p-4 rounded-2xl shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CarFront className="w-3.5 h-3.5 text-blue-500" /> Fleet
                  </div>
                  <p className="text-2xl font-black text-slate-800 mt-1">{vehicles.length.toString().padStart(2, "0")}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-xs border border-white/60 p-4 rounded-2xl shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <BadgeDollarSign className="w-3.5 h-3.5 text-emerald-500" /> Rates
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-2.5">Best Price</p>
                </div>
                <div className="bg-white/80 backdrop-blur-xs border border-white/60 p-4 rounded-2xl shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-500" /> Choice
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-2.5">All Types</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Banner card */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/40 shadow-[0_30px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm p-4">
                <img 
                  src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80" 
                  alt="Luxury vehicle view" 
                  className="rounded-2xl h-[320px] w-full object-cover shadow-sm"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Fleet Catalog & Filters Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 flex-1">
        
        {/* Filters Panel Card */}
        <div className="rounded-3xl border border-white/80 bg-white/75 shadow-[0_20px_50px_rgba(15,23,42,0.04)] backdrop-blur-md p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-500" /> Filter Fleet Vehicles
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Narrow down using specifications, transmission type, or budget ranges.</p>
            </div>
            <button
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          </div>

          {/* Filters Fields Controls */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            
            {/* Search Input */}
            <div className="lg:col-span-4 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search Model / Brand</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
                  placeholder="e.g. Toyota, Mercedes..."
                  className="w-full bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-blue-450 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none transition"
                />
              </div>
            </div>

            {/* Vehicle Type Selector */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Body Type</label>
              <select
                value={filters.vehicleTypeId}
                onChange={(e) => setFilters((prev) => ({ ...prev, vehicleTypeId: e.target.value }))}
                className="w-full bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-blue-450 rounded-xl px-3 py-2.5 text-xs outline-none transition cursor-pointer"
              >
                <option value="">All Types</option>
                {vehicleTypes.map((type) => (
                  <option key={type.id} value={String(type.id)}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Fuel Selector */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fuel</label>
              <select
                value={filters.fuelType}
                onChange={(e) => setFilters((prev) => ({ ...prev, fuelType: e.target.value }))}
                className="w-full bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-blue-455 rounded-xl px-3 py-2.5 text-xs outline-none transition cursor-pointer"
              >
                <option value="">Any Fuel</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Transmission Selector */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transmission</label>
              <select
                value={filters.transmission}
                onChange={(e) => setFilters((prev) => ({ ...prev, transmission: e.target.value }))}
                className="w-full bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-blue-455 rounded-xl px-3 py-2.5 text-xs outline-none transition cursor-pointer"
              >
                <option value="">Any Gearbox</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                className="w-full bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-blue-455 rounded-xl px-3 py-2.5 text-xs outline-none transition cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="capacity">Max Seating Capacity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fleet Grid Content */}
        {loading ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-20 text-center shadow-xs">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-sm font-semibold text-slate-500">Retrieving active vehicle fleet...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center text-red-700">
            <p className="font-bold text-lg">Failed to Load Fleet</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-20 text-center shadow-xs">
            <p className="text-lg font-bold text-slate-800">No vehicles match your queries</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the transmission, fuel types, or clear search queries.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.map((vehicle) => {
              const vehicleTypeName = getVehicleTypeName(vehicle, vehicleTypesById);
              const isAvailable = (vehicle.status || "available") === "available";

              return (
                <article 
                  key={vehicle.id} 
                  className="group rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-[0_30px_70px_rgba(15,23,42,0.12)] overflow-hidden transition duration-300 flex flex-col h-full"
                >
                  {/* Vehicle Cover Image */}
                  <div className="relative overflow-hidden aspect-video bg-slate-100">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
                    <img
                      src={vehicle.image || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    
                    {/* Status Tags */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-white/95 text-[9px] font-black uppercase tracking-wider text-slate-800 shadow-sm border border-white/80">
                        {vehicleTypeName}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-white shadow-sm flex items-center gap-1.5 ${
                        isAvailable ? "bg-emerald-500" : "bg-amber-500"
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        {vehicle.status || "available"}
                      </span>
                    </div>

                    {/* Quick Specs Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between text-white">
                      <div>
                        <h3 className="text-xl font-bold tracking-tight">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-6 flex flex-col flex-1 justify-between space-y-6">
                    <div className="space-y-4">
                      {/* Specifications Summary row */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100/50">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Seats</span>
                          <span className="text-xs font-bold text-slate-700 block mt-0.5">{vehicle.capacity || "-"} Pax</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100/50">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Fuel</span>
                          <span className="text-xs font-bold text-slate-700 block mt-0.5 capitalize truncate">{vehicle.fuelType || "-"}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100/50">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Gearbox</span>
                          <span className="text-xs font-bold text-slate-700 block mt-0.5 capitalize truncate">{vehicle.transmission || "-"}</span>
                        </div>
                      </div>

                      {/* Brief description */}
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {vehicle.description || "A premium fleet rental option equipped with luxury components, complete safety integrations, and tailored driving systems."}
                      </p>
                    </div>

                    {/* Bottom Pricing Row & Actions */}
                    <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 mt-auto">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Starting from</span>
                        <div className="flex items-baseline gap-0.5 mt-0.5">
                          <span className="text-lg font-black text-slate-900">{formatMoney(vehicle.pricePerDay)}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">/day</span>
                        </div>
                      </div>

                      <Link
                        to={`/vehicles/${vehicle.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 text-xs shadow-sm hover:shadow-md transition cursor-pointer"
                      >
                        Book Now <CalendarDays className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                </article>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}