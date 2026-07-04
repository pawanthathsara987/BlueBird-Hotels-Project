import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
    MdDirectionsCar,
    MdSearch,
    MdPerson,
    MdCheckCircle,
    MdAccessTime,
    MdLocationOn,
    MdAdd,
    MdClose,
    MdCheck,
    MdEmail,
    MdPhone,
    MdFlag,
    MdWarning,
    MdCancel,
    MdCardMembership,
    MdDateRange
} from "react-icons/md";
import { toast } from "react-hot-toast";
import { Eye, FileText, Receipt, XCircle } from "lucide-react";

export default function VehicleBookings() {
    const [bookings, setBookings] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [driverPrice, setDriverPrice] = useState(1500);
    const [policy, setPolicy] = useState({ securityDepositAmount: 200.0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Booking form modal state
    const [showForm, setShowForm] = useState(false);
    const [availabilityError, setAvailabilityError] = useState("");
    const [newBooking, setNewBooking] = useState({
        vehicleId: "",
        fullName: "",
        email: "",
        phone: "",
        pickupDatetime: "",
        returnDatetime: "",
        pickupLocation: "Hotel Lobby",
        dropoffLocation: "Hotel Lobby",
        hireType: "without_driver",
        customerLicenseNo: "",
        customerLicenseExpiry: "",
        specialRequirements: "",
        isFullyPaid: true,
        paymentMethod: "cash"
    });

    const dateErrors = useMemo(() => {
        const errors = {};
        if (newBooking.pickupDatetime) {
            const pickup = new Date(newBooking.pickupDatetime);
            const now = new Date();
            const minPickup = new Date(now.getTime() + 59 * 60 * 1000); // 59 mins buffer
            
            if (pickup < minPickup) {
                errors.pickup = "Pickup time must be at least 1 hour in the future";
            }
        }
        
        if (newBooking.pickupDatetime && newBooking.returnDatetime) {
            const pickup = new Date(newBooking.pickupDatetime);
            const ret = new Date(newBooking.returnDatetime);
            
            if (ret <= pickup) {
                errors.return = "Return time must be strictly after the pickup time";
            }
        }
        return errors;
    }, [newBooking.pickupDatetime, newBooking.returnDatetime]);

    // Theme state
    const [theme, setTheme] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("saas_dashboard_theme") || '{"mode":"dark","accent":"teal"}');
        } catch {
            return { mode: "dark", accent: "teal" };
        }
    });

    useEffect(() => {
        fetchData();
        const updateTheme = () => {
            const saved = localStorage.getItem("saas_dashboard_theme");
            if (saved) setTheme(JSON.parse(saved));
        };
        window.addEventListener("theme_changed", updateTheme);
        window.addEventListener("storage", updateTheme);
        return () => {
            window.removeEventListener("theme_changed", updateTheme);
            window.removeEventListener("storage", updateTheme);
        };
    }, []);

    // Real-time availability check
    useEffect(() => {
        const checkAvailability = async () => {
            // First check date validation errors
            if (Object.keys(dateErrors).length > 0) {
                setAvailabilityError(Object.values(dateErrors)[0]);
                return;
            }

            if (!newBooking.vehicleId || !newBooking.pickupDatetime || !newBooking.returnDatetime) {
                setAvailabilityError("");
                return;
            }

            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/vehicle-bookings/check-availability`, {
                    params: {
                        vehicleId: newBooking.vehicleId,
                        pickupDatetime: newBooking.pickupDatetime,
                        returnDatetime: newBooking.returnDatetime
                    }
                });
                if (res.data.success) {
                    if (!res.data.available) {
                         setAvailabilityError("Vehicle is no longer available for the selected date range");
                    } else {
                         setAvailabilityError("");
                    }
                }
            } catch (error) {
                console.error("Availability check failed:", error);
                setAvailabilityError(error.response?.data?.message || "Availability check failed");
            }
        };

        const delayDebounceFn = setTimeout(() => {
            checkAvailability();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [newBooking.vehicleId, newBooking.pickupDatetime, newBooking.returnDatetime, dateErrors]);

    // Reset availability error when modal opens/closes
    useEffect(() => {
        if (!showForm) {
            setAvailabilityError("");
        }
    }, [showForm]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [bookingsRes, vehiclesRes, driverPriceRes, policyRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/vehicle-bookings`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/vehicles`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/driver-pricing`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/reception/vehicle-policy`)
            ]);

            if (bookingsRes.data.success) {
                setBookings(bookingsRes.data.data);
            }
            if (vehiclesRes.data.success) {
                // Filter to active/available or booked vehicles
                const filteredVehicles = (vehiclesRes.data.data || []).filter(v => v.status === "available" || v.status === "booked");
                setVehicles(filteredVehicles);
            }
            if (driverPriceRes.data.success) {
                setDriverPrice(parseFloat(driverPriceRes.data.data?.driverPricePerDay || 1500));
            }
            if (policyRes?.data?.success) {
                setPolicy(policyRes.data.data || { securityDepositAmount: 200.0 });
            }
        } catch (error) {
            console.error("Error loading vehicle bookings:", error);
            toast.error("Failed to load vehicle rentals metadata.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatLocalDatetime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Date calculations
    const getMinPickupDatetime = () => {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 1 * 60 * 60 * 1000);
        return formatLocalDatetime(oneHourLater);
    };

    const getMinReturnDatetime = () => {
        if (!newBooking.pickupDatetime) return getMinPickupDatetime();
        return newBooking.pickupDatetime;
    };

    const getCalculatedPrice = () => {
        if (!newBooking.vehicleId || !newBooking.pickupDatetime || !newBooking.returnDatetime) {
            return { numDays: 0, vehicleRate: 0, driverRate: 0, securityDeposit: 0, subtotal: 0, deposit: 0, balance: 0, total: 0 };
        }
        const selectedVehicle = vehicles.find(v => v.id === parseInt(newBooking.vehicleId));
        if (!selectedVehicle) {
            return { numDays: 0, vehicleRate: 0, driverRate: 0, securityDeposit: 0, subtotal: 0, deposit: 0, balance: 0, total: 0 };
        }

        const pickupDate = new Date(newBooking.pickupDatetime);
        const returnDate = new Date(newBooking.returnDatetime);
        if (isNaN(pickupDate.getTime()) || isNaN(returnDate.getTime()) || returnDate <= pickupDate) {
            return { numDays: 0, vehicleRate: 0, driverRate: 0, securityDeposit: 0, subtotal: 0, deposit: 0, balance: 0, total: 0 };
        }
        const diffMs = returnDate - pickupDate;
        const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
        const numDays = Math.max(1, Math.ceil(diffHours / 24));

        const vehicleRate = parseFloat(selectedVehicle.pricePerDay || 0);
        const driverRate = newBooking.hireType === "with_driver" ? driverPrice : 0;
        const securityDeposit = parseFloat(policy?.securityDepositAmount || 0);
        
        const subtotal = (vehicleRate + driverRate) * numDays;
        const total = subtotal + securityDeposit;
        const deposit = total;
        const balance = 0;

        return {
            numDays,
            diffHours,
            vehicleRate,
            driverRate,
            securityDeposit,
            subtotal,
            deposit,
            balance,
            total,
            brand: selectedVehicle.brand,
            model: selectedVehicle.model,
            plateNo: selectedVehicle.plateNo
        };
    };

    const priceDetails = getCalculatedPrice();

    const handleCreateBooking = async (e) => {
        e.preventDefault();

        const pickup = new Date(newBooking.pickupDatetime);
        const ret = new Date(newBooking.returnDatetime);

        if (Object.keys(dateErrors).length > 0) {
            toast.error(Object.values(dateErrors)[0]);
            return;
        }

        const bookingDays = Math.ceil((ret - pickup) / (1000 * 60 * 60 * 24));
        if (bookingDays > 30) {
            toast.error("Booking duration cannot exceed 30 days.");
            return;
        }

        if (newBooking.hireType === "without_driver") {
            if (!newBooking.customerLicenseNo || !newBooking.customerLicenseExpiry) {
                toast.error("License details are required for self-drive bookings.");
                return;
            }
            const expiry = new Date(newBooking.customerLicenseExpiry);
            if (expiry < ret) {
                toast.error("Driver license expires before the return date.");
                return;
            }
        }

        const confirmMsg = `Confirm Vehicle Booking?\n\n` +
            `🚗 Vehicle: ${priceDetails.brand} ${priceDetails.model} (${priceDetails.plateNo})\n` +
            `📅 Duration: ${priceDetails.diffHours} hour(s) (${priceDetails.numDays} day(s))\n` +
            `🛡️ Security Deposit (Refundable): LKR ${priceDetails.securityDeposit.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
            `👤 Guest: ${newBooking.fullName}\n` +
            `📞 Phone: ${newBooking.phone}\n` +
            `💵 Estimated Total: LKR ${priceDetails.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n\n` +
            `Do you want to proceed and save this booking?`;

        if (!window.confirm(confirmMsg)) {
            return;
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/reception/vehicle-bookings`, newBooking);
            if (res.data.success) {
                toast.success("Vehicle rental booking created successfully!");
                setShowForm(false);
                setNewBooking({
                    vehicleId: "",
                    fullName: "",
                    email: "",
                    phone: "",
                    pickupDatetime: "",
                    returnDatetime: "",
                    pickupLocation: "Hotel Lobby",
                    dropoffLocation: "Hotel Lobby",
                    hireType: "without_driver",
                    customerLicenseNo: "",
                    customerLicenseExpiry: "",
                    specialRequirements: "",
                    isFullyPaid: true,
                    paymentMethod: "cash"
                });
                fetchData();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to create vehicle booking.");
        }
    };

    const handleCancelBooking = async (id) => {
        const reason = window.prompt("Please enter the reason for cancellation:");
        if (reason === null) return; // cancelled prompt

        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/reception/vehicle-bookings/${id}/cancel`, {
                cancellationReason: reason || "Cancelled by receptionist at hotel desk"
            });
            if (res.data.success) {
                toast.success("Booking cancelled successfully!");
                fetchData();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to cancel booking.");
        }
    };

    // Helper to format date nicely
    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleString();
        } catch {
            return dateStr;
        }
    };

    // Print Invoice layout
    const handlePrintInvoice = (booking) => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Popup blocked! Please allow popups to print invoices.");
            return;
        }
        
        const vehicleInfo = `${booking.vehicle?.brand || ""} ${booking.vehicle?.model || ""}`;
        const plateNo = booking.vehicle?.plateNo || "N/A";
        const guestName = `${booking.customer?.firstName || ""} ${booking.customer?.lastName || ""}` || "Guest";
        const guestEmail = booking.customer?.email || "N/A";
        const guestPhone = booking.customer?.phoneNumber || "N/A";
        
        const subtotal = parseFloat(booking.subtotal || 0);
        const securityDeposit = parseFloat(booking.securityDepositCollected || 0);
        const totalPayable = parseFloat(booking.totalPayable || 0);
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Invoice - ${booking.bookingNo}</title>
                <style>
                    body { font-family: 'Segoe UI', Roboto, sans-serif; color: #333; margin: 40px; line-height: 1.5; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 20px; }
                    .logo { font-size: 24px; font-weight: 900; color: #0284c7; letter-spacing: 1px; }
                    .title { font-size: 28px; font-weight: 850; text-align: right; color: #1e293b; }
                    .details { display: flex; justify-content: space-between; margin-top: 30px; }
                    .section-title { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
                    .info-block { flex: 1; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin-top: 40px; }
                    .invoice-table th { background: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 12px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; }
                    .invoice-table td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; }
                    .totals { width: 40%; margin-left: auto; margin-top: 30px; font-size: 13px; }
                    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
                    .grand-total { font-weight: 900; font-size: 16px; color: #0284c7; border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 8px; }
                    .footer { text-align: center; margin-top: 60px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">BLUEBIRD HOTELS</div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Negombo Shoreline Resort, Sri Lanka</div>
                    </div>
                    <div>
                        <div class="title">RENTAL INVOICE</div>
                        <div style="font-size: 12px; font-weight: bold; color: #64748b; text-align: right; margin-top: 4px;"># ${booking.bookingNo}</div>
                    </div>
                </div>
                
                <div class="details">
                    <div class="info-block">
                        <div class="section-title">Billed To</div>
                        <div style="font-weight: bold; font-size: 15px; color: #1e293b;">${guestName}</div>
                        <div style="font-size: 12px; color: #475569; margin-top: 2px;">Email: ${guestEmail}</div>
                        <div style="font-size: 12px; color: #475569;">Phone: ${guestPhone}</div>
                    </div>
                    <div class="info-block" style="text-align: right;">
                        <div class="section-title">Rental Information</div>
                        <div style="font-size: 12px; color: #475569;">Pickup: ${formatDate(booking.pickupDatetime)}</div>
                        <div style="font-size: 12px; color: #475569;">Return: ${formatDate(booking.returnDatetime)}</div>
                        <div style="font-size: 12px; color: #475569;">Duration: ${booking.numDays} Day(s)</div>
                    </div>
                </div>
                
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Daily Rate</th>
                            <th>Duration</th>
                            <th style="text-align: right;">Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>Vehicle Hire</strong><br/>
                                <span style="font-size: 11px; color: #64748b;">${vehicleInfo} (${plateNo}) - ${booking.hireType.replace('_', ' ')}</span>
                            </td>
                            <td>LKR ${parseFloat(booking.vehicleRatePerDay).toLocaleString()}</td>
                            <td>${booking.numDays} Day(s)</td>
                            <td style="text-align: right; font-weight: bold;">LKR ${(parseFloat(booking.vehicleRatePerDay) * booking.numDays).toLocaleString()}</td>
                        </tr>
                        ${booking.driverRatePerDay > 0 ? `
                        <tr>
                            <td>
                                <strong>Driver Charge</strong><br/>
                                <span style="font-size: 11px; color: #64748b;">Assigned Professional Chauffeur Service</span>
                            </td>
                            <td>LKR ${parseFloat(booking.driverRatePerDay).toLocaleString()}</td>
                            <td>${booking.numDays} Day(s)</td>
                            <td style="text-align: right; font-weight: bold;">LKR ${(parseFloat(booking.driverRatePerDay) * booking.numDays).toLocaleString()}</td>
                        </tr>
                        ` : ''}
                    </tbody>
                </table>
                
                <div class="totals">
                    <div class="total-row">
                        <span style="color: #64748b;">Rental Subtotal:</span>
                        <span style="font-weight: bold;">LKR ${subtotal.toLocaleString()}</span>
                    </div>
                    <div class="total-row">
                        <span style="color: #64748b;">Security Deposit (Refundable):</span>
                        <span style="font-weight: bold;">LKR ${securityDeposit.toLocaleString()}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Invoice Total:</span>
                        <span>LKR ${totalPayable.toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Thank you for choosing BlueBird Hotels. Drive safely!</p>
                    <p style="font-size: 9px; margin-top: 10px;">This is a system generated invoice copy and requires no physical signature.</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    // Print Receipt layout
    const handlePrintReceipt = (booking) => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Popup blocked! Please allow popups to print receipts.");
            return;
        }
        
        const vehicleInfo = `${booking.vehicle?.brand || ""} ${booking.vehicle?.model || ""}`;
        const plateNo = booking.vehicle?.plateNo || "N/A";
        const guestName = `${booking.customer?.firstName || ""} ${booking.customer?.lastName || ""}` || "Guest";
        
        const total = parseFloat(booking.totalPayable || 0);
        const paidAmount = booking.balancePaidAt ? total : parseFloat(booking.depositAmount || 0);
        const receiptType = booking.balancePaidAt ? "FULL PAYMENT RECEIPT" : "DEPOSIT RECEIPT";
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Receipt - ${booking.bookingNo}</title>
                <style>
                    body { font-family: 'Segoe UI', Roboto, sans-serif; color: #333; margin: 40px; line-height: 1.5; }
                    .receipt-container { max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
                    .header { text-align: center; border-bottom: 2px dashed #0d9488; padding-bottom: 20px; margin-bottom: 20px; }
                    .logo { font-size: 20px; font-weight: 900; color: #0d9488; letter-spacing: 1px; }
                    .title { font-size: 22px; font-weight: 850; color: #1e293b; margin-top: 10px; }
                    .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
                    .receipt-row.total { font-size: 18px; font-weight: 900; color: #0d9488; border-top: 2px solid #e2e8f0; border-bottom: none; padding-top: 15px; margin-top: 10px; }
                    .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #94a3b8; }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="header">
                        <div class="logo">BLUEBIRD HOTELS</div>
                        <div class="title">${receiptType}</div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Ref #: ${booking.bookingNo}</div>
                    </div>
                    
                    <div class="receipt-row">
                        <span>Customer Name:</span>
                        <span style="font-weight: bold;">${guestName}</span>
                    </div>
                    <div class="receipt-row">
                        <span>Vehicle Details:</span>
                        <span style="font-weight: bold;">${vehicleInfo} (${plateNo})</span>
                    </div>
                    <div class="receipt-row">
                        <span>Duration:</span>
                        <span style="font-weight: bold;">${booking.numDays} Day(s)</span>
                    </div>
                    <div class="receipt-row">
                        <span>Payment Method:</span>
                        <span style="font-weight: bold; text-transform: uppercase;">${booking.balancePaymentMethod || "Cash"}</span>
                    </div>
                    <div class="receipt-row">
                        <span>Transaction Date:</span>
                        <span style="font-weight: bold;">${new Date().toLocaleString()}</span>
                    </div>
                    <div class="receipt-row total">
                        <span>Paid Amount:</span>
                        <span>LKR ${paidAmount.toLocaleString()}</span>
                    </div>
                    
                    <div class="footer">
                        <p>Thank you for your payment!</p>
                        <p>BlueBird Hotels - Negombo Shoreline Resort</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    // Filtered bookings
    const filteredBookings = bookings.filter((b) => {
        const guestName = `${b.customer?.firstName || ""} ${b.customer?.lastName || ""}`.toLowerCase();
        const matchesSearch = guestName.includes(searchTerm.toLowerCase()) ||
            b.bookingNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.vehicle?.plateNo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" ? true : b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        const mapping = {
            confirmed: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25",
            balance_paid: "bg-teal-500/10 text-teal-500 border border-teal-500/25",
            ongoing: "bg-blue-500/10 text-blue-500 border border-blue-500/25",
            returned: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/25",
            completed: "bg-purple-500/10 text-purple-500 border border-purple-500/25",
            cancelled: "bg-rose-500/10 text-rose-500 border border-rose-500/25",
            pending_payment: "bg-amber-500/10 text-amber-500 border border-amber-500/25",
            expired: "bg-slate-500/10 text-slate-500 border border-slate-500/25"
        };
        return mapping[status] || "bg-slate-500/10 text-slate-500 border border-slate-500/25";
    };

    const getAccents = () => {
        const colorAccents = {
            teal: { text: "text-[#0d9488]", bg: "bg-[#0d9488] hover:bg-[#0f766e]", border: "border-[#0d9488]" },
            blue: { text: "text-blue-600", bg: "bg-blue-600 hover:bg-blue-700", border: "border-blue-600" },
            emerald: { text: "text-emerald-600", bg: "bg-emerald-600 hover:bg-emerald-700", border: "border-emerald-600" },
            indigo: { text: "text-indigo-600", bg: "bg-indigo-600 hover:bg-indigo-700", border: "border-indigo-600" }
        };
        return colorAccents[theme.accent] || colorAccents.teal;
    };

    const currentAccent = getAccents();

    // Summary counts
    const totalCount = bookings.length;
    const activeCount = bookings.filter(b => b.status === "ongoing").length;
    const pendingPayCount = bookings.filter(b => b.status === "pending_payment").length;
    const cancelledCount = bookings.filter(b => b.status === "cancelled").length;

    return (
        <div className={`w-full px-6 py-6 min-h-screen transition-colors duration-300 ${
            theme.mode === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-[#fafafa] text-slate-800"
        }`}>
            {/* Header Block */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider flex items-center gap-2">
                        <MdDirectionsCar className={currentAccent.text} /> Vehicle Rental Management
                    </h1>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                        Reception Desk: Book vehicles, collect security deposits, and view hire bookings
                    </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                    <button
                        onClick={() => window.open("http://localhost:5173/vehicles", "_blank")}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100/50 dark:hover:bg-slate-800 rounded-xl transition duration-200 cursor-pointer shadow-sm text-slate-700 dark:text-slate-200"
                    >
                        <MdDirectionsCar size={16} className={currentAccent.text} /> View Vehicles Page
                    </button>
                    <button
                        onClick={() => {
                            const now = new Date();
                            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
                            const twoHoursLater = new Date(now.getTime() + 120 * 60 * 1000);
                            setNewBooking({
                                vehicleId: "",
                                fullName: "",
                                email: "",
                                phone: "",
                                pickupDatetime: formatLocalDatetime(oneHourLater),
                                returnDatetime: formatLocalDatetime(twoHoursLater),
                                pickupLocation: "Hotel Lobby",
                                dropoffLocation: "Hotel Lobby",
                                hireType: "without_driver",
                                customerLicenseNo: "",
                                customerLicenseExpiry: "",
                                specialRequirements: "",
                                isFullyPaid: true,
                                paymentMethod: "cash"
                            });
                            setShowForm(true);
                        }}
                        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-md cursor-pointer transition ${currentAccent.bg}`}
                    >
                        <MdAdd size={16} /> Book A Vehicle
                    </button>
                </div>
            </div>

            {/* Dashboard Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Rentals", val: totalCount, icon: "📦", color: "text-slate-400 bg-slate-500/10" },
                    { label: "Ongoing Hires", val: activeCount, icon: "🚗", color: "text-blue-500 bg-blue-500/10" },
                    { label: "Awaiting Payment", val: pendingPayCount, icon: "💵", color: "text-amber-500 bg-amber-500/10" },
                    { label: "Cancelled Hires", val: cancelledCount, icon: "✕", color: "text-rose-500 bg-rose-500/10" }
                ].map((c, i) => (
                    <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between shadow-xs ${
                        theme.mode === "dark" ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100"
                    }`}>
                        <div>
                            <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">{c.label}</span>
                            <span className="text-2xl font-black block mt-1">{c.val}</span>
                        </div>
                        <span className={`text-xl p-2.5 rounded-xl ${c.color}`}>{c.icon}</span>
                    </div>
                ))}
            </div>

            {/* Filter Search Bar */}
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center gap-4 mb-6 ${
                theme.mode === "dark" ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100"
            }`}>
                <div className="relative w-full md:w-80">
                    <MdSearch className="absolute left-3 top-3.5 text-slate-400 text-base" />
                    <input
                        type="text"
                        placeholder="Search guest name or booking no..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none font-semibold"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    {["all", "pending_payment", "confirmed", "ongoing", "completed", "cancelled"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition cursor-pointer select-none whitespace-nowrap ${
                                statusFilter === st
                                    ? currentAccent.bg + " text-white " + currentAccent.border
                                    : theme.mode === "dark"
                                        ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                                        : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            {st.replace("_", " ")}
                        </button>
                    ))}
                </div>
            </div>

            {/* Booking Records Table */}
            <div className={`rounded-2xl border overflow-hidden shadow-sm ${
                theme.mode === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}>
                {isLoading ? (
                    <div className="py-20 text-center">
                        <span className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                        <p className="text-slate-500 mt-2 text-xs font-bold">Loading rental bookings...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 font-bold text-sm">
                        No vehicle bookings found matching the criteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={theme.mode === "dark" ? "bg-slate-900 border-b border-slate-850" : "bg-slate-50 border-b border-slate-100"}>
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Booking No</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Vehicle</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Guest</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Rental Period</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Hire Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Price Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                                {filteredBookings.map((b) => {
                                    const guestName = b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : "Walk-in Guest";
                                    const vehicleInfo = b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : "Custom Vehicle";
                                    
                                    const vehicleCost = parseFloat(b.vehicleRatePerDay || 0) * parseInt(b.numDays);
                                    const driverCost = parseFloat(b.driverRatePerDay || 0) * parseInt(b.numDays);
                                    const total = parseFloat(b.totalPayable || 0);

                                    return (
                                        <tr key={b.id} className={theme.mode === "dark" ? "hover:bg-slate-800/20" : "hover:bg-slate-50/50"}>
                                            <td className="px-6 py-4 font-bold text-blue-500">{b.bookingNo}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-extrabold text-slate-850 dark:text-slate-200">{vehicleInfo}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">{b.vehicle?.plateNo}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-extrabold text-slate-800 dark:text-slate-200">{guestName}</div>
                                                <div className="flex flex-col text-[10px] text-slate-500 mt-0.5 space-y-0.5">
                                                    <span className="flex items-center gap-0.5"><MdEmail size={11} /> {b.customer?.email}</span>
                                                    <span className="flex items-center gap-0.5"><MdPhone size={11} /> {b.customer?.phoneNumber}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-700 dark:text-slate-350 flex flex-col gap-0.5 text-[10px]">
                                                    <span className="flex items-center gap-1"><MdAccessTime size={12} /> Pickup: {new Date(b.pickupDatetime).toLocaleString()}</span>
                                                    <span className="flex items-center gap-1"><MdDateRange size={12} /> Return: {new Date(b.returnDatetime).toLocaleString()}</span>
                                                    <span className="font-bold text-teal-650 dark:text-teal-400 mt-0.5">{b.numDays} day(s)</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold capitalize">
                                                {b.hireType.replace("_", " ")}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusColor(b.status)}`}>
                                                    {b.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5 text-[10px] text-slate-500 font-medium min-w-[130px]">
                                                    <span className="flex justify-between gap-4">
                                                        <span>Vehicle:</span>
                                                        <span className="font-semibold text-slate-700 dark:text-slate-350">LKR {vehicleCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </span>
                                                    {driverCost > 0 && (
                                                        <span className="flex justify-between gap-4 text-teal-650 dark:text-teal-400">
                                                            <span>Driver:</span>
                                                            <span className="font-semibold">+ LKR {driverCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </span>
                                                    )}
                                                    <div className="border-t border-slate-200 dark:border-slate-800 my-0.5"></div>
                                                    <span className="flex justify-between gap-4 font-black text-slate-900 dark:text-white text-xs">
                                                        <span>Total:</span>
                                                        <span className={currentAccent.text}>LKR {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </span>
                                                    <div className="text-[9px] text-slate-400 mt-1">
                                                        Paid: LKR {b.balancePaidAt ? total.toLocaleString() : parseFloat(b.depositAmount).toLocaleString()} ({b.balancePaidAt ? "Full" : "50% Dep"})
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedBooking(b)}
                                                        title="View rental details"
                                                        className="p-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 rounded-lg text-slate-650 hover:text-slate-850 dark:text-slate-300 dark:hover:text-white transition cursor-pointer shadow-2xs"
                                                    >
                                                        <Eye size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePrintInvoice(b)}
                                                        title="Print rental invoice"
                                                        className="p-1.5 bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30 rounded-lg text-blue-650 dark:text-blue-400 hover:text-blue-800 transition cursor-pointer shadow-2xs"
                                                    >
                                                        <FileText size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePrintReceipt(b)}
                                                        title="Print payment receipt"
                                                        className="p-1.5 bg-cyan-50 border border-cyan-100 dark:bg-cyan-950/20 dark:border-cyan-900/30 rounded-lg text-cyan-700 dark:text-cyan-450 hover:text-cyan-900 transition cursor-pointer shadow-2xs"
                                                    >
                                                        <Receipt size={13} />
                                                    </button>
                                                    {!["cancelled", "completed", "returned"].includes(b.status) ? (
                                                        <button
                                                            onClick={() => handleCancelBooking(b.id)}
                                                            title="Cancel reservation"
                                                            className="p-1.5 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 rounded-lg text-rose-650 dark:text-rose-450 hover:text-rose-800 transition cursor-pointer shadow-2xs"
                                                        >
                                                            <XCircle size={13} />
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* BOOKING CREATE FORM MODAL */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className={`w-full max-w-4xl rounded-2xl shadow-2xl border flex flex-col md:flex-row overflow-hidden max-h-[90vh] ${
                        theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
                    }`}>
                        {/* Left Side: Live Price Summary Panel */}
                        <div className={`w-full md:w-80 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r ${
                            theme.mode === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-100"
                        }`}>
                            <div>
                                <h3 className="text-xs uppercase font-black text-slate-400 tracking-wider mb-4">Rental Cost Summary</h3>
                                {priceDetails.total > 0 ? (
                                    <div className="space-y-3.5 text-xs font-bold">
                                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Selected Vehicle</span>
                                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1 block truncate">
                                                🚗 {priceDetails.brand} {priceDetails.model}
                                            </span>
                                            <span className="text-[10px] text-slate-450 dark:text-slate-400 block mt-0.5">
                                                Rate: LKR {priceDetails.vehicleRate.toLocaleString()}/day
                                            </span>
                                        </div>

                                        <div className="space-y-2 py-2 border-b dark:border-slate-800/80 border-slate-200/80">
                                            <div className="flex justify-between text-slate-500">
                                                <span>Duration:</span>
                                                <span>{priceDetails.diffHours} hour(s) ({priceDetails.numDays} day(s))</span>
                                            </div>
                                            <div className="flex justify-between text-slate-600 dark:text-slate-350">
                                                <span>Vehicle Total:</span>
                                                <span>LKR {(priceDetails.vehicleRate * priceDetails.numDays).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            {priceDetails.driverRate > 0 && (
                                                <div className="flex justify-between text-teal-650 dark:text-teal-400">
                                                    <span>Driver Total:</span>
                                                    <span>+ LKR {(priceDetails.driverRate * priceDetails.numDays).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                            {priceDetails.securityDeposit > 0 && (
                                                <div className="flex justify-between text-indigo-600 dark:text-indigo-400">
                                                    <span>Security Deposit (Refundable):</span>
                                                    <span>+ LKR {priceDetails.securityDeposit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2.5 pt-1 border-t dark:border-slate-800 border-slate-200">
                                            <div className="flex justify-between font-black text-slate-900 dark:text-white text-sm">
                                                <span>Estimated Total:</span>
                                                <span className={currentAccent.text}>LKR {priceDetails.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-slate-400 text-[11px] font-bold">
                                        Select vehicle, dates, and hire type to see live calculations.
                                    </div>
                                )}
                            </div>

                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-6">
                                ℹ️ Walk-in bookings default to immediate deposit confirmation. Full payment options are recorded at the desk.
                            </div>
                        </div>

                        {/* Right Side: Booking Form */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b dark:border-slate-800 border-slate-100 flex-shrink-0">
                                <h2 className="text-sm font-black uppercase tracking-wide flex items-center gap-1.5">
                                    🔑 New Vehicle Rental Booking
                                </h2>
                                <button onClick={() => setShowForm(false)} className="cursor-pointer">
                                    <MdClose size={22} className={theme.mode === "dark" ? "text-white" : "text-slate-600"} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateBooking} className="flex-grow p-6 overflow-y-auto space-y-5 text-xs text-left font-bold">
                                {/* Vehicle Selection Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-550 mb-2">Select Vehicle *</label>
                                        <select
                                            required
                                            value={newBooking.vehicleId}
                                            onChange={(e) => setNewBooking({ ...newBooking, vehicleId: e.target.value })}
                                            className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-3 outline-none cursor-pointer transition-all ${
                                                availabilityError.includes("no longer available") || availabilityError.includes("not available")
                                                    ? "border-rose-500 bg-rose-50/10 focus:border-rose-500 text-rose-600 dark:text-rose-450"
                                                    : "border-slate-200 dark:border-slate-800 focus:border-blue-500"
                                            }`}
                                        >
                                            <option value="">-- Select Active Vehicle --</option>
                                            {vehicles.map((v) => (
                                                <option key={v.id} value={v.id}>
                                                    {v.brand} {v.model} ({v.plateNo}) · LKR {parseFloat(v.pricePerDay).toLocaleString()}/day
                                                </option>
                                            ))}
                                        </select>
                                        {(availabilityError.includes("no longer available") || availabilityError.includes("not available")) && (
                                            <p className="text-[10px] text-rose-500 font-bold mt-1.5 flex items-center gap-1 select-none">
                                                ⚠️ {availabilityError}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-slate-550 mb-2">Hire Type *</label>
                                        <select
                                            value={newBooking.hireType}
                                            onChange={(e) => setNewBooking({ ...newBooking, hireType: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none cursor-pointer"
                                        >
                                            <option value="without_driver">Self Drive (Without Driver)</option>
                                            <option value="with_driver">Hire With Driver (+ LKR {driverPrice.toLocaleString()}/day)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Guest Details Row */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-slate-550 mb-2">Guest Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Full name"
                                            value={newBooking.fullName}
                                            onChange={(e) => setNewBooking({ ...newBooking, fullName: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-550 mb-2">Guest Email *</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="Email address"
                                            value={newBooking.email}
                                            onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-550 mb-2">Phone Number *</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="Phone number"
                                            value={newBooking.phone}
                                            onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Pickup and Return Datetimes Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-550 mb-2">Pickup Date & Time *</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            style={{ colorScheme: theme.mode }}
                                            min={getMinPickupDatetime()}
                                            value={newBooking.pickupDatetime}
                                            onChange={(e) => setNewBooking({ ...newBooking, pickupDatetime: e.target.value })}
                                            className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-3 outline-none transition-all ${
                                                dateErrors.pickup
                                                    ? "border-rose-500 bg-rose-50/10 focus:border-rose-500 text-rose-600 dark:text-rose-450"
                                                    : "border-slate-200 dark:border-slate-800 focus:border-blue-500"
                                            }`}
                                        />
                                        {dateErrors.pickup && (
                                            <p className="text-[10px] text-rose-500 font-bold mt-1.5 flex items-center gap-1 select-none">
                                                ⚠️ {dateErrors.pickup}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-slate-550 mb-2">Return Date & Time *</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            style={{ colorScheme: theme.mode }}
                                            min={getMinReturnDatetime()}
                                            value={newBooking.returnDatetime}
                                            onChange={(e) => setNewBooking({ ...newBooking, returnDatetime: e.target.value })}
                                            className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-3 outline-none transition-all ${
                                                dateErrors.return
                                                    ? "border-rose-500 bg-rose-50/10 focus:border-rose-500 text-rose-600 dark:text-rose-450"
                                                    : "border-slate-200 dark:border-slate-800 focus:border-blue-500"
                                            }`}
                                        />
                                        {dateErrors.return && (
                                            <p className="text-[10px] text-rose-500 font-bold mt-1.5 flex items-center gap-1 select-none">
                                                ⚠️ {dateErrors.return}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Pickup & Return Locations */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-550 mb-2">Pickup Location *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newBooking.pickupLocation}
                                            onChange={(e) => setNewBooking({ ...newBooking, pickupLocation: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-550 mb-2">Dropoff Location *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newBooking.dropoffLocation}
                                            onChange={(e) => setNewBooking({ ...newBooking, dropoffLocation: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* License details (WITHOUT driver only) */}
                                {newBooking.hireType === "without_driver" && (
                                    <div className={`grid grid-cols-2 gap-3 p-4 rounded-xl border ${
                                        theme.mode === "dark"
                                            ? "bg-slate-950/40 border-slate-850"
                                            : "bg-slate-50 border-slate-200/50"
                                    }`}>
                                        <div>
                                            <label className="block text-slate-550 mb-2">Driver License Number *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="License card number"
                                                value={newBooking.customerLicenseNo}
                                                onChange={(e) => setNewBooking({ ...newBooking, customerLicenseNo: e.target.value })}
                                                className={`w-full border rounded-xl p-3 outline-none ${
                                                    theme.mode === "dark"
                                                        ? "bg-slate-900 border-slate-800 text-white"
                                                        : "bg-white border-slate-200 text-slate-800"
                                                }`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-550 mb-2">License Expiry Date *</label>
                                            <input
                                                type="date"
                                                required
                                                style={{ colorScheme: theme.mode }}
                                                value={newBooking.customerLicenseExpiry}
                                                onChange={(e) => setNewBooking({ ...newBooking, customerLicenseExpiry: e.target.value })}
                                                className={`w-full border rounded-xl p-3 outline-none ${
                                                    theme.mode === "dark"
                                                        ? "bg-slate-900 border-slate-800 text-white"
                                                        : "bg-white border-slate-200 text-slate-800"
                                                }`}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Special Notes */}
                                <div>
                                    <label className="block text-slate-550 mb-2">Special Notes & Requirements</label>
                                    <textarea
                                        rows="2"
                                        placeholder="e.g. GPS needed, baby seat, extra luggage space..."
                                        value={newBooking.specialRequirements}
                                        onChange={(e) => setNewBooking({ ...newBooking, specialRequirements: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none font-bold"
                                    />
                                </div>



                                {/* Availability warning banner */}
                                {availabilityError && (
                                    <div className="flex items-center gap-2 p-4 bg-rose-500/10 text-rose-500 border border-rose-500/25 rounded-xl font-bold text-xs animate-pulse">
                                        <MdWarning size={16} className="flex-shrink-0" />
                                        <span>{availabilityError}</span>
                                    </div>
                                )}

                                {/* Form Action Buttons */}
                                <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800 border-slate-100 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-5 py-3 rounded-xl border dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-black cursor-pointer transition text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!!availabilityError}
                                        className={`px-6 py-3 text-white rounded-xl flex items-center gap-1.5 font-black transition shadow-md ${
                                            availabilityError 
                                                ? "bg-slate-400 dark:bg-slate-850 cursor-not-allowed opacity-60 shadow-none text-slate-500 dark:text-slate-400" 
                                                : currentAccent.bg + " cursor-pointer"
                                        }`}
                                    >
                                        <MdCheckCircle size={16} /> Confirm Hire Booking
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* BOOKING DETAILS VIEW MODAL */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden max-h-[90vh] flex flex-col ${
                        theme.mode === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
                    }`}>
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-black tracking-tight flex items-center gap-1.5">
                                    🚗 Rental Booking Details
                                </h3>
                                <p className="text-[10px] font-bold text-blue-500 mt-0.5">Reference No: {selectedBooking.bookingNo}</p>
                            </div>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="p-1 text-slate-400 hover:text-slate-650 dark:hover:text-white rounded-lg transition cursor-pointer"
                            >
                                <MdClose size={20} />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="p-6 overflow-y-auto space-y-6 text-xs">
                            {/* Rental Summary Card */}
                            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80">
                                <div>
                                    <span className="text-[10px] text-slate-450 uppercase block">Vehicle</span>
                                    <span className="font-extrabold text-slate-850 dark:text-slate-100 mt-1 block">
                                        {selectedBooking.vehicle?.brand} {selectedBooking.vehicle?.model}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">Plate No: {selectedBooking.vehicle?.plateNo}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-450 uppercase block">Status</span>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mt-1 ${getStatusColor(selectedBooking.status)}`}>
                                        {selectedBooking.status.replace("_", " ")}
                                    </span>
                                </div>
                            </div>

                            {/* Guest Details */}
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white border-b dark:border-slate-800 pb-2 mb-3 uppercase tracking-wider text-[10px]">
                                    👤 Guest Information
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Full Name</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedBooking.customer?.firstName} {selectedBooking.customer?.lastName}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Email Address</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedBooking.customer?.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Phone Number</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedBooking.customer?.phoneNumber}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule & Duration */}
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white border-b dark:border-slate-800 pb-2 mb-3 uppercase tracking-wider text-[10px]">
                                    📅 Booking Schedule
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Pickup Date & Time</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{new Date(selectedBooking.pickupDatetime).toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-400 mt-0.5 block">Location: {selectedBooking.pickupLocation}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Return Date & Time</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{new Date(selectedBooking.returnDatetime).toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-400 mt-0.5 block">Location: {selectedBooking.dropoffLocation}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[10px] text-slate-400 block">Rental Duration</span>
                                        <span className="font-extrabold text-teal-650 dark:text-teal-400 mt-0.5 block">{selectedBooking.numDays} Day(s)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Self-Drive License Details (if applicable) */}
                            {selectedBooking.hireType === "without_driver" && selectedBooking.customerLicenseNo && (
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white border-b dark:border-slate-800 pb-2 mb-3 uppercase tracking-wider text-[10px]">
                                        🪪 Driver's License Information
                                    </h4>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/80">
                                        <div>
                                            <span className="text-[10px] text-slate-400 block">License Number</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedBooking.customerLicenseNo}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 block">License Expiry</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{new Date(selectedBooking.customerLicenseExpiry).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Pricing Breakdown */}
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white border-b dark:border-slate-800 pb-2 mb-3 uppercase tracking-wider text-[10px]">
                                    💵 Payment Breakdown
                                </h4>
                                <div className="space-y-2 max-w-md">
                                    <div className="flex justify-between">
                                        <span className="text-slate-450">Vehicle Cost ({selectedBooking.numDays} Day(s)):</span>
                                        <span className="font-bold">LKR {(parseFloat(selectedBooking.vehicleRatePerDay || 0) * selectedBooking.numDays).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    {selectedBooking.driverRatePerDay > 0 && (
                                        <div className="flex justify-between text-teal-650 dark:text-teal-400">
                                            <span>Driver Service Fee:</span>
                                            <span className="font-bold">+ LKR {(parseFloat(selectedBooking.driverRatePerDay) * selectedBooking.numDays).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    {selectedBooking.securityDepositCollected > 0 && (
                                        <div className="flex justify-between text-indigo-600 dark:text-indigo-400">
                                            <span>Security Deposit (Paid):</span>
                                            <span className="font-bold">+ LKR {parseFloat(selectedBooking.securityDepositCollected).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>
                                    <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white">
                                        <span>Total Paid:</span>
                                        <span className={currentAccent.text}>LKR {parseFloat(selectedBooking.totalPayable || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Special Requirements */}
                            {selectedBooking.specialRequirements && (
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white border-b dark:border-slate-800 pb-2 mb-2 uppercase tracking-wider text-[10px]">
                                        📝 Special Notes & Requests
                                    </h4>
                                    <p className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/80 rounded-xl leading-relaxed italic text-slate-700 dark:text-slate-350">
                                        {selectedBooking.specialRequirements}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 gap-2">
                            <button
                                onClick={() => handlePrintInvoice(selectedBooking)}
                                className="flex items-center gap-1 px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer text-slate-755 dark:text-slate-250 bg-white dark:bg-slate-900"
                            >
                                <FileText size={14} /> Print Invoice
                            </button>
                            <button
                                onClick={() => handlePrintReceipt(selectedBooking)}
                                className="flex items-center gap-1 px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer text-slate-755 dark:text-slate-250 bg-white dark:bg-slate-900"
                            >
                                <Receipt size={14} /> Print Receipt
                            </button>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className={`px-5 py-2 text-xs font-bold text-white rounded-xl cursor-pointer transition shadow-xs ${currentAccent.bg}`}
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
