import { useState } from 'react';
import axios from 'axios';

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');

export default function Checklist() {
  const [bookingId, setBookingId] = useState('');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    type: 'return',
    conditionKm: '',
    fuelLevel: 'full',
    damages: '',
    accessories: '',
    photos: '',
    signedByCustomer: false,
    signedByStaff: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getAuthConfig = () => {
    const token = localStorage.getItem('managerToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchForBooking = async () => {
    setError('');
    if (!bookingId) return setError('Enter booking id');
    setLoading(true);
    try {
      const res = await axios.get(`${backendBaseUrl}/manager/bookings/${bookingId}/checklists`, getAuthConfig());
      setItems(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleCreate = async () => {
    setError('');
    if (!bookingId) return setError('Enter booking id');
    if (!form.conditionKm) return setError('Enter condition km');
    setLoading(true);
    try {
      const payload = {
        bookingId: Number(bookingId),
        type: form.type,
        conditionKm: Number(form.conditionKm),
        fuelLevel: form.fuelLevel,
        damages: form.damages || null,
        accessories: form.accessories ? form.accessories.split(',').map(s => s.trim()).filter(Boolean) : [],
        photos: form.photos ? form.photos.split(',').map(s => s.trim()).filter(Boolean) : [],
        signedByCustomer: Boolean(form.signedByCustomer),
        signedByStaff: Boolean(form.signedByStaff),
      };
      const res = await axios.post(`${backendBaseUrl}/manager/checklists`, payload, getAuthConfig());
      setItems(prev => [...prev, res.data.data]);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Vehicle Checklist</h2>

      <div className="mb-4 max-w-2xl">
        <label className="block text-sm font-medium">Booking ID</label>
        <div className="flex gap-2 mt-2">
          <input type="number" value={bookingId} onChange={(e) => setBookingId(e.target.value)} className="rounded border px-3 py-2" />
          <button onClick={fetchForBooking} className="rounded bg-sky-600 text-white px-4">Load</button>
        </div>
      </div>

      <div className="space-y-3 max-w-2xl mb-6">
        <div>
          <label className="block text-sm font-medium">Type</label>
          <select value={form.type} onChange={(e) => handleChange('type', e.target.value)} className="mt-1 rounded border px-3 py-2">
            <option value="pickup">Pickup</option>
            <option value="return">Return</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Condition Km</label>
          <input type="number" value={form.conditionKm} onChange={(e) => handleChange('conditionKm', e.target.value)} className="mt-1 rounded border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Fuel Level</label>
          <select value={form.fuelLevel} onChange={(e) => handleChange('fuelLevel', e.target.value)} className="mt-1 rounded border px-3 py-2">
            <option value="empty">Empty</option>
            <option value="quarter">Quarter</option>
            <option value="half">Half</option>
            <option value="three_quarter">Three quarter</option>
            <option value="full">Full</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Damages (text)</label>
          <textarea value={form.damages} onChange={(e) => handleChange('damages', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Accessories (comma separated)</label>
          <input value={form.accessories} onChange={(e) => handleChange('accessories', e.target.value)} className="mt-1 rounded border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Photos (comma separated URLs)</label>
          <input value={form.photos} onChange={(e) => handleChange('photos', e.target.value)} className="mt-1 rounded border px-3 py-2" />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.signedByCustomer} onChange={(e) => handleChange('signedByCustomer', e.target.checked)} /> Signed by customer</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.signedByStaff} onChange={(e) => handleChange('signedByStaff', e.target.checked)} /> Signed by staff</label>
        </div>

        {error && <div className="text-rose-600">{error}</div>}

        <div>
          <button onClick={handleCreate} disabled={loading} className="rounded bg-emerald-600 text-white px-4 py-2">Create Checklist</button>
        </div>
      </div>

      <div className="max-w-2xl">
        <h3 className="text-lg font-semibold mb-2">Checklists</h3>
        {items.length === 0 && <div className="text-sm text-muted">No checklists loaded</div>}
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="border rounded p-3 bg-white">
              <div className="flex justify-between">
                <div>#{c.id} — <strong>{c.type}</strong></div>
                <div className="text-sm text-gray-600">{new Date(c.doneAt).toLocaleString()}</div>
              </div>
              <div>Km: {c.conditionKm} • Fuel: {c.fuelLevel}</div>
              {c.damages && <div className="mt-1">Damages: {c.damages}</div>}
              {c.accessories?.length > 0 && <div className="mt-1">Accessories: {c.accessories.join(', ')}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
