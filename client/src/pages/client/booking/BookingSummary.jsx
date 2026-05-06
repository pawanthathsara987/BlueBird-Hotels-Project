import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Users, DollarSign } from 'lucide-react';
import { useState } from 'react';

const BookingSummary = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    const bookingData = location.state?.bookingData || {};
    const selectedRooms = location.state?.selectedRooms || [];

    const {
        checkInDate,
        checkOutDate,
        nights = 0,
        totalPrice = 0,
    } = bookingData;

    const checkIn = checkInDate ? new Date(checkInDate) : null;
    const checkOut = checkOutDate ? new Date(checkOutDate) : null;

    const calculateRoomTotal = (room) => {
        const roomPrice = room.totalPrice ?? 0;
        return roomPrice;
    };

    const totalCost = selectedRooms.reduce((sum, room) => sum + calculateRoomTotal(room), 0);

    const handleGoBack = () => {
        navigate("/booking");
    };

    const handleConfirmBooking = async () => {
        setIsProcessing(true);
        try {
            // TODO: Send booking to backend
            console.log('Confirming booking with data:', {
                checkIn: checkInDate,
                checkOut: checkOutDate,
                selectedRooms,
                totalCost,
            });
            navigate("/payment", {
                state: {
                    bookingData,
                    selectedRooms, // 🔥 IMPORTANT
                }
            });
            
        } catch (error) {
            console.error('Booking error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!selectedRooms || selectedRooms.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-stone-900 mb-4">No Rooms Selected</h2>
                    <p className="text-stone-600 mb-6">Please select at least one room to continue.</p>
                    <button
                        onClick={handleGoBack}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-emerald-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 pb-20">
            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-14">
                    <button
                        onClick={handleGoBack}
                        className="mb-4 flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back to Booking
                    </button>
                    <h1 className="text-4xl font-black text-stone-900">Booking Summary</h1>
                    <p className="mt-2 text-stone-600">Review your selected rooms and details</p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-14">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stay Details Card */}
                        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-extrabold text-stone-900 mb-4">Stay Details</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl bg-stone-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                                        <Calendar className="inline h-4 w-4 mr-1" />
                                        Check-in
                                    </p>
                                    <p className="font-semibold text-stone-900">
                                        {checkIn ? format(checkIn, 'dd MMM yyyy') : 'N/A'}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-stone-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                                        <Calendar className="inline h-4 w-4 mr-1" />
                                        Check-out
                                    </p>
                                    <p className="font-semibold text-stone-900">
                                        {checkOut ? format(checkOut, 'dd MMM yyyy') : 'N/A'}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-stone-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                                        Duration
                                    </p>
                                    <p className="font-semibold text-stone-900">{nights} Night{nights !== 1 ? 's' : ''}</p>
                                </div>
                                <div className="rounded-xl bg-stone-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                                        <Users className="inline h-4 w-4 mr-1" />
                                        Rooms
                                    </p>
                                    <p className="font-semibold text-stone-900">{selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </div>

                        {/* Selected Rooms */}
                        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-extrabold text-stone-900 mb-4">Selected Rooms</h2>
                            <div className="space-y-4">
                                {selectedRooms.map((room, index) => {
                                    const roomCheckIn = room.checkInDate ? new Date(room.checkInDate) : null;
                                    const roomCheckOut = room.checkOutDate ? new Date(room.checkOutDate) : null;
                                    return (
                                        <div key={room.frontendRoomId || index} className="rounded-xl border border-stone-200 p-4 hover:shadow-md transition">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-stone-900">
                                                        {room.packageName}
                                                    </h3>
                                                    <p className="text-sm text-stone-600 mt-2">Room {index + 1}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-emerald-700">
                                                        ${calculateRoomTotal(room).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-stone-500">total for stay</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 bg-stone-50 rounded-lg p-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                                                            <Calendar className="inline h-3 w-3 mr-1" />
                                                            Check-in
                                                        </p>
                                                        <p className="font-semibold text-stone-900">
                                                            {roomCheckIn ? format(roomCheckIn, 'dd MMM') : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                                                            <Calendar className="inline h-3 w-3 mr-1" />
                                                            Check-out
                                                        </p>
                                                        <p className="font-semibold text-stone-900">
                                                            {roomCheckOut ? format(roomCheckOut, 'dd MMM') : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                                                            <Users className="inline h-3 w-3 mr-1" />
                                                            Adults
                                                        </p>
                                                        <p className="font-semibold text-stone-900">{room.adults ?? 0}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                                                            <Users className="inline h-3 w-3 mr-1" />
                                                            Kids
                                                        </p>
                                                        <p className="font-semibold text-stone-900">{room.kids ?? 0}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Nights</p>
                                                        <p className="font-semibold text-stone-900">{room.nights ?? nights}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Price Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-lg">
                            <h3 className="text-lg font-extrabold text-stone-900 mb-4">Price Breakdown</h3>

                            <div className="space-y-3 mb-4 pb-4 border-b border-stone-200">
                                {selectedRooms.map((room, index) => (
                                    <div key={room.roomId || index} className="flex justify-between text-sm">
                                        <span className="text-stone-600">Room {index + 1}</span>
                                        <span className="font-semibold text-stone-900">
                                            ${calculateRoomTotal(room).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg font-bold text-stone-900">Total</span>
                                <span className="text-3xl font-black text-emerald-700">
                                    ${totalCost.toFixed(2)}
                                </span>
                            </div>

                            <button
                                onClick={handleConfirmBooking}
                                disabled={isProcessing}
                                className="w-full rounded-xl bg-emerald-700 px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <DollarSign className="h-5 w-5" />
                                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                            </button>

                            <button
                                onClick={handleGoBack}
                                disabled={isProcessing}
                                className="w-full mt-3 rounded-xl border border-stone-300 px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-stone-900 transition hover:bg-stone-50 disabled:opacity-50"
                            >
                                Edit Booking
                            </button>

                            <p className="mt-4 text-xs text-stone-500 text-center">
                                By proceeding, you agree to our terms & conditions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingSummary;
