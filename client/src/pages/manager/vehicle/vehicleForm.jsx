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
	vehicleTypeId: "",
	brand: "",
	model: "",
	year: "",
	capacity: "",
	fuelType: "",
	transmission: "",
	color: "",
	pricePerDay: "",
	status: "available",
	insuranceNo: "",
	insuranceExpiry: "",
	revenueLicenseExpiry: "",
	description: "",
	image: null,
	imagePreview: null,
	features: "",
};

const ALLOWED_FUEL_TYPES = ["petrol", "diesel", "electric", "hybrid"];
const ALLOWED_TRANSMISSIONS = ["automatic", "manual"];
const ALLOWED_STATUSES = ["available", "booked", "maintenance", "retired"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const normalizeFeaturesForInput = (features) => {
	if (Array.isArray(features)) {
		return features.map((feature) => String(feature).trim()).filter(Boolean).join(", ");
	}

	if (typeof features === "string") {
		try {
			const parsed = JSON.parse(features);
			if (Array.isArray(parsed)) {
				return parsed.map((feature) => String(feature).trim()).filter(Boolean).join(", ");
			}
		} catch {
			return features;
		}
	}

	return "";
};

export default function VehicleForm({ vehicle, onCancel, onSaved }) {
	const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");
	const isEditMode = Boolean(vehicle?.id);

	// Load vehicle types from API for the dropdown
	const [vehicleTypes, setVehicleTypes] = useState([]);
	useEffect(() => {
		axios.get(`${backendBaseUrl}/vehicle-types`)
			.then(res => setVehicleTypes(Array.isArray(res.data?.data) ? res.data.data : []))
			.catch(() => {});
	}, [backendBaseUrl]);

	const initialValues = useMemo(() => {
		if (!vehicle) {
			return defaultVehicle;
		}

		return {
			plateNumber: vehicle.plateNumber || "",
			vehicleTypeId: vehicle.vehicleTypeId ? String(vehicle.vehicleTypeId) : "",
			brand: vehicle.brand || "",
			model: vehicle.model || "",
			year: vehicle.year ? String(vehicle.year) : "",
			capacity: vehicle.capacity ? String(vehicle.capacity) : "",
			fuelType: vehicle.fuelType || "",
			transmission: vehicle.transmission || "",
			color: vehicle.color || "",
			pricePerDay: vehicle.pricePerDay ? String(vehicle.pricePerDay) : "",
			status: vehicle.status || "available",
			insuranceNo: vehicle.insuranceNo || "",
			insuranceExpiry: vehicle.insuranceExpiry || "",
			revenueLicenseExpiry: vehicle.revenueLicenseExpiry || "",
			description: vehicle.description || "",
			image: null,
			imagePreview: vehicle.image || null,
			features: normalizeFeaturesForInput(vehicle.features),
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
		const { name, value, type, files } = event.target;
		
		if (type === "file") {
			const file = files?.[0] || null;
			const preview = file ? URL.createObjectURL(file) : null;
			setForm((prev) => ({ ...prev, image: file, imagePreview: preview }));
		} else {
			setForm((prev) => ({ ...prev, [name]: value }));
		}
		setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const validate = () => {
		const nextErrors = {};
		const normalizedFeatures = form.features
			.split(",")
			.map((feature) => feature.trim())
			.filter(Boolean);

		if (!form.plateNumber.trim()) nextErrors.plateNumber = "Plate number is required.";
		if (!form.brand.trim()) nextErrors.brand = "Brand is required.";
		if (!form.vehicleTypeId) nextErrors.vehicleTypeId = "Vehicle type is required.";
		if (!form.model.trim()) nextErrors.model = "Model is required.";
		if (!String(form.year).trim()) nextErrors.year = "Year is required.";
		if (!String(form.capacity).trim()) nextErrors.capacity = "Capacity is required.";
		if (!String(form.pricePerDay).trim()) nextErrors.pricePerDay = "Price per day is required.";
		if (!form.fuelType) nextErrors.fuelType = "Fuel type is required.";
		if (!form.transmission) nextErrors.transmission = "Transmission is required.";
		if (!form.color.trim()) nextErrors.color = "Color is required.";
		if (!form.status) nextErrors.status = "Status is required.";
		if (!form.insuranceNo.trim()) nextErrors.insuranceNo = "Insurance number is required.";
		if (!String(form.insuranceExpiry).trim()) nextErrors.insuranceExpiry = "Insurance expiry is required.";
		if (!String(form.revenueLicenseExpiry).trim()) nextErrors.revenueLicenseExpiry = "Revenue license expiry is required.";
		if (!form.description.trim()) nextErrors.description = "Description is required.";
		if (!normalizedFeatures.length) nextErrors.features = "Add at least one feature.";
		if (!isEditMode && !form.image) nextErrors.image = "Vehicle image is required.";

		if (form.image && !form.image.type.startsWith("image/")) {
			nextErrors.image = "Only image files are allowed.";
		}

		if (form.image && form.image.size > MAX_IMAGE_SIZE) {
			nextErrors.image = "Image must be 5MB or smaller.";
		}

		if (form.year && Number.isNaN(Number(form.year))) {
			nextErrors.year = "Year must be a number.";
		} else if (form.year && Number(form.year) < 1900) {
			nextErrors.year = "Year must be 1900 or later.";
		}

		if (form.capacity && Number.isNaN(Number(form.capacity))) {
			nextErrors.capacity = "Capacity must be a number.";
		} else if (form.capacity && Number(form.capacity) <= 0) {
			nextErrors.capacity = "Capacity must be greater than zero.";
		}

		if (form.pricePerDay && Number.isNaN(Number(form.pricePerDay))) {
			nextErrors.pricePerDay = "Price per day must be a number.";
		} else if (form.pricePerDay && Number(form.pricePerDay) <= 0) {
			nextErrors.pricePerDay = "Price per day must be greater than zero.";
		}

		if (form.fuelType && !ALLOWED_FUEL_TYPES.includes(form.fuelType)) {
			nextErrors.fuelType = "Select a valid fuel type.";
		}

		if (form.transmission && !ALLOWED_TRANSMISSIONS.includes(form.transmission)) {
			nextErrors.transmission = "Select a valid transmission.";
		}

		if (form.status && !ALLOWED_STATUSES.includes(form.status)) {
			nextErrors.status = "Select a valid status.";
		}

		if (form.brand && form.brand.trim().length > 100) {
			nextErrors.brand = "Brand cannot exceed 100 characters.";
		}

		if (form.color && form.color.trim().length > 50) {
			nextErrors.color = "Color cannot exceed 50 characters.";
		}

		if (form.description && form.description.trim().length > 2000) {
			nextErrors.description = "Description is too long.";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!validate()) {
			return;
		}

		const formData = new FormData();
		formData.append("plateNumber", form.plateNumber.trim());
		formData.append("brand", form.brand.trim() || null);
		formData.append("vehicleTypeId", Number(form.vehicleTypeId));
		formData.append("model", form.model.trim());
		formData.append("year", form.year ? Number(form.year) : null);
		formData.append("capacity", Number(form.capacity));
		formData.append("fuelType", form.fuelType || null);
		formData.append("transmission", form.transmission || null);
		formData.append("color", form.color.trim() || null);
		formData.append("pricePerDay", Number(form.pricePerDay));
		formData.append("status", form.status);
		formData.append("insuranceNo", form.insuranceNo.trim());
		formData.append("insuranceExpiry", form.insuranceExpiry);
		formData.append("revenueLicenseExpiry", form.revenueLicenseExpiry);
		formData.append("description", form.description.trim() || null);
		formData.append(
			"features",
			JSON.stringify(
				form.features
					.split(",")
					.map((feature) => feature.trim())
					.filter(Boolean)
			)
		);

		if (form.image) {
			formData.append("image", form.image);
		}

		try {
			setIsSubmitting(true);
			const token = localStorage.getItem("managerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken");
			const config = token
				? { headers: { Authorization: `Bearer ${token}` } }
				: {};

			const request = isEditMode
				? axios.put(`${backendBaseUrl}/vehicles/${vehicle.id}`, formData, config)
				: axios.post(`${backendBaseUrl}/vehicles`, formData, config);

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
			const apiErrors = error.response?.data?.errors;
			toast.error(message);
			setErrors((prev) => ({
				...prev,
				...(apiErrors && typeof apiErrors === "object" ? apiErrors : {}),
				form: message,
			}));
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
						<FieldLabel text="Vehicle Type" required error={errors.vehicleTypeId} />
						<select name="vehicleTypeId" value={form.vehicleTypeId} onChange={handleChange} className={inputClassName(!!errors.vehicleTypeId)}>
							<option value="">Select vehicle type</option>
							{vehicleTypes.map((vt) => (
								<option key={vt.id} value={vt.id}>{vt.name}</option>
							))}
						</select>
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
							<option value="booked">Booked</option>
							<option value="maintenance">Maintenance</option>
							<option value="retired">Retired</option>
						</select>
					</div>

					<div>
						<FieldLabel text="Insurance No" required error={errors.insuranceNo} />
						<input
							type="text"
							name="insuranceNo"
							value={form.insuranceNo}
							onChange={handleChange}
							className={inputClassName(!!errors.insuranceNo)}
							placeholder="INS-123456"
						/>
					</div>

					<div>
						<FieldLabel text="Insurance Expiry" required error={errors.insuranceExpiry} />
						<input
							type="date"
							name="insuranceExpiry"
							value={form.insuranceExpiry}
							onChange={handleChange}
							className={inputClassName(!!errors.insuranceExpiry)}
						/>
					</div>

					<div>
						<FieldLabel text="Revenue License Expiry" required error={errors.revenueLicenseExpiry} />
						<input
							type="date"
							name="revenueLicenseExpiry"
							value={form.revenueLicenseExpiry}
							onChange={handleChange}
							className={inputClassName(!!errors.revenueLicenseExpiry)}
						/>
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
						<FieldLabel text="Vehicle Image" error={errors.image} />
						<div className="flex gap-4 items-start">
							<input
								type="file"
								name="image"
								onChange={handleChange}
								accept="image/*"
								className={`${baseInput} border border-slate-200 bg-slate-50 hover:bg-white file:mr-3 file:py-1.5 file:px-3 file:border-0 file:rounded-lg file:bg-blue-50 file:text-blue-600 file:font-semibold file:cursor-pointer`}
							/>
						</div>
						{form.imagePreview && (
							<div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
								<img
									src={form.imagePreview}
									alt="Preview"
									className="w-full h-40 object-cover"
								/>
							</div>
						)}
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
