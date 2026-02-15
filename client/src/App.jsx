import BookingRoom from "./pages/client/booking/roomBooking";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";
import BookingProcess from "./pages/client/booking/bookingProcessing";
import BookingProcessing from "./pages/client/booking/bookingProcessing";
import Process from "./pages/client/booking/procee";

export default function App() {
    return(
        <BrowserRouter>
            <div className="w-full h-screen">
                <Routes>
                    <Route path="/*" element={<HomePage/>} />
                    <Route path="/booking" element={<BookingRoom />} />
                    <Route path="/booking/process" element={<BookingProcessing />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}