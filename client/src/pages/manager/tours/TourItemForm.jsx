
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, Plus, Sparkles, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

// White card wrapper
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

// Section heading with colored icon
const SectionTitle = ({ bg, color, Icon, title, right }) => (
  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}>
        {Icon && <Icon className={`w-4 h-4 ${color}`} />}
      </div>
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
    </div>
    {right}
  </div>
);

// Field label + error
const FieldLabel = ({ text, required, error }) => (
  <div className="mb-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {text} {required && <span className="text-red-500">*</span>}
    </label>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// Input className builder
const baseInput =
  "w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-400 focus:border-blue-500";

const inputCls = (hasError) =>
  `${baseInput} border ${
    hasError
      ? "border-red-400 bg-red-50"
      : "border-slate-200 bg-slate-50 hover:bg-white"
  }`;

// ADD TOUR ITEM FORM
export default function TourItemForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
  const returnToSelect = searchParams.get("return") === "select";
  const backPath = returnToSelect ? "/manager/tours/item/select" : "/manager/tours/tourManagement";

  // Form state
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const trimmedName = name.trim();
  const nameLength = trimmedName.length;
  const isNameValid = nameLength >= 3 && nameLength <= 60;

  // Update name field and clear its error
  const handleChange = (e) => {
    setName(e.target.value);
    setErrors(prev => ({ ...prev, name: "" }));
  };

  // Validate form
  const validate = () => {
    const e = {};
    if (!trimmedName) {
      e.name = "Tour item name is required.";
    } else if (trimmedName.length < 3) {
      e.name = "Name must be at least 3 characters.";
    } else if (trimmedName.length > 60) {
      e.name = "Name cannot exceed 60 characters.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${backendBaseUrl}/manager/tour-items`, {
        name: trimmedName,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Tour item created successfully!");
        setName("");
        setErrors({});
        localStorage.setItem("tourSelectBtn", "items");
        navigate(backPath);
      } else {
        toast.error(response.data.message || "Failed to create tour item.");
      }
    } catch (error) {
      console.error("Error creating tour item:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while creating the tour item.";
      toast.error(errorMessage);
      setErrors(prev => ({ ...prev, name: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-linear-to-b from-sky-50 via-blue-50 to-indigo-50 py-8 px-4 md:px-8">
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => {
              localStorage.setItem("tourSelectBtn", "items");
              navigate(backPath);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {returnToSelect ? "Back to Select Tour Items" : "Back to Tour Items"}
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-blue-100 text-blue-700 text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Manager Panel
          </div>
        </div>

        <Card className="max-w-none">
          <div className="mb-6">
            <h2 className="text-3xl font-black tracking-tight text-slate-800">Create New Tour Item</h2>
            <p className="text-slate-500 mt-1">
              Add an item that can be linked to your tour packages.
            </p>
          </div>

          <SectionTitle
            bg="bg-blue-100"
            color="text-blue-600"
            Icon={Plus}
            title="Tour Item Details"
            right={
              isNameValid ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Looks good
                </span>
              ) : null
            }
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <FieldLabel
                text="Tour Item Name"
                required={true}
                error={errors.name}
              />
              <input
                type="text"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="e.g., City Walk, River Cruise, Cultural Visit"
                className={inputCls(!!errors.name)}
                disabled={isLoading}
              />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Use a short, clear item name.</span>
                <span className={nameLength > 60 ? "text-red-500 font-semibold" : ""}>{nameLength}/60</span>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Live Preview</p>
              <p className="text-slate-700 font-semibold">
                {trimmedName || "Your tour item name will appear here"}
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors"
              >
                {isLoading ? "Creating..." : "Create Tour Item"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setName("");
                  setErrors({});
                }}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}