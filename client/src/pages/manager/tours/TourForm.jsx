import { useState, useEffect } from "react";
import {
  Plus, Check, X, DollarSign, FileText,
  ClipboardCheck, Info, Image as ImageIcon,
  MapPin, Upload, Search, Map,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// White card wrapper
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

// Section heading with colored icon
const SectionTitle = ({ bg, color, Icon, title, right }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 mb-5">
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}>
        {Icon && <Icon className={`w-4 h-4 ${color}`} />}
      </div>
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
    </div>
    <div className="self-start sm:self-auto">{right}</div>
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

 //ADD TOUR FORM

export default function AddTour({ onSave, onCancel, isEdit = false, initialData = {} }) {
  const navigate = useNavigate();
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
  const initialDurationType = initialData.durationType || "days";

  const getInitialItinerary = () => {
    if (!Array.isArray(initialData.itinerary) || !initialData.itinerary.length) {
      return [{ day: 1, description: "" }];
    }

    if (initialDurationType === "hours") {
      const combinedDescription = initialData.itinerary
        .map((entry) => {
          if (typeof entry === "string") {
            return entry.trim();
          }

          if (entry && typeof entry === "object") {
            return (entry.description || entry.activity || entry.title || entry.name || "").toString().trim();
          }

          return "";
        })
        .filter(Boolean)
        .join("\n");

      return [{ day: 1, description: combinedDescription }];
    }

    const mapped = initialData.itinerary
      .map((entry, idx) => {
        if (typeof entry === "string") {
          return { day: idx + 1, description: entry.trim() };
        }

        if (entry && typeof entry === "object") {
          return {
            day: idx + 1,
            description: (entry.description || entry.activity || entry.title || entry.name || "").toString().trim(),
          };
        }

        return { day: idx + 1, description: "" };
      })
      .filter((entry) => entry.description);

    return mapped.length ? mapped : [{ day: 1, description: "" }];
  };

  const getInitialItems = () => {
    // In edit mode, prefer record data over local cache.
    if (Array.isArray(initialData.includedItems) && initialData.includedItems.length) {
      return initialData.includedItems;
    }

    const savedItems = localStorage.getItem("selectedTourItems");
    if (!savedItems) return [""];

    try {
      const parsed = JSON.parse(savedItems);
      localStorage.removeItem("selectedTourItems");
      return Array.isArray(parsed) && parsed.length ? parsed : [""];
    } catch (error) {
      console.error("Invalid selectedTourItems data:", error);
      return [""];
    }
  };

  // Form state
  const [form, setForm] = useState({
    packageName: initialData.packageName || "",
    overview: initialData.overview || "",
    duration: initialData.duration || "",
    durationType: initialDurationType,
    price: initialData.price || "",
    discount: initialData.discount || "",
    termsConditions: initialData.termsConditions || "",
    location: initialData.location || "",
    groupSize: initialData.groupSize || "",
    status: initialData.status || "active",
  });

  const [image, setImage]   = useState(initialData.image || null);
  const [imageFile, setImageFile] = useState(null);
  const [items, setItems]   = useState(getInitialItems);
  const [itineraryRows, setItineraryRows] = useState(getInitialItinerary);
  const [errors, setErrors] = useState({});

  // Modal state for tour items selection
  const [showItemModal, setShowItemModal] = useState(false);
  const [tourItemsList, setTourItemsList] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Fetch available tour items when modal opens
  useEffect(() => {
    const fetchTourItems = async () => {
      try {
        setLoadingItems(true);
        const response = await fetch(`${backendBaseUrl}/manager/tour-items`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setTourItemsList(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch tour items:", error);
      } finally {
        setLoadingItems(false);
      }
    };

    if (showItemModal) {
      fetchTourItems();
    }
  }, [showItemModal, backendBaseUrl]);

  // Toggle item selection in modal
  const toggleItem = (itemId, itemName) => {
    const itemExists = items.some(item => item === itemName || item === itemId);
    if (itemExists) {
      setItems(items.filter(item => item !== itemName && item !== itemId));
    } else {
      setItems([...items, itemName]);
    }
  };

  // Update a form field and clear its error
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "durationType") {
      setForm((prev) => ({ ...prev, durationType: value }));

      setItineraryRows((prev) => {
        if (value === "hours") {
          const combinedDescription = prev
            .map((entry) => (entry.description || "").trim())
            .filter(Boolean)
            .join("\n");

          return [{ day: 1, description: combinedDescription }];
        }

        if (prev.length === 1 && !prev[0]?.description?.trim()) {
          return [{ day: 1, description: "" }];
        }

        return prev.map((entry, index) => ({
          day: entry.day || index + 1,
          description: entry.description || "",
        }));
      });

      setErrors((prev) => ({ ...prev, durationType: "", itinerary: "" }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  // Load selected image as base64 preview
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setImageFile(file);
      setErrors(prev => ({ ...prev, image: "" }));
    };
    reader.readAsDataURL(file);
  };

  // Update one inclusion item by index
  const updateItem = (index, value) => {
    const updated = [...items];
    updated[index] = value;
    setItems(updated);
  };

  // Remove one inclusion item by index
  const removeItem = (index) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const updateItineraryRow = (index, key, value) => {
    setItineraryRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
    setErrors((prev) => ({ ...prev, itinerary: "" }));
  };

  const addItineraryRow = () => {
    const nextDay = Math.max(...itineraryRows.map(r => r.day || 0)) + 1;
    setItineraryRows((prev) => [...prev, { day: nextDay, description: "" }]);
  };

  const removeItineraryRow = (index) => {
    setItineraryRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  // Validate all fields, return error map
  const validate = () => {
    const e = {};
    if (!form.packageName.trim())                                        e.packageName     = "Package name is required.";
    if (!isEdit && !image && !imageFile)                                e.image           = "Tour image is required.";
    if (!form.overview.trim())                                           e.overview        = "Overview is required.";
    if (!form.price || isNaN(form.price) || +form.price <= 0)           e.price           = "Enter a valid price.";
    if (form.discount && (+form.discount < 0 || +form.discount > 100))  e.discount        = "Must be 0–100.";
    if (!items.filter(i => i.trim()).length)                             e.items           = "Add at least one inclusion.";
    if (!form.termsConditions.trim())                                    e.termsConditions = "Terms and conditions are required.";
    if (form.groupSize && (!Number.isInteger(Number(form.groupSize)) || Number(form.groupSize) <= 0)) {
      e.groupSize = "Group size must be a positive whole number.";

    }
    if (!form.groupSize.trim()) {
      e.groupSize = "Group size is required.";
    }
    if (!form.location.trim()) {
      e.location = "Location is required.";
    }

    const cleanedItinerary = itineraryRows
      .map((entry) => ({
        day: entry.day,
        description: entry.description.trim(),
      }))
      .filter((entry) => entry.description);

    const hasInvalidItinerary = cleanedItinerary.some((entry) => !entry.day || !entry.description);
    if (!cleanedItinerary.length) {
      e.itinerary = "Add at least one day with activity description.";
    } else if (hasInvalidItinerary) {
      e.itinerary = "Each day entry needs an activity description.";
    }

    return e;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    const itineraryPayload = form.durationType === "hours"
      ? [{
          day: 1,
          description: itineraryRows
            .map((entry) => entry.description.trim())
            .filter(Boolean)
            .join("\n"),
        }].filter((entry) => entry.description)
      : itineraryRows
          .map((entry) => ({
            day: entry.day,
            description: entry.description.trim(),
          }))
          .filter((entry) => entry.description);

    const payload = {
      ...form,
      includedItems: items.filter(i => i.trim()),
      itinerary: itineraryPayload,
      groupSize: form.groupSize ? Number(form.groupSize) : null,
    };

    if (onSave) {
      onSave({ ...payload, imageFile });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("packageName", payload.packageName);
      formData.append("overview", payload.overview);
      formData.append("duration", payload.duration);
        formData.append("durationType", payload.durationType);
      formData.append("price", String(payload.price));
      formData.append("discount", String(payload.discount || 0));
      formData.append("termsConditions", payload.termsConditions);
      formData.append("location", payload.location);
      formData.append("itinerary", JSON.stringify(payload.itinerary));
      formData.append("includedItems", JSON.stringify(payload.includedItems));
      if (payload.groupSize !== null) {
        formData.append("groupSize", String(payload.groupSize));
      }
      formData.append("status", payload.status || "active");
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(`${backendBaseUrl}/manager/tours`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create tour");
      }

      localStorage.removeItem("selectedTourItems");
      navigate("/manager/tours/tourManagement");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Failed to create tour",
      }));
    }
  };

  // Derived values
  const finalPrice = form.price && form.discount
    ? (Number(form.price) * (1 - Number(form.discount) / 100)).toFixed(2)
    : null;

  const mapSrc = form.location
    ? `https://maps.google.com/maps?q=${encodeURIComponent(form.location)}&output=embed`
    : null;


  return (

    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Row 1: Basic Info + Image ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Package Name + Overview */}
            <Card className="lg:col-span-3 space-y-5">
              <SectionTitle bg="bg-blue-100" color="text-blue-700" Icon={Info} title="Basic Info" />

              <div>
                <FieldLabel text="Package Name" required error={errors.packageName} />
                <input
                  name="packageName"
                  value={form.packageName}
                  onChange={handleChange}
                  placeholder="e.g. Negombo Lagoon Tour"
                  className={inputCls(errors.packageName)}
                />
              </div>

              <div>
                <FieldLabel text="Tour Overview" required error={errors.overview} />
                <textarea
                  name="overview"
                  value={form.overview}
                  onChange={handleChange}
                  rows={7}
                  placeholder="Describe destinations, highlights, what makes it special..."
                  className={`${inputCls(errors.overview)} resize-none`}
                />
              </div>

              <div>
                <FieldLabel text="Duration" />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    name="duration"
                    type="number"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="e.g. 6"
                    className={`col-span-2 ${inputCls(false)}`}
                  />
                  <select
                    name="durationType"
                    value={form.durationType}
                    onChange={handleChange}
                    className={inputCls(false)}
                  >
                    <option value="days">Days</option>
                    <option value="hours">Hours</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Tour Image Upload */}
            <Card className="lg:col-span-2 flex flex-col">
              <SectionTitle bg="bg-sky-100" color="text-sky-600" Icon={ImageIcon} title="Tour Image" />

              <label className="flex-1 flex flex-col cursor-pointer group">
                <div className={`flex-1 min-h-56 rounded-xl border-2 border-dashed overflow-hidden transition-all
                  ${errors.image ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/20"}`}>
                  {image ? (
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                        <Upload className="w-7 h-7 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Click to upload</p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP</p>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>

              {image && (
                <button type="button" onClick={() => { setImage(null); setImageFile(null); }}
                  className="mt-3 text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 justify-center">
                  <X className="w-3.5 h-3.5" /> Remove image
                </button>
              )}
              {errors.image && <p className="text-red-500 text-xs mt-2 text-center">{errors.image}</p>}
            </Card>
          </div>


            {/* ── Row 2: Pricing ── */}
            <Card>
              <SectionTitle bg="bg-amber-100" color="text-amber-600" Icon={DollarSign} title="Pricing" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">

                {/* Price */}
                <div>
                  <FieldLabel text="Price (USD)" required error={errors.price} />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                    <input
                      type="number" name="price" value={form.price} onChange={handleChange}
                      placeholder="0.00" min="0"
                      className={`${inputCls(errors.price)} pl-7`}
                    />
                  </div>
                </div>

                {/* Discount */}
                <div>
                  <FieldLabel text="Discount (%)" error={errors.discount} />
                  <div className="relative">
                    <input
                      type="number" name="discount" value={form.discount} onChange={handleChange}
                      placeholder="0" min="0" max="100"
                      className={`${inputCls(errors.discount)} pr-8`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                  </div>
                </div>

                {/* Final price preview */}
                {finalPrice ? (
                  <div className="bg-linear-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Final Price</p>
                      <p className="text-xl font-bold text-blue-700">${finalPrice}</p>
                    </div>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">
                      -{form.discount}%
                    </span>
                  </div>
                ) : (
                  <div className="h-12.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
                    <p className="text-xs text-slate-400">Discounted price preview</p>
                  </div>
                )}
              </div>
            </Card>


            {/* ── Row 3: Inclusions ── */}
            <Card>
              <SectionTitle
                bg="bg-teal-100" color="text-teal-600" Icon={ClipboardCheck} title="Inclusions"
                right={
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowItemModal(true)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Tour Item
                    </button>
                  </div>
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-blue-600" />
                    </div>
                    <input
                      type="text" value={item}
                      onChange={e => updateItem(i, e.target.value)}
                      placeholder={["A/C vehicle transport", "English Speaking Driver", "Parking & highway fees"][i % 5]}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-sm text-slate-700
                      placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                    />
                    <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {errors.items && <p className="text-red-500 text-xs mt-3">{errors.items}</p>}
            </Card>


          {/* ── Row 4: Terms + Map ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Terms & Conditions */}
            <Card>
              <SectionTitle bg="bg-orange-100" color="text-orange-600" Icon={FileText} title="Terms & Conditions" />
              <FieldLabel text="Cancellation Policy" required error={errors.termsConditions} />
              <textarea
                name="termsConditions" value={form.termsConditions} onChange={handleChange} rows={6}
                placeholder={"60% Refund 7+ days before\n"}
                className={`${inputCls(errors.termsConditions)} resize-none`}
              />
            </Card>

            {/* Location + Map */}
            <Card>
              <SectionTitle bg="bg-rose-100" color="text-rose-600" Icon={MapPin} title="Tour Location / Map" />
              <FieldLabel text="Location Name" required error={errors.location} />
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="location" value={form.location} onChange={handleChange}
                  placeholder="e.g. Negombo, Sri Lanka"
                  className={`${inputCls(errors.location)} pl-9`}
                />
              </div>
              <div className={`rounded-xl overflow-hidden border border-slate-200 ${mapSrc ? "h-48" : "h-36 bg-slate-50 flex items-center justify-center"}`}>
                {mapSrc ? (
                  <iframe title="Map" src={mapSrc} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                ) : (
                  <div className="text-center">
                    <Map className="w-10 h-10 text-slate-200 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">Enter location to preview</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* ── Row 5: Itinerary + Group ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <SectionTitle bg="bg-indigo-100" color="text-indigo-600" Icon={ClipboardCheck} title={form.durationType === 'hours' ? 'Activity Details' : 'Daily Itinerary'} />
              <FieldLabel text={form.durationType === 'hours' ? 'Tour Activities' : 'Day by Day Activities'} required error={errors.itinerary} />

              {form.durationType === 'days' ? (
                <>
                  <div className="space-y-3">
                    {itineraryRows.map((entry, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-3 flex items-center px-4 py-2.5 rounded-xl border border-slate-200 bg-indigo-50 font-semibold text-indigo-700">
                          Day {entry.day}
                        </div>
                        <input
                          type="text"
                          value={entry.description}
                          onChange={(e) => updateItineraryRow(index, "description", e.target.value)}
                          placeholder="e.g. Boat ride at Bentota, visit temple, dinner"
                          className={`sm:col-span-8 ${inputCls(false)}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeItineraryRow(index)}
                          disabled={itineraryRows.length === 1}
                          className="sm:col-span-1 w-full sm:w-9 h-9 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                          aria-label="Remove itinerary row"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addItineraryRow}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Day
                  </button>
                </>
              ) : (
                <textarea
                  value={itineraryRows[0]?.description || ''}
                  onChange={(e) => updateItineraryRow(0, 'description', e.target.value)}
                  rows={5}
                  placeholder="Describe all activities for this tour session..."
                  className={`${inputCls(false)} resize-none w-full`}
                />
              )}
            </Card>

            <Card>
              <SectionTitle bg="bg-emerald-100" color="text-emerald-600" Icon={Info} title="Capacity" />
              <FieldLabel text="Group Size" error={errors.groupSize} />
              <input
                type="number"
                name="groupSize"
                value={form.groupSize}
                onChange={handleChange}
                min="1"
                placeholder="e.g. 12"
                className={inputCls(errors.groupSize)}
              />

              {isEdit && (
                <div className="mt-5">
                  <FieldLabel text="Status" />
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={inputCls(false)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
            </Card>
          </div>


          {/* ── Action Bar ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between sticky bottom-4">
            <p className="text-xs text-slate-400 hidden sm:block">
              <span className="text-red-500">*</span> required fields
            </p>
            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={() => (onCancel ? onCancel() : navigate("/manager/tours/tourManagement"))}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button type="submit"
                className="px-7 py-2.5 bg-linear-to-r from-blue-700 to-blue-500 hover:from-blue-800
                hover:to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> {isEdit ? "Update Tour" : "Create Tour"}
              </button>
            </div>
          </div>
          {errors.submit && <p className="text-red-500 text-sm text-right">{errors.submit}</p>}

          {/* ── Tour Items Selection Modal ── */}
          {showItemModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-96 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Select Tour Items</h3>
                  <button
                    type="button"
                    onClick={() => setShowItemModal(false)}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {loadingItems ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-slate-500">Loading items...</p>
                  </div>
                ) : tourItemsList.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-slate-500 text-sm">No tour items available. Create one first.</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto flex-1 mb-4 space-y-2">
                    {tourItemsList.map((tourItem) => (
                      <label
                        key={tourItem.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={items.includes(tourItem.name) || items.includes(tourItem.id.toString())}
                          onChange={() => toggleItem(tourItem.id, tourItem.name)}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                        <span className="text-sm text-slate-700">{tourItem.name}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowItemModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}