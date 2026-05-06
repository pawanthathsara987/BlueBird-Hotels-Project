import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, ArrowLeft, Home, Calendar, Users } from "lucide-react";
import { format } from "date-fns";

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state?.bookingData;
  const selectedRooms = location.state?.selectedRooms || [];
  const bookingConfirmation = location.state?.bookingConfirmation;
  const paymentConfirmation = location.state?.paymentConfirmation;

  // Convert dates for formatting
  const checkIn = bookingData?.checkInDate ? new Date(bookingData.checkInDate) : null;
  const checkOut = bookingData?.checkOutDate ? new Date(bookingData.checkOutDate) : null;

  // Clear localStorage after component mounts (booking is confirmed)
  useEffect(() => {
    localStorage.removeItem("bookingDetails");
  }, []);

  // fallback guard
  if (!bookingData && !bookingConfirmation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">
            No booking data found
          </p>
          <button
            onClick={() => navigate("/booking")}
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg"
          >
            Go to Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-stone-900">
            Booking Confirmed!
          </h1>
          <p className="text-stone-600 text-sm mt-2">
            Your payment was successful and your reservation is confirmed.
          </p>
        </div>

        {/* Booking Summary */}
        <div className="bg-emerald-50 rounded-xl p-6 mb-6 border border-emerald-200">
          <h2 className="text-lg font-bold text-stone-900 mb-4">Booking Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                <Calendar className="inline h-3 w-3 mr-1" />
                Check-in
              </p>
              <p className="font-semibold text-stone-900">
                {checkIn ? format(checkIn, "dd MMM yyyy") : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                <Calendar className="inline h-3 w-3 mr-1" />
                Check-out
              </p>
              <p className="font-semibold text-stone-900">
                {checkOut ? format(checkOut, "dd MMM yyyy") : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Nights</p>
              <p className="font-semibold text-stone-900">{bookingData?.nights || 0}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                <Users className="inline h-3 w-3 mr-1" />
                Rooms
              </p>
              <p className="font-semibold text-stone-900">{selectedRooms.length}</p>
            </div>
          </div>
        </div>

        {/* Booking Info */}
        <div className="space-y-3 border-t border-b py-6 mb-6">
          {bookingConfirmation?.bookingId && (
            <div className="flex justify-between items-center">
              <span className="text-stone-600 font-medium">Booking ID</span>
              <span className="font-bold text-emerald-700 text-lg">
                #{bookingConfirmation.bookingId}
              </span>
            </div>
          )}

          {paymentConfirmation?.paymentId && (
            <div className="flex justify-between items-center">
              <span className="text-stone-600 font-medium">Payment ID</span>
              <span className="font-bold text-emerald-700">
                {paymentConfirmation.paymentId}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-stone-600 font-medium">Total Amount</span>
            <span className="font-bold text-emerald-700 text-lg">
              ${bookingData?.totalPrice?.toFixed(2) || "0.00"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-stone-600 font-medium">Guests</span>
            <span className="font-semibold text-stone-900">
              {selectedRooms.reduce((sum, r) => sum + (r.adults || 0), 0)} Adults,
              {selectedRooms.reduce((sum, r) => sum + (r.kids || 0), 0)} Kids
            </span>
          </div>
        </div>

        {/* Rooms Details */}
        {selectedRooms.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Reserved Rooms</h2>
            <div className="space-y-3">
              {selectedRooms.map((room, index) => {
                const roomCheckIn = room.checkInDate ? new Date(room.checkInDate) : null;
                const roomCheckOut = room.checkOutDate ? new Date(room.checkOutDate) : null;
                return (
                  <div key={index} className="p-4 bg-stone-100 rounded-lg border border-stone-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-stone-900">
                        {room.packageName || `Room ${index + 1}`}
                      </h3>
                      <span className="text-emerald-700 font-bold">${room.totalPrice?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-stone-600 mb-1">Check-in</p>
                        <p className="font-medium text-stone-900">
                          {roomCheckIn ? format(roomCheckIn, "dd MMM") : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-600 mb-1">Check-out</p>
                        <p className="font-medium text-stone-900">
                          {roomCheckOut ? format(roomCheckOut, "dd MMM") : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-600 mb-1">Guests</p>
                        <p className="font-medium text-stone-900">
                          {room.adults || 0}A, {room.kids || 0}K
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-600 mb-1">Nights</p>
                        <p className="font-medium text-stone-900">{room.nights || 0}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 text-white py-3 rounded-lg font-semibold hover:bg-emerald-800 transition"
          >
            <Home className="h-4 w-4" />
            Home
          </button>

          <button
            onClick={() => navigate("/booking")}
            className="flex-1 flex items-center justify-center gap-2 border border-stone-300 py-3 rounded-lg font-semibold hover:bg-stone-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            New Booking
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;