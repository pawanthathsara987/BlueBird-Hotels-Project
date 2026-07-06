import React, { useEffect, useState } from "react";
import { X, Calendar, Phone, FileText, User, AlertTriangle, CarFront, Users } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";

const formatMoney = (value) => {
  const amount = Number(value);
  const currency = import.meta.env.VITE_CURRENCY_TYPE || "LKR";
  return Number.isFinite(amount) ? `${currency} ${amount.toFixed(2)}` : `${currency} 0.00`;
};

const getLicenseWarning = (expiryDate) => {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDays = new Date(today);
  thirtyDays.setDate(thirtyDays.getDate() + 30);
  if (expiry < today) return "expired";
  if (expiry <= thirtyDays) return "expiring_soon";
  return null;
};

const STATUS_BADGE = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600",
  on_leave: "bg-amber-100 text-amber-700",
};

const STATUS_LABEL = {
  active: "Active",
  inactive: "Inactive",
  on_leave: "On Leave",
};

export default function DriverDetailsModal({ driverId, onClose, backendBaseUrl, config }) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendBaseUrl}/manager/drivers/${driverId}`, config);
        setDriver(res.data.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load driver details");
      } finally {
        setLoading(false);
      }
    };
    if (driverId) {
      fetchDriverDetails();
    }
  }, [driverId, backendBaseUrl, config]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header Section */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-black text-slate-900">Driver Details & Bookings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-slate-500">
              Loading details...
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-600">
              <p>{error}</p>
            </div>
          ) : !driver ? (
            <div className="text-center py-20 text-slate-500">
              Driver not found.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Driver Profile Card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 shadow-sm border-2 border-white mb-4">
                    {driver.driverImage ? (
                      <img src={driver.driverImage} alt={driver.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-slate-400 m-6" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{driver.fullName}</h3>
                  <span className={`mt-2 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${STATUS_BADGE[driver.status] || "bg-slate-100 text-slate-600"}`}>
                    {STATUS_LABEL[driver.status] || driver.status}
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-2">Information</h4>
                  
                  <div className="flex items-start gap-3 text-sm">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-700">{driver.phone}</p>
                      <p className="text-xs text-slate-500">Phone</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-sm">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-700">{driver.nicNo}</p>
                      <p className="text-xs text-slate-500">NIC Number</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <CarFront className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-700">{driver.licenseNo}</p>
                      <p className="text-xs text-slate-500">License No ({driver.licenseClass || "N/A"})</p>
                      {(() => {
                        const warning = getLicenseWarning(driver.licenseExpiry);
                        if (warning === "expired") return <p className="text-[10px] font-bold text-red-600 mt-1 uppercase">Expired: {driver.licenseExpiry}</p>;
                        if (warning === "expiring_soon") return <p className="text-[10px] font-bold text-amber-600 mt-1 uppercase">Expiring soon: {driver.licenseExpiry}</p>;
                        return <p className="text-xs text-slate-500">Expires: {driver.licenseExpiry}</p>;
                      })()}
                    </div>
                  </div>
                  
                  {driver.languageSkills && (
                     <div className="pt-2">
                       <p className="text-xs text-slate-500 font-semibold mb-1">Languages</p>
                       <p className="text-sm text-slate-700">{Array.isArray(driver.languageSkills) ? driver.languageSkills.join(', ') : driver.languageSkills}</p>
                     </div>
                  )}
                </div>
              </div>

              {/* Right Column: Assigned Bookings */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Assigned Bookings</h3>
                  <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    Total: {driver.bookings?.length || 0}
                  </span>
                </div>
                
                {!driver.bookings || driver.bookings.length === 0 ? (
                   <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                     <p className="text-slate-500 font-medium">No assigned bookings found for this driver.</p>
                   </div>
                ) : (
                   <div className="space-y-4">
                     {driver.bookings.map(booking => {
                        const pickupDate = booking.pickupDatetime ? format(new Date(booking.pickupDatetime), "MMM dd, yyyy h:mm a") : "N/A";
                        const returnDate = booking.returnDatetime ? format(new Date(booking.returnDatetime), "MMM dd, yyyy h:mm a") : "N/A";
                        
                        return (
                         <div key={booking.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="inline-block px-2.5 py-1 bg-slate-900 text-white text-[10px] font-black tracking-widest uppercase rounded">
                                  {booking.bookingNo}
                                </span>
                                <span className={`ml-2 inline-block px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : booking.status === 'completed' ? 'bg-blue-100 text-blue-700' : booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                  <Calendar className="w-4 h-4 text-sky-500 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup</p>
                                    <p className="text-sm font-semibold text-slate-800">{pickupDate}</p>
                                    <p className="text-xs text-slate-500">{booking.pickupLocation}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Calendar className="w-4 h-4 text-amber-500 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Return</p>
                                    <p className="text-sm font-semibold text-slate-800">{returnDate}</p>
                                    <p className="text-xs text-slate-500">{booking.dropoffLocation}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                {booking.vehicle ? (
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shadow-sm shrink-0 border border-slate-100">
                                      {booking.vehicle.image ? (
                                        <img src={booking.vehicle.image} alt={booking.vehicle.model} className="w-full h-full object-cover" />
                                      ) : (
                                        <CarFront className="w-6 h-6 text-slate-300 m-3" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-400 uppercase">Assigned Vehicle</p>
                                      <p className="text-sm font-bold text-slate-900">{booking.vehicle.brand} {booking.vehicle.model}</p>
                                      <p className="text-xs font-semibold text-slate-500 px-1.5 py-0.5 bg-slate-200 inline-block rounded mt-1">{booking.vehicle.plateNumber}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500 italic">No vehicle details</p>
                                )}
                              </div>
                            </div>
                         </div>
                        );
                     })}
                   </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
