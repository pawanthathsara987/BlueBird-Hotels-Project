import PropTypes from "prop-types";
import { ShoppingBag, Plus, Tag } from "lucide-react";

export default function ShopHeader({ onAddClick, onManageCategoriesClick }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 animate-fadeIn">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
          <ShoppingBag size={20} className="animate-pulse" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-700">Shop Inventory</h3>
          <p className="text-xs text-slate-400">
            Manage items, prices, available quantities, and item image galleries.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
        <button
          onClick={onManageCategoriesClick}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm hover:scale-[1.02] cursor-pointer w-full sm:w-auto"
        >
          <Tag size={18} />
          <span>Manage Categories</span>
        </button>
        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-md shadow-blue-500/10 hover:scale-[1.02] cursor-pointer w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Add Shop Item</span>
        </button>
      </div>
    </div>
  );
}

ShopHeader.propTypes = {
  onAddClick: PropTypes.func.isRequired,
  onManageCategoriesClick: PropTypes.func.isRequired,
};
