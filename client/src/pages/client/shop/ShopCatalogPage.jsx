import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search, Sparkles, ShoppingBag, ArrowRight, Tag, AlertCircle } from "lucide-react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { getCategoryStyle } from "../../admin/shop/utils/shopHelpers";

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

const cardShell = "rounded-[28px] border border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.06)] backdrop-blur-md hover:shadow-[0_40px_90px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300";

export default function ShopCatalogPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter/Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemsRes, categoriesRes] = await Promise.all([
          axios.get(`${backendBaseUrl}/admin/shop-items`),
          axios.get(`${backendBaseUrl}/admin/shop-categories`),
        ]);
        setItems(Array.isArray(itemsRes.data?.data) ? itemsRes.data.data : []);
        setCategories(Array.isArray(categoriesRes.data?.data) ? categoriesRes.data.data : []);
        setError("");
      } catch (err) {
        console.error("Error loading shop catalog:", err);
        setError("Unable to load the shop catalog. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort items dynamically
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
      );
    }

    // Sort logic
    if (sortBy === "price-low") {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else {
      // featured / newest
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [items, selectedCategory, searchQuery, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("featured");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Banner Section */}
        <section className="relative overflow-hidden border-b border-slate-200/50 bg-white">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.08),rgba(147,51,234,0.04),transparent)]" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-purple-300/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="space-y-6 max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/50 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  BlueBird Boutique
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Exclusive Souvenirs &amp; Essentials
                </h1>
                <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
                  Browse our curated selection of fine hotel apparel, travel essentials, and custom local handicrafts. Reserve items to pick up at the front desk.
                </p>
              </div>

              {/* Quick stats board */}
              <div className="flex gap-4 self-start md:self-auto">
                <div className={`${cardShell} p-5 min-w-[140px] text-center`}>
                  <div className="flex justify-center text-blue-600 mb-1.5">
                    <ShoppingBag size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Products</span>
                  <span className="text-2xl font-black text-slate-800 mt-1 block">
                    {items.length.toString().padStart(2, "0")}
                  </span>
                </div>
                <div className={`${cardShell} p-5 min-w-[140px] text-center`}>
                  <div className="flex justify-center text-purple-600 mb-1.5">
                    <Tag size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Categories</span>
                  <span className="text-2xl font-black text-slate-800 mt-1 block">
                    {categories.length.toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter and Content Section */}
        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          
          {/* Controls: Search, Dynamic Tabs, Sort */}
          <div className="space-y-6 mb-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Modern Search */}
              <div className="flex items-center gap-3 w-full md:max-w-md bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition duration-300">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="outline-none w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 font-medium"
                />
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm w-full md:w-56 justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="outline-none bg-transparent text-xs font-bold text-slate-700 pr-1 cursor-pointer"
                >
                  <option value="featured">Newest Added</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

            </div>

            {/* Dynamic Category Tabs */}
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    selectedCategory === "All"
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.categoryId}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                      selectedCategory === cat.name
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                        : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Loader or Error / Items Display */}
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm font-semibold">Loading catalog items...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center max-w-md mx-auto">
              <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Error Loading Shop</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{error}</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-24 text-center max-w-sm mx-auto border border-dashed border-slate-200 rounded-3xl bg-white p-8">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
                <ShoppingBag size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">
                We couldn't find any products matching your search query or filters.
              </p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-blue-500/10"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredItems.map((item) => {
                // Parse images
                let imageUrls = [];
                if (item.imageUrl) {
                  try {
                    imageUrls = JSON.parse(item.imageUrl);
                  } catch {
                    imageUrls = [item.imageUrl];
                  }
                }
                const mainImage = imageUrls.length > 0 ? imageUrls[0] : null;
                const isOutOfStock = item.availableQuantity === 0;

                return (
                  <Link
                    key={item.itemId}
                    to={`/shop/${item.itemId}`}
                    className={`${cardShell} overflow-hidden group flex flex-col h-full`}
                  >
                    {/* Image Area */}
                    <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={item.name}
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
                          <ShoppingBag size={48} className="stroke-[1]" />
                        </div>
                      )}

                      {/* Category Badge overlay */}
                      <span className={`absolute top-4 left-4 px-2.5 py-0.5 text-[9px] font-extrabold rounded-full border tracking-wider uppercase shadow-sm ${getCategoryStyle(item.category)}`}>
                        {item.category}
                      </span>

                      {/* Stock overlay if out of stock */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="px-4 py-2 rounded-xl bg-white border border-slate-100 text-xs font-extrabold uppercase tracking-widest text-rose-600 shadow-md">
                            Out of stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex-1 space-y-2">
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition duration-300" title={item.name}>
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description || "No product description provided."}
                        </p>
                      </div>

                      {/* Price & Action Section */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Price</span>
                          <span className="text-sm font-extrabold text-blue-600">
                            LKR {parseFloat(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-600 text-slate-500 group-hover:text-white flex items-center justify-center transition-all duration-300">
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </section>
        

      </main>

      <Footer />
    </div>
  );
}
