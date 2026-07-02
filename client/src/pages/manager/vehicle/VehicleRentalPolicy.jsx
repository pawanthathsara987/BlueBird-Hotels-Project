import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  ShieldCheck, 
  Clock, 
  Banknote, 
  Car, 
  MapPin, 
  FileText, 
  Save, 
  RefreshCw,
  AlertCircle
} from "lucide-react";

export default function VehicleRentalPolicy() {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem("managerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken");
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendBaseUrl}/manager/vehicle-rental-policy`, config);
      setPolicy(res.data?.data || null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to load policy");
      setPolicy(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolicy(); }, []);

  const handleChange = (key, value) => {
    setPolicy((p) => ({ ...(p || {}), [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        lateReturnGraceHours: policy.lateReturnGraceHours,
        lateReturnFeePerHour: policy.lateReturnFeePerHour,
        lateReturnFullDayAfterHours: policy.lateReturnFullDayAfterHours,
        securityDepositAmount: policy.securityDepositAmount,
        includedKilometersPerDay: policy.includedKilometersPerDay,
        extraMileageFee: policy.extraMileageFee,
        extraMileageCurrency: policy.extraMileageCurrency,
        termsAndConditions: policy.termsAndConditions,
      };

      const res = await axios.put(`${backendBaseUrl}/manager/vehicle-rental-policy`, payload, config);
      setPolicy(res.data?.data || policy);
      toast.success("Rental policy updated successfully!");
      setErrors({});
    } catch (err) {
      const apiErrors = err.response?.data?.errors || {};
      setErrors(apiErrors);
      toast.error(err.response?.data?.message || err.message || "Failed to save policy changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading rental policy...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <ShieldCheck size={28} />
            </div>
            Vehicle Rental Policy
          </h2>
          <p className="text-gray-500 mt-2 text-sm max-w-2xl">
            Configure the global rules, fees, and conditions applied to all vehicle rentals. These settings will affect all future bookings.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            type="button" 
            onClick={fetchPolicy} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-all duration-200"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Reload
          </button>
          <button 
            onClick={handleSave}
            disabled={saving} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Late Return Policy Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:border-blue-100 transition-colors duration-300">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Clock size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Late Return Rules</h3>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Grace Period (Hours)</label>
                <div className="relative">
                  <input 
                    type="number" step="1" min="0" 
                    value={policy?.lateReturnGraceHours ?? 0} 
                    onChange={(e) => handleChange('lateReturnGraceHours', e.target.value)} 
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">hrs</span>
                </div>
                {errors.lateReturnGraceHours && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12}/>{errors.lateReturnGraceHours}</p>}
                <p className="text-xs text-gray-500 mt-1.5">Free hours allowed after the scheduled return time.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Late Return Fee (per hour)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{import.meta.env.VITE_CURRENCY_TYPE || "LKR"}</div>
                  <input 
                    type="number" step="0.01" min="0" 
                    value={policy?.lateReturnFeePerHour ?? 0} 
                    onChange={(e) => handleChange('lateReturnFeePerHour', e.target.value)} 
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200" 
                  />
                </div>
                {errors.lateReturnFeePerHour && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12}/>{errors.lateReturnFeePerHour}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Day Charge Trigger</label>
                <div className="relative">
                  <input 
                    type="number" step="1" min="0" 
                    value={policy?.lateReturnFullDayAfterHours ?? 4} 
                    onChange={(e) => handleChange('lateReturnFullDayAfterHours', e.target.value)} 
                    className="w-full pl-4 pr-16 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">hours late</span>
                </div>
                {errors.lateReturnFullDayAfterHours && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12}/>{errors.lateReturnFullDayAfterHours}</p>}
                <p className="text-xs text-gray-500 mt-1.5">Charge a full day's rental fee if the vehicle is late by this many hours.</p>
              </div>
            </div>
          </div>

          {/* Financials & Mileage Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:border-emerald-100 transition-colors duration-300">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Car size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Mileage & Deposit</h3>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Security Deposit Amount</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{import.meta.env.VITE_CURRENCY_TYPE || "LKR"}</div>
                  <input 
                    type="number" step="0.01" min="0" 
                    value={policy?.securityDepositAmount ?? 0} 
                    onChange={(e) => handleChange('securityDepositAmount', e.target.value)} 
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200" 
                  />
                </div>
                {errors.securityDepositAmount && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12}/>{errors.securityDepositAmount}</p>}
                <p className="text-xs text-gray-500 mt-1.5">Standard deposit collected before vehicle handover.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Included Mileage (per day)</label>
                <div className="relative">
                  <input 
                    type="number" step="1" min="0" 
                    value={policy?.includedKilometersPerDay ?? 100} 
                    onChange={(e) => handleChange('includedKilometersPerDay', e.target.value)} 
                    className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">km</span>
                </div>
                {errors.includedKilometersPerDay && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12}/>{errors.includedKilometersPerDay}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Extra Mileage Fee</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{import.meta.env.VITE_CURRENCY_TYPE || "LKR"}</div>
                  <input 
                    type="number" step="0.01" min="0" 
                    value={policy?.extraMileageFee ?? 0} 
                    onChange={(e) => handleChange('extraMileageFee', e.target.value)} 
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200" 
                  />
                </div>
                {errors.extraMileageFee && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12}/>{errors.extraMileageFee}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions Full Width Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:border-indigo-100 transition-colors duration-300">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Terms and Conditions</h3>
          </div>
          
          <div className="p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Policy Text (Shown to customers during booking)</label>
            <textarea 
              rows={8} 
              value={policy?.termsAndConditions || ''} 
              onChange={(e) => handleChange('termsAndConditions', e.target.value)} 
              placeholder="Enter the comprehensive rental terms and conditions here..."
              className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 resize-y leading-relaxed" 
            />
            {errors.termsAndConditions && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12}/>{errors.termsAndConditions}</p>}
          </div>
        </div>
        
      </form>
    </div>
  );
}

