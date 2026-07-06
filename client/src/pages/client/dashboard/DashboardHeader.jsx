import { Link } from "react-router-dom";
import logo from "../../../assets/bluebird logo.png";
import { Menu } from "lucide-react";

export default function DashboardHeader({
  setIsMobileSidebarOpen
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 py-4 w-full">
      {/* Left side: Mobile menu toggle and Logo aligned perfectly to the left */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2.5 bg-slate-900/5 hover:bg-slate-900/10 active:scale-95 rounded-xl text-slate-700 md:hidden transition-all border border-slate-200/60"
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center space-x-2.5 focus:outline-none hover:opacity-90 transition-opacity">
          <img
            src={logo}
            alt="Bluebird Hotels Logo"
            className="h-10 md:h-12 object-contain"
          />
        </Link>
      </div>

      {/* Right side: Empty flex container to maintain layout balance and page alignment */}
      <div className="flex items-center">
        {/* Intentionally left blank for clean aesthetic layout symmetry */}
      </div>
    </header>
  );
}
