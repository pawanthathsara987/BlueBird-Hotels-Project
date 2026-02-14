import BookingRoom from "./pages/client/booking/roomBooking";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";

export default function App() {
    return(
        <BrowserRouter>
            <div className="w-full h-screen">
                <Routes>
                    <Route path="/*" element={<HomePage/>} />
                    <Route path="/booking" element={<BookingRoom />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}