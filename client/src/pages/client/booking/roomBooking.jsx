import { CalendarDays, ChevronDown, MapPin, Users, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import RoomDetailsModal from "./RoomDetailsModal";
import { SiGitconnected } from "react-icons/si";

const BookingRoom = () => {
    const today = new Date();
    const defaultCheckOut = new Date(today);
    defaultCheckOut.setDate(defaultCheckOut.getDate() + 4);

    const [checkInDate, setCheckInDate] = useState(today);
    const [checkOutDate, setCheckOutDate] = useState(defaultCheckOut);
    const [selectedPackage, setSelectedPackage] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [packageOptions, setPackageOptions] = useState([]);
    const [reviewPackageList, setRevirePackageList] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // getAllAvailable Packages
    const getAllPackages = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/admin/packages`,
            );
            const packageList = response?.data?.data;

            if (!Array.isArray(packageList)) {
                setPackageOptions([]);
                return;
            }

            setRevirePackageList(
                packageList.map((pkg) => ({
                    id: pkg.id,
                    name: pkg.pname,
                    price: pkg.pprice,
                    main_image: pkg.pimage,
                    description: pkg.description,
                    maxAdults: pkg.maxAdults,
                    maxKids: pkg.maxKids
                }))
            );
            
        } catch (error) {
            console.error("Failed to load packages", error);
            setPackageOptions([]);
        }
    };
    
    useEffect(() => {
        getAllPackages();
    }, []);

    const normalizePackage = (pkg) => ({
        id: pkg.id,
        name: pkg.pname || pkg.name,
        price: pkg.pprice ?? pkg.price,
        image: pkg.pimage || pkg.image,
        description: pkg.description,
        maxAdults: pkg.maxAdults ?? 0,
        maxKids: pkg.maxKids ?? 0,
        available: pkg.available_room ?? pkg.available ?? 0,
    });

    const getAvailablePackagesByDate = async (startDate = checkInDate, endDate = checkOutDate) => {
        try {
            if (!startDate || !endDate) {
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/roombook/available-packages`,
                {
                    params: {
                        checkIn: format(startDate, "yyyy-MM-dd"),
                        checkOut: format(endDate, "yyyy-MM-dd")
                    }
                }
            );

            const packageList = response?.data?.data;
            if (!Array.isArray(packageList)) {
                setPackageOptions([]);
                return;
            }

            setPackageOptions(packageList.map(normalizePackage));
        } catch (error) {
            setPackageOptions([]);
        }
    }


    useEffect(() => {
        document.body.style.overflow = selectedRoom ? "hidden" : "unset";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [selectedRoom]);

    const handleRangeChange = (dates) => {
        const [start, end] = dates;
        setCheckInDate(start);
        setCheckOutDate(end);
        setPackageOptions([]);
    };

    const addRoom = () => {
        setRooms((prev) => [
            ...prev,
            {
                id: Date.now() + prev.length,
                packageId: "",
                adults: 1,
                kids: 0,
                showPackagePicker: false,
            },
        ]);
    };

    const removeRoom = (roomId) => {
        setRooms((prev) => prev.filter((room) => room.id !== roomId));
    };

    const updateRoomPackage = (roomId, packageId) => {
        const selectedPackage = packageOptions.find((item) => item.id === packageId);
        setRooms((prev) =>
            prev.map((room) =>
                room.id === roomId
                    ? {
                        ...room,
                        packageId,
                        adults: selectedPackage ? 1 : room.adults,
                        kids: 0,
                        showPackagePicker: false,
                    }
                    : room,
            ),
        );
    };

    const togglePackagePicker = (roomId, showPackagePicker) => {
        if (showPackagePicker) {
            getAvailablePackagesByDate(checkInDate, checkOutDate);
        }
        setRooms((prev) =>
            prev.map((room) =>
                room.id === roomId
                    ? {
                        ...room,
                        showPackagePicker,
                    }
                    : room,
            ),
        );
    };

    const updateRoomGuests = (roomId, field, value) => {
        setRooms((prev) =>
            prev.map((room) => (room.id === roomId ? { ...room, [field]: Number(value) } : room)),
        );
    };

    const totalAdults = rooms.reduce((sum, room) => sum + (room.packageId ? room.adults : 0), 0);
    const totalKids = rooms.reduce((sum, room) => sum + (room.packageId ? room.kids : 0), 0);

    const getRemainingAvailability = (packageId) => {
        const pkg = packageOptions.find((p) => p.id === packageId);
        if (!pkg) return 0;
        const usedCount = rooms.filter((room) => room.packageId === packageId).length;
        return Math.max(0, pkg.available - usedCount);
    };

    const openPackageDetails = (item) => {  
        setSelectedRoom({
            id: item.id,
            name: item.name,
            image: item.main_image,
            description: item.description,
            description2: `${item.maxAdults} Adults${item.maxKids ? `, ${item.maxKids} Kids` : ""} - Breakfast Included`,
            price: item.price,
            maxGuests: `${item.maxAdults + item.maxKids} (${item.maxAdults} Adults, ${item.maxKids} Children)`,
            checkIn: item.checkIn || "2.00 pm",
            checkOut: item.checkOut || "12.0 pm",
        });
    };

    const closePackageDetails = () => {
        setSelectedRoom(null);
    };

    const handleBooking = () => {
        console.log(selectedPackage.id);
    }

    return (
        <div
            className="min-h-screen pb-14"
            style={{
                background:
                    "linear-gradient(180deg, #f3efe5 0%, #f7f5ef 44%, #f0f4f1 100%)",
            }}
        >
            <section className="relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=80"
                    alt="Tropical hotel"
                    className="h-107.5 w-full object-cover object-center sm:h-130"
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/35 to-transparent" />

                <div className="absolute left-0 top-0 w-full px-4 pt-8 sm:px-8 lg:px-14">
                    <div className="mx-auto max-w-7xl">
                        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                            <Sparkles className="h-3.5 w-3.5" /> Island Luxury Collection
                        </p>
                        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                            Escape To Places
                            <br />
                            You Will Never Forget
                        </h1>
                        <p className="mt-4 max-w-xl text-sm text-stone-100 sm:text-base">
                            Discover curated beachfront, city, and hillside stays with a streamlined booking
                            experience designed for quick decisions.
                        </p>
                    </div>
                </div>
            </section>

            <section className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 sm:px-8 lg:px-14">
                <div className="overflow-visible rounded-3xl border border-white/60 bg-white/95 shadow-2xl backdrop-blur-md">
                    <div className="flex flex-wrap gap-2 border-b border-stone-200 p-4 sm:p-5">
                        <label
                            className="rounded-full bg-emerald-700 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white"
                        >
                            Hotels
                        </label>
                    </div>

                    <div className="grid grid-cols-1 gap-3 p-4 sm:p-5 lg:grid-cols-4 lg:gap-0">
                        <div className="rounded-2xl border border-stone-200 p-4 lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Destination</p>
                            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-stone-800">
                                <MapPin className="h-4 w-4 text-emerald-700" /> Sri Lanka
                            </p>
                        </div>

                        <div className="rounded-2xl border border-stone-200 p-4 lg:col-span-2 lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Stay Dates</p>
                            <div className="mt-2 flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-emerald-700" />
                                <DatePicker
                                    selected={checkInDate}
                                    startDate={checkInDate}
                                    endDate={checkOutDate}
                                    onChange={handleRangeChange}
                                    selectsRange
                                    minDate={today}
                                    dateFormat="dd MMM yyyy"
                                    popperPlacement="bottom-start"
                                    popperClassName="!z-[70]"
                                    wrapperClassName="w-full"
                                    className="w-full rounded-md border border-stone-300 px-2 py-1 text-sm font-semibold text-stone-800 focus:border-emerald-700 focus:outline-none"
                                />
                            </div>
                            <p className="mt-2 text-xs font-semibold text-stone-600">
                                {checkInDate ? format(checkInDate, "dd MMM yyyy") : "Select check in"}
                                {" - "}
                                {checkOutDate ? format(checkOutDate, "dd MMM yyyy") : "Select check out"}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-stone-200 p-4 lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Guests</p>
                            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-stone-800">
                                <Users className="h-4 w-4 text-emerald-700" />
                                {totalAdults} Adult{totalAdults !== 1 ? "s" : ""}, {totalKids} Kid
                                {totalKids !== 1 ? "s" : ""}
                                <ChevronDown className="ml-auto h-4 w-4 text-stone-500" />
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-stone-200 p-4 sm:p-5">
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
                                Room and Guest Assignment
                            </p>
                            <button
                                type="button"
                                onClick={addRoom}
                                className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-emerald-800"
                            >
                                + Add Room
                            </button>
                        </div>

                        {rooms.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-3 text-sm text-stone-600">
                                Add a room first. Then select a package, and only after that choose adults and kids.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {rooms.map((room, index) => {
                                    const selectedPackage = packageOptions.find(
                                        (item) => item.id === room.packageId,
                                    );
                                    const adultMax = selectedPackage ? selectedPackage.maxAdults : 0;
                                    const kidMax = selectedPackage ? selectedPackage.maxKids : 0;

                                    return (
                                        <div key={room.id} className="rounded-xl border border-stone-200 bg-white p-3">
                                            <div className="mb-3 flex items-center justify-between">
                                                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                                                    Room {index + 1}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => removeRoom(room.id)}
                                                    className="rounded-md border border-rose-200 px-3 py-2 text-xs font-bold uppercase tracking-wider text-rose-700 transition hover:bg-rose-50"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="mb-3">
                                                {!room.packageId && !room.showPackagePicker && (
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePackagePicker(room.id, true)}
                                                        className="rounded-lg border border-emerald-700 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700 transition hover:bg-emerald-50"
                                                    >
                                                        Select Package
                                                    </button>
                                                )}

                                                {room.packageId && !room.showPackagePicker && selectedPackage && (
                                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                                                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                                                            Selected Package
                                                        </p>
                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                                            <img
                                                                src={selectedPackage.image}
                                                                alt={selectedPackage.name}
                                                                className="h-20 w-full rounded-lg object-cover sm:w-36"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="text-sm font-extrabold text-stone-900">
                                                                    {selectedPackage.name}
                                                                </p>
                                                                <p className="text-xs text-stone-600">
                                                                    {selectedPackage.description}
                                                                </p>
                                                                <p className="mt-1 text-xs font-semibold text-stone-700">
                                                                    Capacity: {selectedPackage.maxAdults} Adults / {selectedPackage.maxKids} Kids
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => togglePackagePicker(room.id, true)}
                                                                className="rounded-md border border-stone-300 px-3 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 transition hover:bg-white"
                                                            >
                                                                Change Package
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {room.showPackagePicker && (
                                                    <>
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                                                                Select Package
                                                            </p>
                                                            {room.packageId && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => togglePackagePicker(room.id, false)}
                                                                    className="text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-stone-800"
                                                                >
                                                                    Hide
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                                            {packageOptions.length === 0 ? (
                                                                <p className="col-span-full rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm font-semibold text-stone-600">
                                                                    No available packages right now.
                                                                </p>
                                                            ) : (
                                                                packageOptions.map((item) => {
                                                                    const isSelected = room.packageId === item.id;
                                                                    const remainingAvailable = getRemainingAvailability(item.id);
                                                                    const isUnavailable = remainingAvailable === 0 && !isSelected;

                                                                    return (
                                                                        <button
                                                                            key={item.id}
                                                                            type="button"
                                                                            disabled={isUnavailable}
                                                                            onClick={() => updateRoomPackage(room.id, item.id)}
                                                                            className={`relative overflow-hidden rounded-xl border text-left transition ${isSelected
                                                                                    ? "border-emerald-600 ring-2 ring-emerald-200"
                                                                                    : isUnavailable
                                                                                        ? "border-rose-200"
                                                                                        : "border-stone-200 hover:-translate-y-0.5 hover:shadow-md"
                                                                                } ${isUnavailable
                                                                                    ? "cursor-not-allowed"
                                                                                    : ""
                                                                                }`}
                                                                        >
                                                                            <img
                                                                                src={item.image}
                                                                                alt={item.name}
                                                                                className="h-28 w-full object-cover"
                                                                            />
                                                                            {isUnavailable && (
                                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/29">
                                                                                    <span className="text-sm font-extrabold uppercase tracking-wider text-white">
                                                                                        Sold Out
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            <div className="space-y-1 p-3">
                                                                                <p className="text-sm font-extrabold text-stone-900">
                                                                                    {item.name}
                                                                                </p>
                                                                                <p className="text-xs leading-relaxed text-stone-600">
                                                                                    {item.description}
                                                                                </p>
                                                                                <p className="text-xs font-semibold text-stone-700">
                                                                                    Capacity: {item.maxAdults} Adults / {item.maxKids} Kids
                                                                                </p>
                                                                                <div className="flex items-center justify-between">
                                                                                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                                                                                        ${item.price} / night
                                                                                    </p>
                                                                                    <p
                                                                                        className={`text-xs font-bold ${isUnavailable
                                                                                                ? "text-rose-600"
                                                                                                : "text-emerald-700"
                                                                                            }`}
                                                                                    >
                                                                                        {isUnavailable
                                                                                            ? "Sold out"
                                                                                            : `${remainingAvailable} available`}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                                                <div>
                                                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                                                        Adults
                                                    </label>
                                                    <select
                                                        value={room.adults}
                                                        disabled={!selectedPackage}
                                                        onChange={(e) =>
                                                            updateRoomGuests(room.id, "adults", e.target.value)
                                                        }
                                                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-800 disabled:cursor-not-allowed disabled:bg-stone-100"
                                                    >
                                                        {!selectedPackage ? (
                                                            <option value="1">Select package first</option>
                                                        ) : (
                                                            Array.from(
                                                                { length: adultMax },
                                                                (_, i) => i + 1,
                                                            ).map((count) => (
                                                                <option key={count} value={count}>
                                                                    {count}
                                                                </option>
                                                            ))
                                                        )}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                                                        Kids
                                                    </label>
                                                    <select
                                                        value={room.kids}
                                                        disabled={!selectedPackage}
                                                        onChange={(e) =>
                                                            updateRoomGuests(room.id, "kids", e.target.value)
                                                        }
                                                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-800 disabled:cursor-not-allowed disabled:bg-stone-100"
                                                    >
                                                        {!selectedPackage ? (
                                                            <option value="0">Select package first</option>
                                                        ) : (
                                                            Array.from(
                                                                { length: kidMax + 1 },
                                                                (_, i) => i,
                                                            ).map((count) => (
                                                                <option key={count} value={count}>
                                                                    {count}
                                                                </option>
                                                            ))
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {rooms.length > 1 &&
                            <div className="flex items-center gap-2.5 p-2 w-fit ml-auto font-bold">
                                <input type="checkbox" name="ClosetRoom" className="w-5 h-5" />
                                <SiGitconnected className="border rounded-full text-2xl p-0.5" />
                                <div className="group relative flex items-center">
                                    <span className="absolute bottom-full left-1/2 mb-3 w-48 -translate-x-1/2 scale-0 rounded-lg bg-gray-300 border p-3 text-xs text-black shadow-lg transition-all group-hover:scale-100">
                                        <p className="leading-relaxed">
                                            You can book a <span className="font-semibold text-blue-600">Closet Room</span> if available at the time of your stay.
                                        </p>
                                        {/* tail arrow */}
                                        <div className="absolute -bottom-1 left-4 h-2 w-2 rotate-45 bg-gray-300 border-b border-r"></div>
                                    </span>

                                    <label className="cursor-help"> Connecting Rooms</label>
                                </div>
                            </div>
                        }
                    </div>

                    <div className="border-t border-stone-200 p-4 sm:p-5">
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleBooking}
                                disabled={rooms.length === 0 || rooms.some(room => !room.packageId)}
                                className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-7 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-8 lg:px-14">
                <div className="mb-6 space-y-2 gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
                            Package Details
                        </p>
                        <h2 className="mt-2 text-3xl font-black text-stone-900 sm:text-4xl">
                            Review Packages Before Booking
                        </h2>
                    </div>
                    <p className="max-w-xl text-sm text-stone-600">
                        Check the room package details below before you assign a package to any room.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {reviewPackageList.length === 0 ? (
                        <div className="col-span-full rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-sm font-semibold text-stone-600 shadow-sm">
                            No package details available right now.
                        </div>
                    ) : (
                        reviewPackageList.map((item) => (
                            <article
                                key={item.id}
                                tabIndex={0}
                                className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
                            >
                                <img src={item.main_image} alt={item.name} className="h-52 w-full object-cover" />
                                <div className="space-y-4 p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-stone-900">{item.name}</h3>
                                            <p className="mt-1 text-sm text-stone-500">
                                                Capacity: {item.maxAdults} Adults / {item.maxKids} Kids
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm leading-relaxed text-stone-600">
                                        {item.description}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => openPackageDetails(item)}
                                        className="rounded-lg border border-emerald-700 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700 transition hover:bg-emerald-50"
                                    >
                                        View Package Details
                                    </button>

                                    <div className="rounded-2xl bg-stone-50 p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                                                Price
                                            </p>
                                            <p className="text-lg font-black text-emerald-700">{item.price}</p>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                            <div className="rounded-xl bg-white px-3 py-2">
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                                                    Adults
                                                </p>
                                                <p className="font-semibold text-stone-900">Up to {item.maxAdults}</p>
                                            </div>
                                            <div className="rounded-xl bg-white px-3 py-2">
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                                                    Kids
                                                </p>
                                                <p className="font-semibold text-stone-900">Up to {item.maxKids}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </section>

            { selectedRoom && 
                <RoomDetailsModal
                    selectedRoom={selectedRoom}
                    setCurrentImageIndex={setCurrentImageIndex}
                    onClose={closePackageDetails}
                />
            }
        </div>
    );
};

export default BookingRoom;