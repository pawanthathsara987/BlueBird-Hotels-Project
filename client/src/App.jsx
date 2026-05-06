import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";
import BookingProcessing from "./pages/client/booking/bookingProcessing";
import LoginAdmin from "./pages/admin/loginAdmin";
import LoginReceptionist from "./pages/reception/loginReceptionist";
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
import RoomPaymentPage from "./pages/client/booking/RoomPaymentPage";
import FloatingChatbot from "./components/FloatingChatbot";
import TourCancelPage from "./pages/client/booking/TourCancelPage";
import CustomerLoginPage from "./pages/CustomerLoginPage";



export default function App() {
    return(
        <BrowserRouter>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="w-full h-screen">
                <Routes>
                    <Route path="/booking" element={<BookingRoom />} />
                    <Route path="/booking/process" element={<BookingProcessing />} />
                    <Route path="/booking/tour" element={<TourViewPage />} />
                    <Route path="/booking/tour-details" element={<TourDetailsPage />} />
                    <Route path="/booking/tour-inquiry" element={<TourInquiryPage />} />
                    <Route path="/booking/payment" element={<TourPaymentPage />} />
                    <Route path="/booking/tour-payment" element={<TourPaymentPage />} />
                    <Route path="/booking/cancel" element={<TourCancelPage />} />
                    <Route path="/payment" element={<RoomPaymentPage />} />
                    <Route path="/tourBooking" element={<TourViewPage />} />
                    <Route path="/loginAdmin" element={<LoginAdmin />} />
                    <Route path="/loginReceptionist" element={<LoginReceptionist />} />
                    <Route path="/registerCustomer" element={<CustomerRegister />} />
                    <Route path="/customerLogin" element={<CustomerLoginPage />} />
                    <Route path="/customer-reset-password" element={<CustomerPasswordResetPage />} />
                    <Route path="/reset-password" element={< PasswordResetPage />} />
                    <Route path="/admin/*" element={< AdminPage />} />
                    <Route path="/manager/*" element={< ManagerPage />} />
                    <Route path="/reception/*" element={< ReceptionPage />} />
                    <Route path="/*" element={<HomePage />} />
                </Routes>
                <FloatingChatbot />
            </div>
        </BrowserRouter>
    );
}