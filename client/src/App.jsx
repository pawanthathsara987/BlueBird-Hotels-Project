import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";
import ReceptionistLogin from "./pages/admin/ReceptionistLogin";
import CustomerRegister from "./pages/CustomerRegister";
import AdminPage from "./pages/admin/AdminPage";
import PasswordResetPage from "./pages/reception/PasswordResetPage";
import CustomerPasswordResetPage from "./pages/client/PasswordResetPage";
import { Toaster } from "react-hot-toast";
import BookingRoom from "./pages/client/booking/roombooking/roomBooking";
import ManagerPage from "./pages/manager/managerPage";
import ReceptionPage from "./pages/reception/receptionPage";
import TourViewPage from "./pages/client/booking/tourbooking/TourViewing";
import TourDetailsPage from "./pages/client/booking/tourbooking/TourDetailsPage";
import TourInquiryPage from "./pages/client/booking/tourbooking/TourInquiryPage";
import RoomPaymentPage from "./pages/client/booking/roombooking/RoomPayment";
import CustomerLoginPage from "./pages/CustomerLoginPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import BookingSummary from "./pages/client/booking/roombooking/BookingSummary";
import BookingConfirmation from "./pages/client/booking/roombooking/BookingConfirmation";
import ContactPage from "./pages/Contact_us";
import CustomerDashboard from "./pages/client/dashboard/CustomerDashboard";

export default function App() {
    return (
        <GoogleOAuthProvider clientId="495378641753-0pjhi48q54fugb1l0phuvjk447oi5mol.apps.googleusercontent.com">
            <BrowserRouter>
                <Toaster position="top-right" reverseOrder={false} />
                <div className="w-full h-screen">
                    <Routes>
                        <Route path="/booking" element={<BookingRoom />} />
                        <Route path="/booking-summary" element={<BookingSummary />} />
                        <Route path="/booking-confirm" element={<BookingConfirmation />} />
                        <Route path="/booking/tour" element={<TourViewPage />} />
                        <Route path="/booking/tour-details" element={<TourDetailsPage />} />
                        <Route path="/booking/tour-inquiry" element={<TourInquiryPage />} />
                        <Route path="/payment" element={<RoomPaymentPage />} />
                        <Route path="/receptionistLogin" element={<ReceptionistLogin />} />
                        <Route path="/registerCustomer" element={<CustomerRegister />} />
                        <Route path="/customerLogin" element={<CustomerLoginPage />} />
                        <Route path="/customer-reset-password" element={<CustomerPasswordResetPage />} />
                        <Route path="/reset-password" element={< PasswordResetPage />} />
                        <Route path="/admin/*" element={< AdminPage />} />
                        <Route path="/manager/*" element={< ManagerPage />} />
                        <Route path="/reception/*" element={< ReceptionPage />} />
                        <Route path="/*" element={<HomePage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}