import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ShoppingBag, X, Image as ImageIcon, Package } from "lucide-react";
import { formatPrice, formatDate, getCategoryStyle } from "../utils/shopHelpers";

export default function ViewItemDetailsModal({ isOpen, onClose, item }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reset active image when the item changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [item]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-500" />
            <span>Shop Item Details</span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-slate-700">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-video bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[activeImageIndex]}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-slate-400 flex flex-col items-center gap-2">
                  <ImageIcon className="w-12 h-12 opacity-45" />
                  <span className="text-xs uppercase font-bold tracking-wider opacity-60">No Image Uploaded</span>
                </div>
              )}

              {/* Main Image Badge */}
              {item.images && item.images.length > 0 && activeImageIndex === 0 && (
                <span className="absolute top-3 left-3 text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-600 text-white rounded shadow">
                  Main Image
                </span>
              )}
            </div>

            {/* Thumbnails Row */}
            {item.images && item.images.length > 1 && (
              <div className="flex items-center gap-2.5 mt-3.5 overflow-x-auto pb-1 scrollbar-hide">
                {item.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      idx === activeImageIndex 
                        ? "border-blue-500 scale-[1.03] shadow-md shadow-blue-500/10" 
                        : "border-slate-200 hover:border-slate-300 hover:scale-[1.02]"
                    }`}
                  >
                    <img src={imgUrl} alt="thumbnail" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <div className="absolute top-0.5 left-0.5 bg-blue-600 text-[6px] text-white font-extrabold px-1 rounded">
                        M
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text Fields */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 leading-tight">
                  {item.name}
                </h3>
                <span className={`inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold rounded-full border tracking-wide uppercase ${getCategoryStyle(item.category)}`}>
                  {item.category}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Price</span>
                <p className="text-2xl font-black text-blue-600">
                  LKR {formatPrice(item.price)}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Description
              </span>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {item.description || "No description provided for this item."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-100 rounded-xl p-3 flex flex-col justify-between bg-white shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Stock Quantity</span>
                <div className="mt-2.5 flex items-center gap-2">
                  <Package size={16} className="text-slate-400" />
                  <span className={`text-base font-bold ${
                    item.availableQuantity === 0 ? "text-rose-600" : "text-slate-800"
                  }`}>
                    {item.availableQuantity === 0 ? "Out of stock" : `${item.availableQuantity} units available`}
                  </span>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl p-3 flex flex-col justify-between bg-white shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Registered Date</span>
                <div className="mt-2.5 text-slate-700 text-sm font-semibold">
                  {formatDate(item.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold rounded-xl text-sm transition cursor-pointer"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
}

ViewItemDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.object,
};
