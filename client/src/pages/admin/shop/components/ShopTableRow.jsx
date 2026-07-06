import PropTypes from "prop-types";
import { Image as ImageIcon, Eye, Edit3, Trash2, AlertCircle } from "lucide-react";
import { formatPrice, getCategoryStyle } from "../utils/shopHelpers";

export default function ShopTableRow({ item, onView, onEdit, onDelete }) {
  const hasImages = item.images && item.images.length > 0;
  const mainImageUrl = hasImages ? item.images[0] : null;

  return (
    <tr className="hover:bg-slate-50/40 transition-colors duration-250">
      <td className="px-6 py-3.5">
        {mainImageUrl ? (
          <img
            src={mainImageUrl}
            alt={item.name}
            className="w-12 h-12 object-cover rounded-lg border border-slate-100 shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg flex items-center justify-center">
            <ImageIcon size={18} />
          </div>
        )}
      </td>
      <td className="px-6 py-3.5">
        <div className="font-bold text-slate-800 text-sm truncate max-w-xs" title={item.name}>
          {item.name}
        </div>
        <div className="text-xs text-slate-400 line-clamp-1 max-w-xs mt-0.5">
          {item.description || "No description"}
        </div>
      </td>
      <td className="px-6 py-3.5">
        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border tracking-wide uppercase ${getCategoryStyle(item.category)}`}>
          {item.category}
        </span>
      </td>
      <td className="px-6 py-3.5 text-sm font-extrabold text-blue-600">
        LKR {formatPrice(item.price)}
      </td>
      <td className="px-6 py-3.5">
        {item.availableQuantity === 0 ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full">
            <AlertCircle size={12} />
            Out of stock
          </span>
        ) : item.availableQuantity <= 5 ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full">
            Only {item.availableQuantity} left
          </span>
        ) : (
          <span className="text-sm font-semibold text-slate-700">
            {item.availableQuantity} units
          </span>
        )}
      </td>
      <td className="px-6 py-3.5 text-right">
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={() => onView(item)}
            className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all duration-200 cursor-pointer"
            title="View item details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 cursor-pointer"
            title="Edit details"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-55 rounded-xl transition-all duration-200 cursor-pointer"
            title="Delete item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

ShopTableRow.propTypes = {
  item: PropTypes.object.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
