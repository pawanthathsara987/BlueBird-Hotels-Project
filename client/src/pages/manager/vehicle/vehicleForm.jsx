import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { CarFront, CheckCircle2, Save, X } from "lucide-react";

const Card = ({ children, className = "" }) => (
	<div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>
		{children}
	</div>
);

const SectionTitle = ({ title, subtitle, icon: Icon }) => (
	<div className="flex items-start gap-3 pb-4 border-b border-slate-100 mb-5">
		<div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
			{Icon && <Icon className="w-5 h-5 text-blue-600" />}
		</div>
		<div>
			<h3 className="text-lg font-bold text-slate-800">{title}</h3>
			{subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
		</div>
	</div>
);

const FieldLabel = ({ text, required, error }) => (
	<div className="mb-1.5">
		<label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
			{text} {required && <span className="text-red-500">*</span>}
		</label>
		{error && <p className="text-red-500 text-xs mt-1">{error}</p>}
	</div>
);

const baseInput =
	"w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-400 focus:border-blue-500";

const inputClassName = (hasError) =>
	`${baseInput} border ${hasError ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 hover:bg-white"}`;

const defaultVehicle = {
	plateNumber: "",
	brand: "",
	vehicleType: "",
	model: "",
	year: "",
	capacity: "",
	fuelType: "",
	transmission: "",
	color: "",
	pricePerDay: "",
	status: "available",
	description: "",
	imageUrl: "",
	features: "",
};

export default function VehicleForm({ vehicle, onCancel, onSaved }) {
	const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
	const isEditMode = Boolean(vehicle?.id);

	const initialValues = useMemo(() => {
		if (!vehicle) {
			return defaultVehicle;
		}

		return {
			plateNumber: vehicle.plateNumber || "",
			brand: vehicle.brand || "",
			vehicleType: vehicle.vehicleType || "",
			model: vehicle.model || "",
			year: vehicle.year ? String(vehicle.year) : "",
			capacity: vehicle.capacity ? String(vehicle.capacity) : "",
			fuelType: vehicle.fuelType || "",
			transmission: vehicle.transmission || "",
			color: vehicle.color || "",
			pricePerDay: vehicle.pricePerDay ? String(vehicle.pricePerDay) : "",
			status: vehicle.status || "available",
			description: vehicle.description || "",
			imageUrl: vehicle.imageUrl || "",
			features: Array.isArray(vehicle.features) ? vehicle.features.join(", ") : "",
		};
	}, [vehicle]);

	const [form, setForm] = useState(initialValues);
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setForm(initialValues);
		setErrors({});
	}, [initialValues]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const validate = () => {
		const nextErrors = {};

		if (!form.plateNumber.trim()) nextErrors.plateNumber = "Plate number is required.";
		if (!form.vehicleType.trim()) nextErrors.vehicleType = "Vehicle type is required.";
		if (!form.model.trim()) nextErrors.model = "Model is required.";
		if (!String(form.capacity).trim()) nextErrors.capacity = "Capacity is required.";
		if (!String(form.pricePerDay).trim()) nextErrors.pricePerDay = "Price per day is required.";

		if (form.year && Number.isNaN(Number(form.year))) {
			nextErrors.year = "Year must be a number.";
		}

		if (form.capacity && Number.isNaN(Number(form.capacity))) {
			nextErrors.capacity = "Capacity must be a number.";
		}

		if (form.pricePerDay && Number.isNaN(Number(form.pricePerDay))) {
			nextErrors.pricePerDay = "Price per day must be a number.";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!validate()) {
			return;
		}

		const payload = {
			plateNumber: form.plateNumber.trim(),
			brand: form.brand.trim() || null,
			vehicleType: form.vehicleType.trim(),
			model: form.model.trim(),
			year: form.year ? Number(form.year) : null,
			capacity: Number(form.capacity),
			fuelType: form.fuelType || null,
			transmission: form.transmission || null,
			color: form.color.trim() || null,
			pricePerDay: Number(form.pricePerDay),
			status: form.status,
			description: form.description.trim() || null,
			imageUrl: form.imageUrl.trim() || null,
			features: form.features
				.split(",")
				.map((feature) => feature.trim())
				.filter(Boolean),
		};

		try {
			setIsSubmitting(true);
			const token = localStorage.getItem("managerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken");
			const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
			const request = isEditMode
				? axios.put(`${backendBaseUrl}/vehicles/${vehicle.id}`, payload, config)
				: axios.post(`${backendBaseUrl}/vehicles`, payload, config);

			const response = await request;
			const savedVehicle = response.data?.data;
			toast.success(isEditMode ? "Vehicle updated successfully." : "Vehicle added successfully.");
			setErrors({});
			if (onSaved) {
				onSaved(savedVehicle);
			}
			if (onCancel) {
				onCancel();
			}
		} catch (error) {
			const message = error.response?.data?.message || error.message || "Failed to save vehicle.";
			toast.error(message);
			setErrors((prev) => ({ ...prev, form: message }));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card className="w-full max-w-5xl mx-auto">
			<div className="flex items-start justify-between gap-4 flex-wrap mb-6">
				<div>
					<h2 className="text-3xl font-black tracking-tight text-slate-800">
						{isEditMode ? "Edit Vehicle" : "Add New Vehicle"}
					</h2>
					<p className="text-slate-500 mt-1">
						{isEditMode
							? "Update the vehicle details shown in the manager inventory."
							: "Create a new vehicle record and make it available in the fleet."}
					</p>
				</div>

				<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold">
					<CarFront className="w-4 h-4" />
					Manager Panel
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{errors.form && (
					<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{errors.form}
					</div>
				)}

				<SectionTitle
					title="Vehicle Details"
					subtitle="Core information required to create a vehicle."
					icon={CarFront}
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div>
						<FieldLabel text="Plate Number" required error={errors.plateNumber} />
						<input
							type="text"
							name="plateNumber"
							value={form.plateNumber}
							onChange={handleChange}
							className={inputClassName(!!errors.plateNumber)}
							placeholder="ABC-1234"
						/>
					</div>

					<div>
						<FieldLabel text="Brand" error={errors.brand} />
						<input
							type="text"
							name="brand"
							value={form.brand}
							onChange={handleChange}
							className={inputClassName(!!errors.brand)}
							placeholder="Toyota"
						/>
					</div>

					<div>
						<FieldLabel text="Vehicle Type" required error={errors.vehicleType} />
						<input
							type="text"
							name="vehicleType"
							value={form.vehicleType}
							onChange={handleChange}
							className={inputClassName(!!errors.vehicleType)}
							placeholder="SUV, Van, Car, Bus"
						/>
					</div>

					<div>
						<FieldLabel text="Model" required error={errors.model} />
						<input
							type="text"
							name="model"
							value={form.model}
							onChange={handleChange}
							className={inputClassName(!!errors.model)}
							placeholder="Corolla, Hiace, etc."
						/>
					</div>

					<div>
						<FieldLabel text="Year" error={errors.year} />
						<input
							type="number"
							name="year"
							value={form.year}
							onChange={handleChange}
							className={inputClassName(!!errors.year)}
							placeholder="2024"
						/>
					</div>

					<div>
						<FieldLabel text="Capacity" required error={errors.capacity} />
						<input
							type="number"
							name="capacity"
							value={form.capacity}
							onChange={handleChange}
							className={inputClassName(!!errors.capacity)}
							placeholder="4"
						/>
					</div>

					<div>
						<FieldLabel text="Fuel Type" error={errors.fuelType} />
						<select name="fuelType" value={form.fuelType} onChange={handleChange} className={inputClassName(!!errors.fuelType)}>
							<option value="">Select fuel type</option>
							<option value="petrol">Petrol</option>
							<option value="diesel">Diesel</option>
							<option value="electric">Electric</option>
							<option value="hybrid">Hybrid</option>
						</select>
					</div>

					<div>
						<FieldLabel text="Transmission" error={errors.transmission} />
						<select name="transmission" value={form.transmission} onChange={handleChange} className={inputClassName(!!errors.transmission)}>
							<option value="">Select transmission</option>
							<option value="automatic">Automatic</option>
							<option value="manual">Manual</option>
						</select>
					</div>

					<div>
						<FieldLabel text="Color" error={errors.color} />
						<input
							type="text"
							name="color"
							value={form.color}
							onChange={handleChange}
							className={inputClassName(!!errors.color)}
							placeholder="White"
						/>
					</div>

					<div>
						<FieldLabel text="Price Per Day" required error={errors.pricePerDay} />
						<input
							type="number"
							name="pricePerDay"
							value={form.pricePerDay}
							onChange={handleChange}
							className={inputClassName(!!errors.pricePerDay)}
							placeholder="120.00"
							step="0.01"
						/>
					</div>

					<div>
						<FieldLabel text="Status" error={errors.status} />
						<select name="status" value={form.status} onChange={handleChange} className={inputClassName(!!errors.status)}>
							<option value="available">Available</option>
							<option value="unavailable">Unavailable</option>
							<option value="maintenance">Maintenance</option>
							<option value="retired">Retired</option>
						</select>
					</div>
				</div>

				<SectionTitle
					title="Content and Media"
					subtitle="Optional details that help staff identify the vehicle faster."
					icon={CheckCircle2}
				/>

				<div className="grid grid-cols-1 gap-5">
					<div>
						<FieldLabel text="Description" error={errors.description} />
						<textarea
							name="description"
							value={form.description}
							onChange={handleChange}
							className={`${baseInput} min-h-32 border border-slate-200 bg-slate-50 hover:bg-white resize-y`}
							placeholder="Brief description of the vehicle, features, or use case."
						/>
					</div>

					<div>
						<FieldLabel text="Image URL" error={errors.imageUrl} />
						<input
							type="text"
							name="imageUrl"
							value={form.imageUrl}
							onChange={handleChange}
							className={inputClassName(!!errors.imageUrl)}
							placeholder="https://..."
						/>
					</div>

					<div>
						<FieldLabel text="Features" error={errors.features} />
						<input
							type="text"
							name="features"
							value={form.features}
							onChange={handleChange}
							className={inputClassName(!!errors.features)}
							placeholder="AC, GPS, WiFi"
						/>
					</div>
				</div>

				<div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
					<button
						type="button"
						onClick={onCancel}
						className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
						disabled={isSubmitting}
					>
						<X className="w-4 h-4" />
						Cancel
					</button>

					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
					>
						<Save className="w-4 h-4" />
						{isSubmitting ? "Saving..." : isEditMode ? "Update Vehicle" : "Add Vehicle"}
					</button>
				</div>
			</form>
		</Card>
	);
}
