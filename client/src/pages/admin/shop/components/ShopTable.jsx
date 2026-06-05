import PropTypes from "prop-types";
import { Package } from "lucide-react";
import ShopTableRow from "./ShopTableRow";

export default function ShopTable({ items, onView, onEdit, onDelete }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
        <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-semibold text-base mb-2">
          No items match your search criteria.
        </p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Try adjusting your filters or search keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm bg-white animate-fadeIn">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Image</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Item Name</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Price (LKR)</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Stock</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <ShopTableRow
              key={item.itemId}
              item={item}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

ShopTable.propTypes = {
  items: PropTypes.array.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
