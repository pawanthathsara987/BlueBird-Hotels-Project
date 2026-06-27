import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>{children}</div>
);

const baseInput =
  "w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-400 focus:border-blue-500 border border-slate-200 bg-slate-50 hover:bg-white";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Safely parse languageSkills from any format into a clean string[]
const parseLanguageSkills = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((s) => String(s).trim()).filter(Boolean);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
    } catch {
      // plain comma-separated string
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

export default function DriverForm({ driver, onCancel, onSaved }) {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
  const isEdit = Boolean(driver?.id);

  const initial = useMemo(() => {
    if (!driver) {
      return {
        fullName: "", nicNo: "", dateOfBirth: "", phone: "", address: "",
        licenseNo: "", licenseClass: "", licenseExpiry: "",
        employmentType: "full_time", status: "active",
        languageSkills: [],
        driverImage: null, driverImagePreview: null, notes: "",
      };
    }
    return {
      fullName: driver.fullName || "",
      nicNo: driver.nicNo || "",
      dateOfBirth: driver.dateOfBirth || "",
      phone: driver.phone || "",
      address: driver.address || "",
      licenseNo: driver.licenseNo || "",
      licenseClass: driver.licenseClass || "",
      licenseExpiry: driver.licenseExpiry || "",
      employmentType: driver.employmentType || "full_time",
      status: driver.status || "active",
      languageSkills: parseLanguageSkills(driver.languageSkills),
      driverImage: null,
      driverImagePreview: driver.driverImage || null,
      notes: driver.notes || "",
    };
  }, [driver]);

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [langInput, setLangInput] = useState("");

  useEffect(() => {
    setForm(initial);
    setErrors({});
    setLangInput("");
  }, [initial]);

  // ── Language tag helpers ──────────────────────────────────────────────────
  const addTags = (rawText) => {
    const newTags = rawText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !form.languageSkills.includes(s));
    if (newTags.length > 0) {
      setForm((p) => ({ ...p, languageSkills: [...p.languageSkills, ...newTags] }));
    }
    setLangInput("");
  };

  const handleLangKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTags(langInput);
    }
    if (e.key === "Backspace" && langInput === "" && form.languageSkills.length > 0) {
      setForm((p) => ({ ...p, languageSkills: p.languageSkills.slice(0, -1) }));
    }
  };

  const handleLangBlur = () => {
    if (langInput.trim()) addTags(langInput);
  };

  const removeTag = (tag) => {
    setForm((p) => ({ ...p, languageSkills: p.languageSkills.filter((l) => l !== tag) }));
  };

  // ── Generic field change ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const f = files?.[0] || null;
      const preview = f ? URL.createObjectURL(f) : null;
      setForm((p) => ({ ...p, driverImage: f, driverImagePreview: preview }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.nicNo.trim()) next.nicNo = "NIC / Passport is required.";
    if (!form.phone.trim()) next.phone = "Phone is required.";
    if (!form.licenseNo.trim()) next.licenseNo = "License number is required.";
    if (!form.licenseExpiry) next.licenseExpiry = "License expiry is required.";
    if (form.driverImage && !form.driverImage.type.startsWith("image/")) next.driverImage = "Only images allowed.";
    if (form.driverImage && form.driverImage.size > MAX_IMAGE_SIZE) next.driverImage = "Image must be 5MB or smaller.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem("managerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const fd = new FormData();
      fd.append("fullName", form.fullName.trim());
      fd.append("nicNo", form.nicNo.trim());
      fd.append("dateOfBirth", form.dateOfBirth || "");
      fd.append("phone", form.phone.trim());
      fd.append("address", form.address?.trim() || "");
      fd.append("licenseNo", form.licenseNo.trim());
      fd.append("licenseClass", form.licenseClass || "");
      fd.append("licenseExpiry", form.licenseExpiry);
      fd.append("employmentType", form.employmentType);
      fd.append("status", form.status);
      fd.append("languageSkills", JSON.stringify(form.languageSkills));
      fd.append("notes", form.notes || "");
      if (form.driverImage) fd.append("driverImage", form.driverImage);

      const url = isEdit
        ? `${backendBaseUrl}/manager/drivers/${driver.id}`
        : `${backendBaseUrl}/manager/drivers`;
      const res = await (isEdit ? axios.put(url, fd, config) : axios.post(url, fd, config));
      toast.success(isEdit ? "Driver updated" : "Driver created");
      if (onSaved) onSaved(res.data?.data || res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save driver";
      toast.error(msg);
      setErrors((p) => ({ ...p, ...(err.response?.data?.errors || {}) }));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold text-slate-500">Full name <span className="text-red-500">*</span></label>
            <input name="fullName" value={form.fullName} onChange={handleChange} className={baseInput} />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          {/* NIC */}
          <div>
            <label className="text-xs font-semibold text-slate-500">NIC / Passport <span className="text-red-500">*</span></label>
            <input name="nicNo" value={form.nicNo} onChange={handleChange} className={baseInput} />
            {errors.nicNo && <p className="text-xs text-red-500 mt-1">{errors.nicNo}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-semibold text-slate-500">Phone <span className="text-red-500">*</span></label>
            <input name="phone" value={form.phone} onChange={handleChange} className={baseInput} />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="text-xs font-semibold text-slate-500">Date of Birth</label>
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className={baseInput} />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} className={`${baseInput} min-h-24`} />
          </div>

          {/* License No */}
          <div>
            <label className="text-xs font-semibold text-slate-500">License No <span className="text-red-500">*</span></label>
            <input name="licenseNo" value={form.licenseNo} onChange={handleChange} className={baseInput} />
            {errors.licenseNo && <p className="text-xs text-red-500 mt-1">{errors.licenseNo}</p>}
          </div>

          {/* License Class */}
          <div>
            <label className="text-xs font-semibold text-slate-500">License Class</label>
            <input name="licenseClass" value={form.licenseClass} onChange={handleChange} className={baseInput} />
          </div>

          {/* License Expiry */}
          <div>
            <label className="text-xs font-semibold text-slate-500">License Expiry <span className="text-red-500">*</span></label>
            <input type="date" name="licenseExpiry" value={form.licenseExpiry} onChange={handleChange} className={baseInput} />
            {errors.licenseExpiry && <p className="text-xs text-red-500 mt-1">{errors.licenseExpiry}</p>}
          </div>

          {/* Employment Type */}
          <div>
            <label className="text-xs font-semibold text-slate-500">Employment Type</label>
            <select name="employmentType" value={form.employmentType} onChange={handleChange} className={baseInput}>
              <option value="full_time">Full time</option>
              <option value="part_time">Part time</option>
              <option value="contract">Contract</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-slate-500">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={baseInput}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On leave</option>
            </select>
          </div>

          {/* ── Language Skills Tag Input ── */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Language Skills</label>
            <div
              className={`flex flex-wrap items-center gap-2 p-2 min-h-[48px] border rounded-xl transition-all cursor-text
                ${errors.languageSkills ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"}
                focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-500 focus-within:bg-white`}
              onClick={() => document.getElementById("lang-input").focus()}
            >
              {form.languageSkills.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold shrink-0"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => removeTag(lang)}
                    className="hover:text-blue-900 focus:outline-none"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                id="lang-input"
                type="text"
                value={langInput}
                onChange={(e) => setLangInput(e.target.value)}
                onKeyDown={handleLangKeyDown}
                onBlur={handleLangBlur}
                placeholder={form.languageSkills.length === 0 ? "Type a language and press Enter..." : "Add more..."}
                className="flex-1 min-w-[140px] bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400 py-1"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-mono text-[10px]">Enter</kbd> or{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-mono text-[10px]">,</kbd> to add.{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-mono text-[10px]">Backspace</kbd> to remove last.
            </p>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className={`${baseInput} min-h-24`} />
          </div>

          {/* Driver Photo */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Driver Photo</label>
            <input
              type="file"
              name="driverImage"
              accept="image/*"
              onChange={handleChange}
              className={`${baseInput} file:mr-3 file:py-1.5 file:px-3 file:border-0 file:rounded-lg file:bg-blue-50 file:text-blue-600 file:font-semibold file:cursor-pointer`}
            />
            {form.driverImagePreview && (
              <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 w-40">
                <img src={form.driverImagePreview} alt="Preview" className="w-full h-40 object-cover" />
              </div>
            )}
            {errors.driverImage && <p className="text-xs text-red-500 mt-1">{errors.driverImage}</p>}
          </div>

        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEdit ? "Update Driver" : "Add Driver"}
          </button>
        </div>
      </form>
    </Card>
  );
}
