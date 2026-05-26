import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Filter, Fuel, MapPin, Search, SlidersHorizontal, Star, Users, Gauge, CalendarDays, ArrowRight, X, Sparkles, CarFront, BadgeDollarSign } from "lucide-react";

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

const cardShell = "rounded-[28px] border border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-md";

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "$0.00";
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
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
          axios.get(`${backendBaseUrl}/vehicles`),
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
      const plate = String(vehicle.plateNumber || "").toLowerCase();
      const vehicleTypeName = getVehicleTypeName(vehicle, vehicleTypesById).toLowerCase();
      const matchesQuery = !query || vehicleName.includes(query) || plate.includes(query) || vehicleTypeName.includes(query);
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(59,130,246,0.06),transparent)]" />
        <div className="absolute -top-24 -right-32 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-32 h-80 w-80 rounded-full bg-blue-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-semibold text-sky-800 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Premium vehicle rentals
              </div>
              <div className="space-y-4 max-w-2xl">
                <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Drive the island in a vehicle that fits the trip.
                </h1>
                <p className="text-base leading-7 text-slate-600 sm:text-lg">
                  Browse our fleet, filter by type and price, and open a clean detail panel to check rates and availability before you book.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className={`${cardShell} p-4`}>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <CarFront className="h-4 w-4 text-sky-600" />
                    Fleet
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-950">{vehicles.length.toString().padStart(2, "0")}</div>
                </div>
                <div className={`${cardShell} p-4`}>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <BadgeDollarSign className="h-4 w-4 text-emerald-600" />
                    Budget range
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-950">Daily rates</div>
                </div>
                <div className={`${cardShell} p-4`}>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <Users className="h-4 w-4 text-indigo-600" />
                    Capacity
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-950">Family to VIP</div>
                </div>
              </div>
            </div>

            <div className={`${cardShell} overflow-hidden`}> 
              <div className="relative h-full min-h-80 bg-linear-to-br from-slate-950 via-blue-700 to-sky-400 p-6 text-white">
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_40%)]" />
                <div className="relative h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      Featured fleet
                    </p>
                    <h2 className="text-3xl font-black leading-tight">Luxury, comfort, and practical travel in one view.</h2>
                    <p className="text-sm leading-6 text-white/80">
                      Use the filters to narrow by budget, seating, fuel type, or transmission. Open a vehicle to see the details instantly.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/60">Popular</div>
                      <div className="mt-1 text-sm font-bold">SUVs, vans, sedans</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/60">Support</div>
                      <div className="mt-1 text-sm font-bold">Details before booking</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className={`${cardShell} p-4 sm:p-5 lg:p-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                <Filter className="h-4 w-4" />
                Smart filters
              </div>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Find the right vehicle faster</h2>
              <p className="mt-1 text-sm text-slate-500">Search and filter the fleet before opening the booking detail panel.</p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={filters.query}
                  onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
                  placeholder="Model, brand, plate, type..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Vehicle type</label>
              <select
                value={filters.vehicleTypeId}
                onChange={(e) => setFilters((prev) => ({ ...prev, vehicleTypeId: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              >
                <option value="">All types</option>
                {vehicleTypes.map((type) => (
                  <option key={type.id} value={String(type.id)}>{type.name}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Fuel</label>
              <select
                value={filters.fuelType}
                onChange={(e) => setFilters((prev) => ({ ...prev, fuelType: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              >
                <option value="">Any fuel</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Transmission</label>
              <select
                value={filters.transmission}
                onChange={(e) => setFilters((prev) => ({ ...prev, transmission: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              >
                <option value="">Any transmission</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            {/* Status locked to 'available' for customers — no dropdown needed */}

            <div className="lg:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Min price</label>
              <input
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                placeholder="0"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Max price</label>
              <input
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                placeholder="999"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Min capacity</label>
              <input
                type="number"
                min="1"
                value={filters.minCapacity}
                onChange={(e) => setFilters((prev) => ({ ...prev, minCapacity: e.target.value }))}
                placeholder="4"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Sort</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="capacity">Highest capacity</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        {loading ? (
          <div className={`${cardShell} p-12 text-center text-slate-600`}>Loading fleet...</div>
        ) : error ? (
          <div className={`${cardShell} p-8 text-center`}>
            <p className="text-lg font-semibold text-rose-600">{error}</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className={`${cardShell} p-12 text-center`}>
            <p className="text-xl font-bold text-slate-900">No vehicles match your filters.</p>
            <p className="mt-2 text-slate-500">Try widening the price range or clearing the filter panel.</p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
            {filteredVehicles.map((vehicle) => {
              const vehicleTypeName = getVehicleTypeName(vehicle, vehicleTypesById);

              return (
                <article key={vehicle.id} className={`${cardShell} group overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_40px_90px_rgba(15,23,42,0.16)]`}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.70))] z-10" />
                    <img
                      src={vehicle.image || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"}
                      alt={`${vehicle.brand || "Vehicle"} ${vehicle.model || ""}`}
                      className="h-64 w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                    />

                    <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-900 shadow-sm">
                        {vehicleTypeName}
                      </span>
                      <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-sm">
                        {vehicle.status || "available"}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-4 text-white">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Fleet number</p>
                        <h3 className="text-2xl font-black leading-tight">{vehicle.brand || "Premium"} {vehicle.model || "Vehicle"}</h3>
                      </div>
                      <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-md">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">Per day</div>
                        <div className="text-lg font-black">{formatMoney(vehicle.pricePerDay)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-500">Plate {vehicle.plateNumber || "N/A"}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Users className="h-3.5 w-3.5" /> {vehicle.capacity || "-"} seats</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Fuel className="h-3.5 w-3.5" /> {vehicle.fuelType || "fuel"}</span>
                        </div>
                      </div>
                      <Link
                        to={`/vehicles/${vehicle.id}`}
                        className="rounded-full border border-sky-200 bg-sky-50 p-2 text-sky-700 transition hover:bg-sky-100 inline-flex items-center justify-center"
                        aria-label="Open vehicle details"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          <Gauge className="h-3.5 w-3.5" /> Transmission
                        </div>
                        <div className="mt-1 font-semibold capitalize">{vehicle.transmission || "-"}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          <MapPin className="h-3.5 w-3.5" /> Features
                        </div>
                        <div className="mt-1 font-semibold">{Array.isArray(vehicle.features) ? vehicle.features.slice(0, 2).join(", ") : "Comfort package"}</div>
                      </div>
                    </div>

                    <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                      {vehicle.description || "A premium rental vehicle with comfort-focused features, clean presentation, and flexible daily rates."}
                    </p>

                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Starting from</div>
                        <div className="text-2xl font-black text-slate-950">{formatMoney(vehicle.pricePerDay)}</div>
                      </div>
                      <Link
                        to={`/vehicles/${vehicle.id}`}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                      >
                        View details
                        <CalendarDays className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

 
    </div>
  );
}