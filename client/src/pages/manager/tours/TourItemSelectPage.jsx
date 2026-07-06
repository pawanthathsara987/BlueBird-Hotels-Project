import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function TourItemSelectPage() {
  const navigate = useNavigate();
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

  const [tourItems, setTourItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedItems = localStorage.getItem("selectedTourItems");
    if (!savedItems) return;

    try {
      const parsed = JSON.parse(savedItems);
      if (Array.isArray(parsed)) {
        setSelectedItems(parsed);
      }
    } catch (error) {
      console.error("Invalid selectedTourItems data:", error);
    }
  }, []);

  useEffect(() => {
    const fetchTourItems = async () => {
      try {
        const response = await axios.get(`${backendBaseUrl}/manager/tour-items`);
        setTourItems(response.data?.data || []);
      } catch (error) {
        console.error("Failed to load tour items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTourItems();
  }, [backendBaseUrl]);

  const selectedCount = useMemo(() => selectedItems.length, [selectedItems]);

  const toggleSelection = (name) => {
    setSelectedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const useSelectedItems = () => {
    localStorage.setItem("selectedTourItems", JSON.stringify(selectedItems));
    navigate("/manager/tours/add");
  };

  return (
    <div className="w-[90%] md:w-[70%] mx-auto mt-8 px-6 py-5 flex flex-col gap-4 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Select Tour Items</h2>
          <p className="text-sm text-slate-500">Choose existing items to include in your tour package.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/manager/tours/item/add?return=select"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus size={18} />
            Create New Item
          </Link>

          <button
            type="button"
            onClick={() => navigate("/manager/tours/add")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            type="button"
            onClick={useSelectedItems}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Check size={18} />
            Use Selected ({selectedCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-sm text-slate-500">Loading tour items...</div>
      ) : tourItems.length === 0 ? (
        <div className="p-4 rounded-lg border border-dashed border-slate-300 text-slate-500">
          No tour items found. Create a new tour item first.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tourItems.map((item) => {
            const isSelected = selectedItems.includes(item.name);

            return (
              <div
                key={item.id}
                className={`flex justify-between items-center p-4 rounded-lg border ${
                  isSelected ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200"
                }`}
              >
                <span className="text-gray-700 font-medium">{item.name}</span>
                <button
                  type="button"
                  onClick={() => toggleSelection(item.name)}
                  className={`px-3 py-1 text-sm rounded-lg font-semibold transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {isSelected ? "Selected" : "Select"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
