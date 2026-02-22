import BookingRoom from "./pages/client/booking/roomBooking";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";
import BookingProcessing from "./pages/client/booking/bookingProcessing";
import LoginAdmin from "./pages/admin/loginAdmin";
import LoginReceptionist from "./pages/reception/loginReceptionist";
import UserRegister from "./pages/userRegister";
import RoomManagement from "./pages/admin/roomManagement";

export default function App() {
    return(
        <BrowserRouter>
            <div className="w-full h-screen">
                <Routes>
                    <Route path="/*" element={<HomePage/>} />
                    <Route path="/booking" element={<BookingRoom />} />
                    <Route path="/booking/process" element={<BookingProcessing />} />
                    <Route path="/loginAdmin" element={<LoginAdmin />} />
                    <Route path="/loginReceptionist" element={<LoginReceptionist />} />
                    <Route path="/userRegister" element={<UserRegister />} />
                    <Route path="/roomManage" element={< RoomManagement />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}