import { Link } from "react-router-dom";
import logo from "../assets/bluebird logo.png";

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm">

      <div className="max-w-7xl mx-auto h-[90px] grid grid-cols-3 items-center px-6">

        {/* LEFT */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>Negombo</span>
          <span>🌤 28°C</span>
        </div>

        {/* CENTER */}
        <div className="flex items-center justify-center gap-10 font-medium">

          <Link className="hover:text-blue-600">HOME</Link>
          <Link className="hover:text-blue-600">HOTELS</Link>
          <Link className="hover:text-blue-600">PAGES</Link>

          <img src={logo} alt="logo" className="h-20 object-contain" />

          <Link className="hover:text-blue-600">TRAVELS</Link>
          <Link className="hover:text-blue-600">GALLERY</Link>
          <Link className="hover:text-blue-600">CONTACT</Link>

        </div>

        {/* RIGHT */}
        <div className="flex justify-end font-semibold">
          (+94) 70 1950 195
        </div>

      </div>

    </header>
  );
}