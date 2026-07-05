import PropTypes from "prop-types";
import { Search, Tag, Layers } from "lucide-react";

export default function ShopFilters({ 
  searchTerm, setSearchTerm, 
  categoryFilter, setCategoryFilter, 
  sortBy, setSortBy,
  categories = []
}) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 animate-fadeIn">
      <div className="flex items-center gap-3 flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-300">
        <Search size={18} className="text-slate-400 shrink-0" />
        <input
          type="search"
          placeholder="Search items by name or description..."
          className="outline-none w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap md:flex-nowrap w-full md:w-auto items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full md:w-48">
          <Tag size={14} className="text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="outline-none bg-transparent text-xs font-bold text-slate-600 pr-4 cursor-pointer w-full"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full md:w-48">
          <Layers size={14} className="text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="outline-none bg-transparent text-xs font-bold text-slate-600 pr-4 cursor-pointer w-full"
          >
            <option value="newest">Newest Added</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="qty-low">Qty: Low to High</option>
            <option value="qty-high">Qty: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}

ShopFilters.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  categoryFilter: PropTypes.string.isRequired,
  setCategoryFilter: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  setSortBy: PropTypes.func.isRequired,
  categories: PropTypes.array,
};
