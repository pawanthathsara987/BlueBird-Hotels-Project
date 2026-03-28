import BookingRoom from "./pages/client/booking/roomBooking";
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
import ManagerPage from "./pages/manager/managerPage";

export default function App() {
    return(
        <BrowserRouter>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="w-full h-screen">
                <Routes>
                    <Route path="/*" element={<HomePage/>} />
                    <Route path="/booking" element={<BookingRoom />} />
                    <Route path="/booking/process" element={<BookingProcessing />} />
                    <Route path="/loginAdmin" element={<LoginAdmin />} />
                    <Route path="/loginReceptionist" element={<LoginReceptionist />} />
                    <Route path="/userRegister" element={<UserRegister />} />
                    <Route path="/booking/tour" element={< BookingTour />} />           
                    <Route path="/reset-password" element={< PasswordResetPage />} />
                    <Route path="/admin/*" element={< AdminPage />} />
                    <Route path="/manager/*" element={< ManagerPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}