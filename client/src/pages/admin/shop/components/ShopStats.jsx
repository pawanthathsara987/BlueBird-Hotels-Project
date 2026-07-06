import PropTypes from "prop-types";
import { ShoppingBag, AlertTriangle, DollarSign, Layers } from "lucide-react";

export default function ShopStats({ items }) {
  const totalItems = items.length;
  const outOfStockItems = items.filter((i) => i.availableQuantity === 0).length;
  const totalValue = items.reduce((sum, item) => sum + parseFloat(item.price) * item.availableQuantity, 0);
  const uniqueCategories = [...new Set(items.map((i) => i.category))];
  const totalCategoriesCount = uniqueCategories.length;
  
  const categoryCounts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  const summaryStr = Object.entries(categoryCounts)
    .slice(0, 3)
    .map(([cat, cnt]) => `${cat.substring(0, 3)}: ${cnt}`)
    .join(" | ") || "No items";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fadeIn">
      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Products</p>
          <h4 className="text-xl font-bold text-slate-700 mt-0.5">{totalItems}</h4>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
          outOfStockItems > 0 
            ? "bg-rose-50 border-rose-100 text-rose-500" 
            : "bg-emerald-50 border-emerald-100 text-emerald-500"
        }`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Out of Stock</p>
          <h4 className="text-xl font-bold text-slate-700 mt-0.5">{outOfStockItems}</h4>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inventory Value</p>
          <h4 className="text-xl font-bold text-slate-700 mt-0.5">LKR {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Categories</p>
          <h4 className="text-xl font-bold text-slate-700 mt-0.5">{totalCategoriesCount}</h4>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
            {summaryStr}
          </p>
        </div>
      </div>
    </div>
  );
}

ShopStats.propTypes = {
  items: PropTypes.array.isRequired,
};
