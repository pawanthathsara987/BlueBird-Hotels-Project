import { useState } from "react";
import PropTypes from "prop-types";
import { X, Plus, Edit3, Trash2, Save, Undo2, Tag, Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageCategoriesModal({
  isOpen,
  onClose,
  categories,
  loadingCategories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) {
  // Add Category form states
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Edit Category inline states
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete category state
  const [deletingId, setDeletingId] = useState(null);

  if (!isOpen) return null;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return toast.error("Please enter a category name");

    setIsAdding(true);
    try {
      const success = await onAddCategory(newCatName.trim(), newCatDesc.trim());
      if (success) {
        setNewCatName("");
        setNewCatDesc("");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.categoryId);
    setEditName(cat.name);
    setEditDesc(cat.description || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDesc("");
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return toast.error("Category name cannot be empty");

    setIsUpdating(true);
    try {
      const success = await onUpdateCategory(id, editName.trim(), editDesc.trim());
      if (success) {
        setEditingId(null);
        setEditName("");
        setEditDesc("");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = async (id) => {
    if (deletingId) return; // Prevent double trigger
    setDeletingId(id);
    try {
      await onDeleteCategory(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />
      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center z-[101] px-4 py-6 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-100 animate-scaleUp max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
          
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-500" />
              <span>Manage Item Categories</span>
            </h2>
            <button
              onClick={onClose}
              type="button"
              className="text-slate-400 hover:text-slate-650 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form & List Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Add Category Section */}
            <form onSubmit={handleAddSubmit} className="bg-slate-50/70 border border-slate-100 p-4 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Create New Category</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toiletries"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Soap, shampoo, etc."
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-blue-500/10"
                >
                  {isAdding ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Plus size={14} />
                  )}
                  <span>Add Category</span>
                </button>
              </div>
            </form>

            {/* Category List Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Existing Categories</h3>
              
              {loadingCategories ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-400 font-medium">Loading categories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                  No categories found. Create one above to get started.
                </div>
              ) : (
                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-1/3">Name</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-5/12">Description</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right w-1/4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {categories.map((cat) => {
                        const isEditing = editingId === cat.categoryId;
                        const isThisDeleting = deletingId === cat.categoryId;

                        return (
                          <tr key={cat.categoryId} className="hover:bg-slate-50/30 transition duration-200">
                            {isEditing ? (
                              <>
                                <td className="px-4 py-2.5">
                                  <input
                                    type="text"
                                    required
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </td>
                                <td className="px-4 py-2.5">
                                  <input
                                    type="text"
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() => handleSaveEdit(cat.categoryId)}
                                      className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                      title="Save Category"
                                    >
                                      {isUpdating ? (
                                        <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                      ) : (
                                        <Save size={14} />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={handleCancelEdit}
                                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                      title="Cancel"
                                    >
                                      <Undo2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-4 py-3.5 font-bold text-slate-700 text-xs truncate max-w-[150px]">
                                  {cat.name}
                                </td>
                                <td className="px-4 py-3.5 text-slate-450 text-xs truncate max-w-[200px]" title={cat.description || ""}>
                                  {cat.description || <span className="text-slate-300 italic">No description</span>}
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(cat)}
                                      className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                      title="Edit Category"
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={!!deletingId}
                                      onClick={() => handleDeleteClick(cat.categoryId)}
                                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                      title="Delete Category"
                                    >
                                      {isThisDeleting ? (
                                        <div className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                      ) : (
                                        <Trash2 size={13} />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

ManageCategoriesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  loadingCategories: PropTypes.bool.isRequired,
  onAddCategory: PropTypes.func.isRequired,
  onUpdateCategory: PropTypes.func.isRequired,
  onDeleteCategory: PropTypes.func.isRequired,
};
