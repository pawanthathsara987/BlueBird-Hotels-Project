import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";
import ReceptionistLogin from "./pages/admin/ReceptionistLogin";
import CustomerRegister from "./pages/CustomerRegister";
import AdminPage from "./pages/admin/AdminPage";
import PasswordResetPage from "./pages/reception/PasswordResetPage";
import CustomerPasswordResetPage from "./pages/customer/PasswordResetPage";
import { Toaster } from "react-hot-toast";
import BookingRoom from "./pages/client/booking/roomBooking";
import ManagerPage from "./pages/manager/managerPage";
import ReceptionPage from "./pages/reception/receptionPage";
import TourViewPage from "./pages/client/booking/TourViewing";
import TourDetailsPage from "./pages/client/booking/TourDetailsPage";
import TourInquiryPage from "./pages/client/booking/TourInquiryPage";
import TourPaymentPage from "./pages/client/booking/TourPaymentPage";
import RoomPaymentPage from "./pages/client/booking/RoomPayment";
import TourCancelPage from "./pages/client/booking/TourCancelPage";
import CustomerLoginPage from "./pages/CustomerLoginPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import BookingSummary from "./pages/client/booking/BookingSummary";
import BookingConfirmation from "./pages/client/booking/BookingConfirmation";



export default function App() {
    return(
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
                    <Route path="/booking/payment" element={<TourPaymentPage />} />
                    <Route path="/booking/tour-payment" element={<TourPaymentPage />} />
                    <Route path="/booking/cancel" element={<TourCancelPage />} />
                    <Route path="/payment" element={<RoomPaymentPage />} />
                    <Route path="/tourBooking" element={<TourViewPage />} />
                    <Route path="/receptionistLogin" element={<ReceptionistLogin />} />
                    <Route path="/registerCustomer" element={<CustomerRegister />} />
                    <Route path="/customerLogin" element={<CustomerLoginPage />} />
                    <Route path="/customer-reset-password" element={<CustomerPasswordResetPage />} />
                    <Route path="/reset-password" element={< PasswordResetPage />} />
                    <Route path="/admin/*" element={< AdminPage />} />
                    <Route path="/manager/*" element={< ManagerPage />} />
                    <Route path="/reception/*" element={< ReceptionPage />} />
                    <Route path="/*" element={<HomePage />} />
                </Routes> 
            </div>
        </BrowserRouter>
    );
}