import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import { ShoppingBag, X, Upload, ArrowLeft, ArrowRight } from "lucide-react";

export default function AddEditItemModal({ isOpen, onClose, editingItem, onSubmit, isSubmitting }) {
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Clothes",
    price: "",
    availableQuantity: "",
  });

  // Image states for form
  const [itemImages, setItemImages] = useState([]);

  const fileInputRef = useRef(null);

  // Sync state when editingItem changes
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        description: editingItem.description || "",
        category: editingItem.category,
        price: editingItem.price,
        availableQuantity: editingItem.availableQuantity,
      });
      // Load existing images
      const existingImages = (editingItem.images || []).map((url) => ({
        type: "existing",
        url,
      }));
      setItemImages(existingImages);
    } else {
      setFormData({
        name: "",
        description: "",
        category: "Clothes",
        price: "",
        availableQuantity: "",
      });
      setItemImages([]);
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  // Handle file selection with size validation
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > MAX_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error(`File too large: "${oversizedFiles[0].name}" exceeds the 5MB limit.`);
      return;
    }

    const newImages = files.map((file) => ({
      type: "new",
      url: URL.createObjectURL(file),
      file,
    }));

    setItemImages((prev) => [...prev, ...newImages]);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    setItemImages((prev) => {
      const target = prev[index];
      if (target.type === "new" && target.url) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Move image in array (reorder)
  const handleMoveImage = (index, direction) => {
    if (direction === "left" && index === 0) return;
    if (direction === "right" && index === itemImages.length - 1) return;

    const newIndex = direction === "left" ? index - 1 : index + 1;
    setItemImages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[newIndex];
      updated[newIndex] = temp;
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error("Please enter a name");
    if (!formData.price || parseFloat(formData.price) <= 0) return toast.error("Please enter a valid price");
    if (formData.availableQuantity === "" || parseInt(formData.availableQuantity, 10) < 0) {
      return toast.error("Please enter a valid quantity");
    }

    const submitData = new FormData();
    submitData.append("name", formData.name.trim());
    submitData.append("description", formData.description.trim());
    submitData.append("category", formData.category);
    submitData.append("price", formData.price);
    submitData.append("availableQuantity", formData.availableQuantity);

    if (editingItem) {
      const keptExistingImages = itemImages
        .filter((img) => img.type === "existing")
        .map((img) => img.url);

      submitData.append("existingImages", JSON.stringify(keptExistingImages));

      itemImages
        .filter((img) => img.type === "new")
        .forEach((img) => {
          submitData.append("images", img.file);
        });
    } else {
      itemImages.forEach((img) => {
        if (img.file) submitData.append("images", img.file);
      });
    }

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-800 animate-scaleUp">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-850 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-500" />
            <span>{editingItem ? "Edit Shop Item" : "Add New Shop Item"}</span>
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-450 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. BlueBird Branded T-Shirt"
                className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-455 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                <option value="Clothes">Clothes</option>
                <option value="Accessories">Accessories</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-455 mb-1">Price (LKR) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="e.g. 1500.00"
                className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-455 mb-1">Stock Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.availableQuantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, availableQuantity: e.target.value }))}
                placeholder="e.g. 50"
                className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-455 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your product details, materials, size guides, etc."
              className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
            />
          </div>

          {/* Image Manager Section */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-455 mb-2">
              Images Upload (First image will be the MAIN Image)
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="multi-image-picker"
            />

            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="multi-image-picker"
                className="flex flex-col items-center justify-center gap-1 w-28 h-28 border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer hover:border-blue-500 transition group"
              >
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                <span className="text-[10px] text-slate-500 group-hover:text-blue-500 font-bold uppercase">Upload</span>
              </label>

              {/* Previews grid */}
              <div className="flex flex-wrap gap-3">
                {itemImages.map((image, index) => (
                  <div
                    key={`${image.type}-${index}`}
                    className="relative w-28 h-28 rounded-xl overflow-hidden border border-slate-200 group"
                  >
                    <img
                      src={image.url}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Image overlay with actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-1.5 transition-opacity">
                      {/* Close/Remove btn */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="self-end p-0.5 bg-rose-600 rounded text-white hover:bg-rose-500 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* Reordering and indicator */}
                      <div className="flex items-center justify-between w-full mt-auto">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, "left")}
                          disabled={index === 0}
                          className="p-0.5 bg-slate-800 text-slate-300 rounded hover:text-white disabled:opacity-30 transition cursor-pointer"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <span className="text-[9px] font-bold bg-slate-950 text-slate-300 px-1 rounded">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, "right")}
                          disabled={index === itemImages.length - 1}
                          className="p-0.5 bg-slate-800 text-slate-300 rounded hover:text-white disabled:opacity-30 transition cursor-pointer"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Main Image Badge */}
                    {index === 0 && (
                      <div className="absolute top-1 left-1 bg-blue-600 text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow">
                        Main
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2">
              * Drag/reorder images using left/right arrows to designate which image is main (the 1st position). Supported formats: JPEG, PNG, WEBP.
            </p>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition cursor-pointer font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingItem ? "Save Changes" : "Create Item"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

AddEditItemModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editingItem: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};
