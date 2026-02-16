import { Link } from "react-router-dom";
import logo from "../assets/bluebird logo.png";
import { LuListCollapse, LuMenu } from "react-icons/lu"; 
import { useState } from "react";

export default function Header() {
  const [sideBarOpen, setSideBarOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm relative z-50">
      <div className="w-full px-4 lg:px-10 h-[90px] grid grid-cols-[1fr_auto_1fr] items-center">
        
        <div className="hidden lg:flex justify-start items-center gap-3 text-sm text-gray-600">
          <span>Negombo</span>
          <span>🌤 28°C</span>
        </div>

        <div className="flex lg:hidden justify-start">
          <button onClick={() => setSideBarOpen(true)}>
             <LuMenu className="text-3xl text-gray-700" />
          </button>
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

        <div className="flex lg:hidden justify-end items-center col-start-3">
           <img src={logo} alt="logo" className="h-12 object-contain" />
        </div>

        <div className="hidden lg:flex justify-end font-semibold">
          (+94) 70 1950 195
        </div>
      </div>

      {sideBarOpen && (
        <div className="fixed lg:hidden w-[100vw] h-screen top-0 left-0 bg-black/50 z-50 transition-all duration-300">
          <div className="bg-white w-[250px] h-full flex flex-col shadow-lg animate-in slide-in-from-left duration-300">
            <div className="w-full h-[100px] bg-accent flex justify-between items-center px-4 border-b">
               <img src={logo} alt="logo" className="h-14 object-contain" />
               <LuListCollapse 
                  onClick={() => setSideBarOpen(false)} 
                  className="text-gray-600 text-2xl cursor-pointer rotate-180 hover:text-red-500" 
               />
            </div>

            <div className="flex flex-col text-lg font-medium text-gray-700 gap-6 p-6">
              <Link className="hover:text-blue-600 transition" to="/" onClick={() => setSideBarOpen(false)}>
                Home
              </Link>
              <Link className="hover:text-blue-600 transition" to="/" onClick={() => setSideBarOpen(false)}>
                HOTELS
              </Link>
              <Link className="hover:text-blue-600 transition" to="/" onClick={() => setSideBarOpen(false)}>
                PAGES
              </Link>
              <Link className="hover:text-blue-600 transition" to="/" onClick={() => setSideBarOpen(false)}>
                TRAVELS
              </Link>
              <Link className="hover:text-blue-600 transition" to="/" onClick={() => setSideBarOpen(false)}>
                GALLERY
              </Link>
              <Link className="hover:text-blue-600 transition" to="/" onClick={() => setSideBarOpen(false)}>
                CONTACT
              </Link>
            </div>
            
          </div>
        </div>
      )}
    </header>
  );
}