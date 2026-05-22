import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DriverForm from './DriverForm';

export default function EditDriver() {
	const { id } = useParams();
	const navigate = useNavigate();
	const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api').replace(/\/$/, '');
	const [driver, setDriver] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const token = localStorage.getItem('managerToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
				const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
				const res = await axios.get(`${backendBaseUrl}/manager/drivers/${id}`, config);
				if (mounted) setDriver(res.data?.data || null);
			} catch (err) {
				toast.error(err.response?.data?.message || err.message || 'Failed to load driver');
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => { mounted = false; };
	}, [id]);

	if (loading) return <div className="p-6">Loading...</div>;
	if (!driver) return <div className="p-6">Driver not found.</div>;

	return (
		<div className="p-6 max-w-3xl">
			<h2 className="text-2xl font-bold mb-4">Edit Driver</h2>
			<DriverForm driver={driver} onCancel={() => navigate('/manager/drivers')} onSaved={() => navigate('/manager/drivers')} />
		</div>
	);
}
