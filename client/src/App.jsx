import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/homePage";
import ReceptionistLogin from "./pages/admin/ReceptionistLogin";
import ManagerLogin from "./pages/admin/ManagerLogin";
import AdminLogin from "./pages/admin/AdminLogin";
import CustomerLoginPage from "./pages/auth/CustomerLoginPage";
import axios from "axios";

// Automatically attach stored token to requests on app startup
const token = localStorage.getItem("token");
if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
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
import VehicleBookingSummary from "./pages/client/vehicles/VehicleBookingSummary";
import VehiclePaymentPage from "./pages/client/vehicles/VehiclePaymentPage";
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
                        <Route path="/receptionistLogin" element={<ReceptionistLogin />} />
                        <Route path="/managerLogin" element={<ManagerLogin />} />
                        <Route path="/adminLogin" element={<AdminLogin />} />
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
                        <Route path="/vehicles/:id/summary" element={<VehicleBookingSummary />} />
                        <Route path="/vehicles/:id/payment" element={<VehiclePaymentPage />} />
                        <Route path="/*" element={<HomePage />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}