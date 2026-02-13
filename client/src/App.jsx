import BookingRoom from "./pages/client/booking/room-booking";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
    return(
        <BrowserRouter>
            <div className="w-full h-screen">
                <Routes>
                    <Route path="/booking" element={<BookingRoom />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}