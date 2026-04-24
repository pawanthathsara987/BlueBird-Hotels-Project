import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";
import BookingProcessing from "./pages/client/booking/bookingProcessing";
import LoginAdmin from "./pages/admin/loginAdmin";
import LoginReceptionist from "./pages/reception/loginReceptionist";
import UserRegister from "./pages/userRegister";
import BookingTour from "./pages/client/booking/tourBooking";
import AdminPage from "./pages/admin/AdminPage";
import PasswordResetPage from "./pages/reception/PasswordResetPage";
import { Toaster } from "react-hot-toast";
import BookingRoom from "./pages/client/booking/roomBooking";
import ManagerPage from "./pages/manager/managerPage";
import ReceptionPage from "./pages/reception/receptionPage";
import TourViewPage from "./pages/client/booking/TourViewing";
import TourDetailsPage from "./pages/client/booking/TourDetailsPage";
import TourPaymentPage from "./pages/client/booking/TourPaymentPage";
import TourCancelPage from "./pages/client/booking/TourCancelPage";



export default function App() {
    return(
        <BrowserRouter>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="w-full h-screen">
                <Routes>
                    <Route path="/booking" element={<BookingRoom />} />
                    <Route path="/booking/process" element={<BookingProcessing />} />
                    <Route path="/booking/tour" element={<BookingTour />} />
                    <Route path="/booking/tour-details" element={<TourDetailsPage />} />
                    <Route path="/booking/payment" element={<TourPaymentPage />} />
                    <Route path="/booking/cancel" element={<TourCancelPage />} />
                    <Route path="/tourBooking" element={<TourViewPage />} />
                    <Route path="/loginAdmin" element={<LoginAdmin />} />
                    <Route path="/loginReceptionist" element={<LoginReceptionist />} />
                    <Route path="/userRegister" element={<UserRegister />} />
                    <Route path="/booking/tour" element={< BookingTour />} />           
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