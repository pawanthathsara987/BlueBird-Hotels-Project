import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ShoppingBag, ShoppingCart, Sparkles, Tag, Check, AlertTriangle, ArrowLeft } from "lucide-react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { getCategoryStyle } from "../../admin/shop/utils/shopHelpers";

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

const cardShell = "rounded-[28px] border border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.06)] backdrop-blur-md";

export default function ShopItemDetailsPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendBaseUrl}/admin/shop-items/${id}`);
        if (response.data.success && response.data.data) {
          setItem(response.data.data);
          setError("");
        } else {
          setError("Failed to fetch product details.");
        }
      } catch (err) {
        console.error("Error loading product details:", err);
        setError("Unable to find the requested product. It may have been removed.");
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  // Parse images
  const images = item?.images || [];
  const hasImages = images.length > 0;
  const activeImageUrl = hasImages ? images[activeImageIndex] : null;
  const isOutOfStock = item?.availableQuantity === 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 uppercase tracking-wider transition-colors duration-300"
          >
            <ArrowLeft size={14} />
            <span>Back to Boutique Catalog</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-32 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-semibold">Loading product details...</p>
          </div>
        ) : error ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Product Not Found</h3>
            <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">{error}</p>
            <Link
              to="/shop"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-blue-500/10"
            >
              Back to Boutique
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:items-start">
            
            {/* Left Column: Image Viewer Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <div className={`${cardShell} overflow-hidden aspect-square w-full relative bg-white border border-slate-100`}>
                
                {/* Large Main Image display */}
                {activeImageUrl ? (
                  <img
                    src={activeImageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
                    <ShoppingBag size={80} className="stroke-[1]" />
                  </div>
                )}

                {/* Stock Tag Overlay */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="px-6 py-3 rounded-2xl bg-white border border-slate-100 text-xs font-extrabold uppercase tracking-widest text-rose-600 shadow-md">
                      Currently out of stock
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 bg-white shrink-0 transition-all duration-200 cursor-pointer ${
                        activeImageIndex === idx
                          ? "border-blue-600 shadow-md scale-95"
                          : "border-slate-200 hover:border-slate-350"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`thumbnail-${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Information Panel */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Product Info Block */}
              <div className={`${cardShell} p-6 space-y-4`}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full border tracking-wider uppercase shadow-sm ${getCategoryStyle(item.category)}`}>
                    {item.category}
                  </span>
                  
                  {/* Stock tag info */}
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      In Stock
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 leading-tight">
                    {item.name}
                  </h1>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Boutique Item ID: #{item.itemId}</span>
                </div>

                <div className="py-2 border-y border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Price</span>
                  <span className="text-2xl font-black text-blue-600">
                    LKR {parseFloat(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Description info */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Description</span>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.description || "No specific details provided for this product."}
                  </p>
                </div>
              </div>

              {/* Lobby Desk purchase assistance card */}
              <div className="bg-slate-900 text-white rounded-[28px] p-6 space-y-4 shadow-xl shadow-slate-900/10 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-blue-400 animate-pulse" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">Hotel Guest Exclusive</span>
                </div>
                
                <h3 className="text-base font-bold text-white leading-snug">How to Purchase &amp; Collect Items</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  To secure this item, you may visit our Boutique and Gift Shop located in the main lobby. Purchases can be charged to your room bill or settled directly.
                </p>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">Room delivery service available.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">Secure billing options linked to guest card.</span>
                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href="tel:104"
                    className="flex w-full items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md shadow-blue-600/10 hover:scale-[1.01]"
                  >
                    <ShoppingCart size={15} />
                    <span>Dial extension 104</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
