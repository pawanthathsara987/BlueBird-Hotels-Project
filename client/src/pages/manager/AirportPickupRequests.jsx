import { useEffect, useState } from "react";
import { CarFront, CalendarDays, Clock3, Mail, Phone } from "lucide-react";

export default function AirportPickupRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${backendBaseUrl}/manager/airport-pickups`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load airport pickup requests");
        }

        setRequests(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        setError(err.message || "Failed to load airport pickup requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [backendBaseUrl]);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading airport pickup requests...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600 font-medium">{error}</div>;
  }

  const getPickupDateTime = (pickupDate, pickupTime) => {
    if (!pickupDate) return null;

    const date = new Date(pickupDate);
    if (Number.isNaN(date.getTime())) return null;

    const [hours = "00", minutes = "00", seconds = "00"] = String(pickupTime || "00:00:00").split(":");
    date.setHours(Number(hours) || 0, Number(minutes) || 0, Number(seconds) || 0, 0);
    return date;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-blue-100 flex items-center justify-center">
          <CarFront className="h-6 w-6 text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Airport Pickup Requests</h1>
          <p className="text-sm text-gray-500">Requests submitted by customers during booking</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-gray-500">
          No airport pickup requests found.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {requests.map((request, index) => {
            const customer = request.Customer || {};
            const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Unknown Customer";
            const pickupDateTime = getPickupDateTime(request.pickup_date, request.pickup_time);
            const isExpired = pickupDateTime ? pickupDateTime.getTime() < Date.now() : false;

            return (
              <div
                key={request.id}
                className={`rounded-2xl p-5 shadow-sm border ${
                  isExpired ? "bg-red-50 border-red-300" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{fullName}</h2>
                    <p className="text-xs text-gray-500">Request ID: #{request.id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      Order #{index + 1}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isExpired ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {isExpired ? "Expired Request" : "Pickup Request"}
                    </span>
                  </div>
                </div>

                <div className={`space-y-2 text-sm ${isExpired ? "text-red-800" : "text-gray-700"}`}>
                  <div className="flex items-center gap-2">
                    <CalendarDays className={`w-4 h-4 ${isExpired ? "text-red-600" : "text-blue-600"}`} />
                    <span>{request.pickup_date ? new Date(request.pickup_date).toLocaleDateString() : "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className={`w-4 h-4 ${isExpired ? "text-red-600" : "text-blue-600"}`} />
                    <span>{request.pickup_time || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className={`w-4 h-4 ${isExpired ? "text-red-600" : "text-blue-600"}`} />
                    <span>{customer.email || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className={`w-4 h-4 ${isExpired ? "text-red-600" : "text-blue-600"}`} />
                    <span>{customer.phoneNumber || "-"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
