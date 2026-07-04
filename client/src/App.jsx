import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import HomePage from "./pages/homePage";
import StaffLogin from "./pages/auth/StaffLogin";
import CustomerLoginPage from "./pages/auth/CustomerLoginPage";
import axios from "axios";
import { getSubdomain, getSubdomainUrl } from "./utils/subdomain";

// ── Token Setup ───────────────────────────────────────────────────────────────
// On every page load, re-attach the stored token to all Axios requests so the
// user does not need to log in again after a browser refresh.
const token = localStorage.getItem("token");
if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// ── 401 Interceptor (role-aware & subdomain-aware) ───────────────────────────
// When any API call returns 401 (no token / expired token / invalid token),
// clear the stored token and redirect the user to the staff login portal on
// auth subdomain (or customer login on booking subdomain).
const ROLE_LOGIN_MAP = {
    admin: () => getSubdomainUrl("auth", "/staffLogin"),
    manager: () => getSubdomainUrl("auth", "/staffLogin"),
    receptionist: () => getSubdomainUrl("auth", "/staffLogin"),
    customer: () => "/customerLogin",
};

// Endpoints that can legitimately return 401 for wrong credentials.
// These are NOT session-expiry errors — the caller handles their own errors.
const AUTH_ENDPOINTS = [
    "/users/login",
    "/users/verify-email",
    "/users/registerStaffMember",
    "/customers/login",
    "/customers/google-login",
    "/customers/register",
    "/customers/reset-password",
    "/customers/send-otp",
    "/customers/refresh",
];

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // If this 401 came from a login/auth endpoint, let the
            // calling code handle it (it will show its own error toast).
            const requestUrl = error.config?.url || "";
            const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => requestUrl.includes(path));
            if (isAuthEndpoint) {
                return Promise.reject(error);
            }

            // For all other 401s (expired/invalid session token):
            // find out which login page to send the user to.
            let redirectTo = "/";
            try {
                const staffToken = localStorage.getItem("token");
                const customerToken = localStorage.getItem("customerToken") || sessionStorage.getItem("customerToken");
                if (staffToken) {
                    // Inline decode — avoids an extra import at module level
                    const payload = JSON.parse(atob(staffToken.split(".")[1]));
                    redirectTo = ROLE_LOGIN_MAP[payload?.role] || "/";
                } else if (customerToken) {
                    redirectTo = "/customerLogin";
                }
            } catch {
                const currentSubdomain = getSubdomain();
                if (["admin", "manager", "reception"].includes(currentSubdomain)) {
                    redirectTo = getSubdomainUrl("auth", "/staffLogin");
                } else {
                    redirectTo = "/";
                }
            }

            // Clean up ALL stale credentials (staff + customer)
            localStorage.removeItem("token");
            localStorage.removeItem("customerToken");
            sessionStorage.removeItem("customerToken");
            localStorage.removeItem("user");
            localStorage.removeItem("adminName");
            localStorage.removeItem("adminEmail");
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
import TourConfirmation from "./pages/client/booking/tourbooking/TourConfirmation";
import RoomPaymentPage from "./pages/client/booking/roombooking/RoomPayment";
import { GoogleOAuthProvider } from "@react-oauth/google";
import BookingSummary from "./pages/client/booking/roombooking/BookingSummary";
import BookingConfirmation from "./pages/client/booking/roombooking/BookingConfirmation";
import ContactPage from "./pages/Contact_us";
import CustomerDashboard from "./pages/client/dashboard/CustomerDashboard";
import VehicleCatalogPage from "./pages/client/vehicles/VehicleCatalogPage";
import VehicleDetailsPage from "./pages/client/vehicles/VehicleDetailsPage";
import VehicleBookingPage from "./pages/client/vehicles/VehicleBookingPage";
import VehicleBookingSummary from "./pages/client/vehicles/VehicleBookingSummary";
import VehiclePaymentPage from "./pages/client/vehicles/VehiclePaymentPage";
import CustomerDetailsPage from "./pages/client/booking/roombooking/CustomerDetailsPage";
import RoomTypeDetails from "./pages/client/RoomTypeDetails";
import FaqPage from "./pages/Faq";
import TestimonialsPage from './pages/reviewPage'

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

// Helper to redirect to other subdomains gracefully
function RedirectToSubdomain({ subdomain, path }) {
    useEffect(() => {
        window.location.href = getSubdomainUrl(subdomain, path);
    }, [subdomain, path]);
    return null;
}

// Staff access guard
function StaffGuard({ allowedRole, children }) {
    const storedToken = localStorage.getItem("token");
    let isAuthorized = false;

    try {
        if (storedToken) {
            const payload = JSON.parse(atob(storedToken.split(".")[1]));
            if (payload?.role === allowedRole) {
                isAuthorized = true;
            }
        }
    } catch {
        // invalid token
    }

    if (!isAuthorized) {
        return <RedirectToSubdomain subdomain="auth" path="/staffLogin" />;
    }

    return children;
}

export default function App() {
    const subdomain = getSubdomain();

    // Synchronously parse and commit SSO parameters before rendering any child guards
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get("token");
    if (ssoToken) {
        localStorage.setItem("token", ssoToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${ssoToken}`;

        const ssoUser = params.get("user");
        if (ssoUser) {
            localStorage.setItem("user", ssoUser);
        }

        const ssoAdminName = params.get("adminName");
        if (ssoAdminName) {
            localStorage.setItem("adminName", ssoAdminName);
        }

        const ssoAdminEmail = params.get("adminEmail");
        if (ssoAdminEmail) {
            localStorage.setItem("adminEmail", ssoAdminEmail);
        }

        // Clean query parameters from URL bar
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
    }

    const renderSubdomainRoutes = () => {
        switch (subdomain) {
            case "admin":
                return (
                    <Routes>
                        <Route path="/admin/*" element={
                            <StaffGuard allowedRole="admin">
                                <AdminPage />
                            </StaffGuard>
                        } />
                        <Route path="/attendance" element={
                            <StaffGuard allowedRole="admin">
                                <AttendanceScanner />
                            </StaffGuard>
                        } />
                        <Route path="/reset-password" element={<PasswordResetPage />} />
                        <Route path="/*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                );
            case "manager":
                return (
                    <Routes>
                        <Route path="/manager/*" element={
                            <StaffGuard allowedRole="manager">
                                <ManagerPage />
                            </StaffGuard>
                        } />
                        <Route path="/reset-password" element={<PasswordResetPage />} />
                        <Route path="/*" element={<Navigate to="/manager" replace />} />
                    </Routes>
                );
            case "reception":
                return (
                    <Routes>
                        <Route path="/reception/*" element={
                            <StaffGuard allowedRole="receptionist">
                                <ReceptionPage />
                            </StaffGuard>
                        } />
                        <Route path="/attendance" element={
                            <StaffGuard allowedRole="receptionist">
                                <AttendanceScanner />
                            </StaffGuard>
                        } />
                        <Route path="/reset-password" element={<PasswordResetPage />} />
                        <Route path="/*" element={<Navigate to="/reception" replace />} />
                    </Routes>
                );
            case "auth":
                return (
                    <Routes>
                        <Route path="/staffLogin" element={<StaffLogin />} />
                        <Route path="/reset-password" element={<PasswordResetPage />} />
                        <Route path="/*" element={<Navigate to="/staffLogin" replace />} />
                    </Routes>
                );
            default: // booking subdomain or main site
                return (
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
                        <Route path="/tour-confirm" element={<TourConfirmation />} />
                        <Route path="/payment" element={<RoomPaymentPage />} />
                        <Route path="/registerCustomer" element={<CustomerRegister />} />
                        <Route path="/customerLogin" element={<CustomerLoginPage />} />
                        <Route path="/customer-reset-password" element={<CustomerPasswordResetPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/faq" element={<FaqPage />} />
                        <Route path="/reviews" element={<TestimonialsPage />} />
                        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                        <Route path="/vehicles" element={<VehicleCatalogPage />} />
                        <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
                        <Route path="/vehicles/:id/book" element={<VehicleBookingPage />} />
                        <Route path="/vehicles/:id/summary" element={<VehicleBookingSummary />} />
                        <Route path="/vehicles/:id/payment" element={<VehiclePaymentPage />} />

                        {/* Redirections for staff routes from booking subdomain */}
                        <Route path="/admin/*" element={<RedirectToSubdomain subdomain="admin" path="/admin" />} />
                        <Route path="/manager/*" element={<RedirectToSubdomain subdomain="manager" path="/manager" />} />
                        <Route path="/reception/*" element={<RedirectToSubdomain subdomain="reception" path="/reception" />} />
                        <Route path="/staffLogin" element={<RedirectToSubdomain subdomain="auth" path="/staffLogin" />} />
                        <Route path="/receptionistLogin" element={<RedirectToSubdomain subdomain="auth" path="/staffLogin" />} />
                        <Route path="/managerLogin" element={<RedirectToSubdomain subdomain="auth" path="/staffLogin" />} />
                        <Route path="/adminLogin" element={<RedirectToSubdomain subdomain="auth" path="/staffLogin" />} />

                        <Route path="/*" element={<HomePage />} />
                    </Routes>
                );
        }
    };

    return (
        <GoogleOAuthProvider clientId="495378641753-0pjhi48q54fugb1l0phuvjk447oi5mol.apps.googleusercontent.com">
            <BrowserRouter>
                <ScrollToTop />
                <Toaster position="top-right" reverseOrder={false} />
                <div className="w-full h-screen">
                    {renderSubdomainRoutes()}
                </div>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}