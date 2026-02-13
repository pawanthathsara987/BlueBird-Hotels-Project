import { Link } from "react-router-dom";
import logo from "../assets/bluebird logo.png";
import { LuListCollapse } from "react-icons/lu";

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm">

      <div className="w-full lg:px-10 h-[90px] grid grid-cols-[1fr_auto_1fr] items-center">

        <div className="hidden lg:flex justify-start items-center gap-3 text-sm text-gray-600">
          <span>Negombo</span>
          <span>🌤 28°C</span>
        </div>

        <div className="w-screen lg:hidden flex items-center justify-end px-10 relative">
            <LuListCollapse className="absolute left-6 text-2xl flex cursor-pointer" />
            <img src={logo} alt="logo" className="h-20 object-contain" />
        </div>

        <div className="hidden lg:flex items-center justify-center gap-8 font-medium">

          <Link className="hover:text-blue-600">HOME</Link>
          <Link className="hover:text-blue-600">HOTELS</Link>
          <Link className="hover:text-blue-600">PAGES</Link>

          <img src={logo} alt="logo" className="h-20 object-contain" />

          <Link className="hover:text-blue-600">TRAVELS</Link>
          <Link className="hover:text-blue-600">GALLERY</Link>
          <Link className="hover:text-blue-600">CONTACT</Link>

        </div>

        <div className="hidden lg:flex justify-end font-semibold">
          (+94) 70 1950 195
        </div>

      </div>

    </header>
  );
}