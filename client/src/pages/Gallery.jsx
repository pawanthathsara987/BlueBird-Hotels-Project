import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  RefreshCw, 
  Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";
import heroImage from "../assets/slider Images/front-2048x1014.jpg";

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/gallery`);
      if (response.data?.success) {
        const processed = response.data.images.map(img => ({
          ...img,
          title: formatPublicId(img.public_id)
        }));
        setImages(processed);
      } else {
        throw new Error("Failed to load gallery images.");
      }
    } catch (err) {
      console.error("Gallery Fetch Error:", err);
      setError(err.message || "An error occurred while fetching the gallery.");
      toast.error("Failed to load hotel gallery. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format public id into clean title (e.g. IMG_9473_uszlg7 -> Photo 9473 or Bluebird Gallery)
  const formatPublicId = (publicId) => {
    if (!publicId) return "BlueBird Gallery";
    // Strip folder name if any
    const cleanId = publicId.split("/").pop();
    // Replace underscores/dashes with spaces and capitalize
    return cleanId
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase())
      // Strip random Cloudinary suffixes (usually 6 chars at the end)
      .replace(/\s[a-z0-9]{6}$/i, "")
      .trim();
  };

  // Lightbox handlers
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setIsZoomed(false);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setIsZoomed(false);
    document.body.style.overflow = "unset";
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    if (images.length === 0) return;
    setLightboxIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    if (images.length === 0) return;
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  // Keyboard navigation inside lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, images]);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900 font-serif">
      {/* ── HERO BANNER ── */}
      <div className="relative h-[320px] md:h-[400px] overflow-hidden flex items-center justify-center">
        {/* Background Parallax-like Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Luxury Hotel Exterior"
            className="w-full h-full object-cover scale-105 filter brightness-45 contrast-95 animate-pulse-subtle"
            style={{ animationDuration: '8s' }}
          />
          {/* Elegant Light Green-Gold Gradient Overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-emerald-950/65 via-amber-800/40 to-[#faf8f5]"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-3xl animate-fade-in mt-12">
          <span className="text-amber-400 tracking-[0.4em] text-xs md:text-sm font-semibold uppercase block mb-3 drop-shadow-md">
            A Visual Masterpiece
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4 drop-shadow-lg font-serif">
            Our Gallery
          </h1>
          <div className="w-24 h-0.5 bg-amber-400 mx-auto mb-6 rounded-full" />
          <p className="text-stone-200 text-sm md:text-base leading-relaxed font-sans max-w-xl mx-auto drop-shadow-sm font-light">
            Immerse yourself in the exceptional beauty of BlueBird Hotels. Explore our pristine suites, fine dining culinary delights, and unforgettable travel excursions in Sri Lanka.
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow relative z-10 -mt-10">
        


        {/* LOADING STATE (SKELETON GRIDS) */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 p-3 h-80 flex flex-col justify-between animate-pulse"
              >
                <div className="w-full h-56 bg-stone-200 rounded-2xl" />
                <div className="h-4 bg-stone-200 rounded w-2/3 mt-3 mx-2" />
                <div className="h-3 bg-stone-100 rounded w-1/3 mb-1 mx-2" />
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-stone-100 max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
              <RefreshCw className="w-8 h-8 animate-spin-once" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">Could Not Fetch Gallery</h3>
            <p className="text-stone-500 font-sans text-sm mb-6 leading-relaxed">
              We encountered a network or credentials issue retrieving photos from Cloudinary.
            </p>
            <button
              onClick={fetchImages}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-semibold px-6 py-3 rounded-2xl text-sm shadow-md transition-all cursor-pointer font-sans"
            >
              <RefreshCw className="w-4 h-4" /> Retry Connection
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && images.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-stone-100 max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">No Images Found</h3>
            <p className="text-stone-500 font-sans text-sm leading-relaxed">
              No assets were found in the Cloudinary folder. Please check the backend configuration.
            </p>
          </div>
        )}

        {/* PHOTO GRID LAYOUT */}
        {!loading && !error && images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
            {images.map((img, idx) => (
              <div
                key={img.public_id}
                onClick={() => openLightbox(idx)}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-stone-200/50 border border-stone-100 p-3 transition-all duration-500 cursor-pointer"
              >
                {/* Image Wrap */}
                <div className="relative h-60 sm:h-56 md:h-64 rounded-2xl overflow-hidden bg-stone-100">
                  <img
                    src={img.secure_url}
                    alt={img.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* Backdrop Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── FULL SCREEN LIGHTBOX MODAL ── */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div 
          className="fixed inset-0 bg-stone-950/95 backdrop-blur-md z-[1000] flex flex-col justify-between animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Top Bar inside Lightbox */}
          <div className="p-4 flex items-center justify-between text-white bg-gradient-to-b from-black/80 to-transparent">
            <div>
              <h4 className="font-semibold text-base font-sans truncate max-w-xs md:max-w-md">
                {images[lightboxIndex].title}
              </h4>
              <p className="text-[10px] text-stone-400 font-sans tracking-wide mt-0.5 uppercase">
                {images[lightboxIndex].format.toUpperCase()} · {images[lightboxIndex].width} x {images[lightboxIndex].height}
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(!isZoomed);
                }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer text-white hidden sm:flex"
                title="Toggle Zoom"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-rose-600 transition-colors flex items-center justify-center cursor-pointer text-white"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Image Display */}
          <div className="relative flex-grow flex items-center justify-center p-4">
            {/* Left Nav Button */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 hover:text-amber-400 text-white/80 transition-all flex items-center justify-center z-50 cursor-pointer hidden md:flex"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Main Picture inside Lightbox */}
            <div className="relative max-w-full max-h-[75vh] select-none overflow-auto">
              <img
                src={images[lightboxIndex].secure_url}
                alt={images[lightboxIndex].title}
                className={`max-w-full max-h-[75vh] object-contain rounded transition-all duration-300 ${
                  isZoomed ? "scale-125 cursor-zoom-out" : "cursor-zoom-in"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(!isZoomed);
                }}
              />
            </div>

            {/* Right Nav Button */}
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 hover:text-amber-400 text-white/80 transition-all flex items-center justify-center z-50 cursor-pointer hidden md:flex"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          {/* Bottom Bar: Thumbnails / Index details */}
          <div className="p-4 text-center bg-gradient-to-t from-black/85 to-transparent text-stone-300 font-sans text-xs">
            <div className="flex justify-between items-center max-w-md mx-auto">
              <span className="text-[11px] uppercase tracking-widest text-stone-400">
                BlueBird Gallery
              </span>
              <span className="font-semibold text-white">
                {lightboxIndex + 1} of {images.length}
              </span>
            </div>
            
            {/* Swipe hints on mobile */}
            <p className="text-[10px] text-stone-500 mt-2 block md:hidden">
              Swipe or tap arrows to navigate. Tap close in top right.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
