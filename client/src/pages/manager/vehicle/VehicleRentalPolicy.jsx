import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

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
        depositNonRefundable: policy.depositNonRefundable,
        sameConditionRequired: policy.sameConditionRequired,
        sameFuelLevelRequired: policy.sameFuelLevelRequired,
        thirdPartyLendingAllowed: policy.thirdPartyLendingAllowed,
        lateReturnGraceHours: policy.lateReturnGraceHours,
        lateReturnFeePerHour: policy.lateReturnFeePerHour,
        lateReturnFullDayAfterHours: policy.lateReturnFullDayAfterHours,
        cleaningFee: policy.cleaningFee,
        damageLiabilityCap: policy.damageLiabilityCap,
        includedKilometersPerDay: policy.includedKilometersPerDay,
        extraMileageFee: policy.extraMileageFee,
        extraMileageCurrency: policy.extraMileageCurrency,
        termsAndConditions: policy.termsAndConditions,
      };

      const res = await axios.put(`${backendBaseUrl}/manager/vehicle-rental-policy`, payload, config);
      setPolicy(res.data?.data || policy);
      toast.success("Policy saved");
      setErrors({});
    } catch (err) {
      const apiErrors = err.response?.data?.errors || {};
      setErrors(apiErrors);
      toast.error(err.response?.data?.message || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading policy...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Vehicle Rental Policy</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!policy.depositNonRefundable} onChange={(e) => handleChange('depositNonRefundable', e.target.checked)} /> Deposit non-refundable</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!policy.sameConditionRequired} onChange={(e) => handleChange('sameConditionRequired', e.target.checked)} /> Return in same condition</label>
        </div>

        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!policy.sameFuelLevelRequired} onChange={(e) => handleChange('sameFuelLevelRequired', e.target.checked)} /> Same fuel level required</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!policy.thirdPartyLendingAllowed} onChange={(e) => handleChange('thirdPartyLendingAllowed', e.target.checked)} /> Allow lending to third parties</label>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Late return grace hours</label>
            <input type="number" step="1" min="0" value={policy.lateReturnGraceHours ?? 0} onChange={(e) => handleChange('lateReturnGraceHours', e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
            {errors.lateReturnGraceHours && <p className="text-xs text-red-500">{errors.lateReturnGraceHours}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Late return fee / hour</label>
            <input type="number" step="0.01" min="0" value={policy.lateReturnFeePerHour ?? 0} onChange={(e) => handleChange('lateReturnFeePerHour', e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
            {errors.lateReturnFeePerHour && <p className="text-xs text-red-500">{errors.lateReturnFeePerHour}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Full day after N hours</label>
            <input type="number" step="1" min="0" value={policy.lateReturnFullDayAfterHours ?? 4} onChange={(e) => handleChange('lateReturnFullDayAfterHours', e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
            {errors.lateReturnFullDayAfterHours && <p className="text-xs text-red-500">{errors.lateReturnFullDayAfterHours}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Cleaning fee</label>
            <input type="number" step="0.01" min="0" value={policy.cleaningFee ?? 0} onChange={(e) => handleChange('cleaningFee', e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
            {errors.cleaningFee && <p className="text-xs text-red-500">{errors.cleaningFee}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Damage liability cap</label>
            <input type="number" step="0.01" min="0" value={policy.damageLiabilityCap ?? 0} onChange={(e) => handleChange('damageLiabilityCap', e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
            {errors.damageLiabilityCap && <p className="text-xs text-red-500">{errors.damageLiabilityCap}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Included km / day</label>
            <input type="number" step="1" min="0" value={policy.includedKilometersPerDay ?? 100} onChange={(e) => handleChange('includedKilometersPerDay', e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
            {errors.includedKilometersPerDay && <p className="text-xs text-red-500">{errors.includedKilometersPerDay}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Extra mileage fee</label>
            <input type="number" step="0.01" min="0" value={policy.extraMileageFee ?? 0} onChange={(e) => handleChange('extraMileageFee', e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
            {errors.extraMileageFee && <p className="text-xs text-red-500">{errors.extraMileageFee}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Extra mileage currency</label>
            <input type="text" value={policy.extraMileageCurrency ?? 'LKR'} onChange={(e) => handleChange('extraMileageCurrency', e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Terms and conditions (text)</label>
          <textarea rows={6} value={policy.termsAndConditions || ''} onChange={(e) => handleChange('termsAndConditions', e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving…' : 'Save Policy'}</button>
          <button type="button" onClick={fetchPolicy} className="px-4 py-2 border rounded">Reload</button>
        </div>
      </form>
    </div>
  );
}
