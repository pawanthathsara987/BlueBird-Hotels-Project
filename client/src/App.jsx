import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/homePage";
import StaffLogin from "./pages/admin/StaffLogin";
import CustomerLoginPage from "./pages/auth/CustomerLoginPage";
import axios from "axios";

// ── Token Setup ───────────────────────────────────────────────────────────────
// On every page load, re-attach the stored token to all Axios requests so the
// user does not need to log in again after a browser refresh.
const token = localStorage.getItem("token");
if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// ── 401 Interceptor (role-aware) ──────────────────────────────────────────────
// When any API call returns 401 (no token / expired token / invalid token),
// clear the stored token and redirect the user to the correct login page based
// on the role that was previously decoded from the JWT.
const ROLE_LOGIN_MAP = {
    admin:        "/staffLogin",
    manager:      "/staffLogin",
    receptionist: "/staffLogin",
    customer:     "/customerLogin",
};

axios.interceptors.response.use(
    (response) => response,                       // pass successful responses through
    (error) => {
        if (error.response?.status === 401) {
            // Find out which login page to send the user to
            let redirectTo = "/";
            try {
                const storedToken = localStorage.getItem("token");
                if (storedToken) {
                    // Inline decode – avoids an extra import at module level
                    const payload = JSON.parse(atob(storedToken.split(".")[1]));
                    redirectTo = ROLE_LOGIN_MAP[payload?.role] || "/";
                }
            } catch {
                // Malformed token — fall back to home
            }

            // Clean up stale credentials
            localStorage.removeItem("token");
            delete axios.defaults.headers.common["Authorization"];

            window.location.href = redirectTo;
        }
        return Promise.reject(error);
    }
);
// ─────────────────────────────────────────────────────────────────────────────
import CustomerRegister from "./pages/auth/CustomerRegister";
import AdminPage from "./pages/admin/AdminPage";
import AttendanceScanner from "./pages/admin/Attendance/AttendanceScanner";
import PasswordResetPage from "./pages/reception/PasswordResetPage";
import CustomerPasswordResetPage from "./pages/client/PasswordResetPage";
import { Toaster } from "react-hot-toast";
import BookingRoom from "./pages/client/booking/roombooking/roomBooking";
import ManagerPage from "./pages/manager/managerPage";
import ReceptionPage from "./pages/reception/receptionPage";
import TourViewPage from "./pages/client/booking/tourbooking/TourViewing";
import TourDetailsPage from "./pages/client/booking/tourbooking/TourDetailsPage";
import TourInquiryPage from "./pages/client/booking/tourbooking/TourInquiryPage";
import TourPaymentPage from "./pages/client/booking/tourbooking/TourPaymentPage";
import RoomPaymentPage from "./pages/client/booking/roombooking/RoomPayment";
import { GoogleOAuthProvider } from "@react-oauth/google";
import BookingSummary from "./pages/client/booking/roombooking/BookingSummary";
import BookingConfirmation from "./pages/client/booking/roombooking/BookingConfirmation";
import ContactPage from "./pages/Contact_us";
import CustomerDashboard from "./pages/client/dashboard/CustomerDashboard";
import VehicleCatalogPage from "./pages/client/vehicles/VehicleCatalogPage";
import VehicleDetailsPage from "./pages/client/vehicles/VehicleDetailsPage";
import VehicleBookingPage from "./pages/client/vehicles/VehicleBookingPage";
import CustomerDetailsPage from "./pages/client/booking/roombooking/CustomerDetailsPage";
import RoomTypeDetails from "./pages/client/RoomTypeDetails";
import FaqPage from "./pages/Faq";

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

export default function App() {
    return (
        <GoogleOAuthProvider clientId="495378641753-0pjhi48q54fugb1l0phuvjk447oi5mol.apps.googleusercontent.com">
            <BrowserRouter>
                <ScrollToTop />
                <Toaster position="top-right" reverseOrder={false} />
                <div className="w-full h-screen">
                    <Routes>
                        <Route path="/booking" element={<BookingRoom />} />
                        <Route path="/room-type/:id" element={<RoomTypeDetails />} />
                        <Route path="/booking-summary" element={<BookingSummary />} />
                        <Route path="/booking-details" element={<CustomerDetailsPage />} />
                        <Route path="/booking-confirm" element={<BookingConfirmation />} />
                        <Route path="/booking/tour" element={<TourViewPage />} />
                        <Route path="/booking/tour-details" element={<TourDetailsPage />} />
                        <Route path="/booking/tour-inquiry" element={<TourInquiryPage />} />
                        <Route path="/booking/tour-payment" element={<TourPaymentPage />} />
                        <Route path="/payment" element={<RoomPaymentPage />} />
                        <Route path="/receptionistLogin" element={<StaffLogin />} />
                        <Route path="/managerLogin" element={<StaffLogin />} />
                        <Route path="/adminLogin" element={<StaffLogin />} />
                        <Route path="/staffLogin" element={<StaffLogin />} />
                        <Route path="/registerCustomer" element={<CustomerRegister />} />
                        <Route path="/customerLogin" element={<CustomerLoginPage />} />
                        <Route path="/customer-reset-password" element={<CustomerPasswordResetPage />} />
                        <Route path="/reset-password" element={< PasswordResetPage />} />
                        <Route path="/attendance" element={<AttendanceScanner />} />
                        <Route path="/admin/*" element={< AdminPage />} />
                        <Route path="/manager/*" element={< ManagerPage />} />
                        <Route path="/reception/*" element={< ReceptionPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/faq" element={<FaqPage />} />
                        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                        <Route path="/vehicles" element={<VehicleCatalogPage />} />
                        <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
                        <Route path="/vehicles/:id/book" element={<VehicleBookingPage />} />
                        <Route path="/*" element={<HomePage />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}