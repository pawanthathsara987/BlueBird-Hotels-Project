import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const normalizeImageList = (payload) => {
	const list = Array.isArray(payload) ? payload : [];

	return list
		.map((item) => ({
			id: item?.id,
			url: item?.imageUrl,
		}))
		.filter((item) => item.id && item.url);
};

function PackageImageForm() {
	const navigate = useNavigate();

	const [packages, setPackages] = useState([]);
	const [selectedPackageId, setSelectedPackageId] = useState("");
	const [imageFiles, setImageFiles] = useState([]);
	const [imagePreviews, setImagePreviews] = useState([]);
	const [savedImages, setSavedImages] = useState([]);
	const [isLoadingSavedImages, setIsLoadingSavedImages] = useState(false);
	const [isDeletingImageId, setIsDeletingImageId] = useState(null);
	const [isUpdatingImageId, setIsUpdatingImageId] = useState(null);
	const [isLoadingPackages, setIsLoadingPackages] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const fileInputRef = useRef(null);
	const replaceInputRef = useRef(null);
	const replaceTargetImageRef = useRef(null);

	const loadSavedImages = async (packageId) => {
		if (!packageId) {
			setSavedImages([]);
			return;
		}

		try {
			setIsLoadingSavedImages(true);
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/admin/packageimage/${packageId}`,
			);
			setSavedImages(normalizeImageList(response?.data?.data));
		} catch (error) {
			setSavedImages([]);
			toast.error(error?.response?.data?.message || "Failed to retrieve package images");
		} finally {
			setIsLoadingSavedImages(false);
		}
	};

	useEffect(() => {
		const getPackages = async () => {
			try {
				setIsLoadingPackages(true);
				const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/packages`);
				const packageList = response?.data?.data || [];
				setPackages(Array.isArray(packageList) ? packageList : []);
			} catch (error) {
				toast.error(error?.response?.data?.message || "Failed to load packages");
				setPackages([]);
			} finally {
				setIsLoadingPackages(false);
			}
		};

		getPackages();
	}, []);

	useEffect(() => {
		if (!selectedPackageId) {
			setSavedImages([]);
			return;
		}

		loadSavedImages(selectedPackageId);
	}, [selectedPackageId]);

	useEffect(() => {
		const previewUrls = imageFiles.map((file) => URL.createObjectURL(file));
		setImagePreviews(previewUrls);

		return () => {
			previewUrls.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [imageFiles]);

	const onSelectImages = (event) => {
		const selectedFiles = Array.from(event.target.files || []);
		if (selectedFiles.length === 0) return;

		setImageFiles((prev) => {
			const next = [...prev];

			selectedFiles.forEach((file) => {
				const isDuplicate = next.some(
					(existing) =>
						existing.name === file.name &&
						existing.size === file.size &&
						existing.lastModified === file.lastModified
				);

				if (!isDuplicate) {
					next.push(file);
				}
			});

			return next;
		});

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const removeImage = (indexToRemove) => {
		setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
	};

	const clearForm = () => {
		setImageFiles([]);
		setImagePreviews([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const savePackageImages = async () => {
		if (!selectedPackageId || imageFiles.length === 0) {
			toast.error("Please select a package and add image files");
			return;
		}

		try {
			setIsSubmitting(true);

			const formData = new FormData();
			formData.append("packageId", selectedPackageId);
			formData.append("package_id", selectedPackageId);

			imageFiles.forEach((file) => {
				formData.append("pimage", file);
			});

			const response = await axios.post(
				`${import.meta.env.VITE_BACKEND_URL}/admin/packageimage`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				},
			);

			toast.success(response?.data?.message || "Package images added successfully");
			clearForm();
			loadSavedImages(selectedPackageId);
		} catch (error) {
			toast.error(error?.response?.data?.message || "Failed to add package images");
		} finally {
			setIsSubmitting(false);
		}
	};

	const onClickReplaceImage = (imageId) => {
		replaceTargetImageRef.current = imageId;
		replaceInputRef.current?.click();
	};

	const onSelectReplacementImage = async (event) => {
		const file = event.target.files?.[0];
		const targetImageId = replaceTargetImageRef.current;

		if (!file || !targetImageId || !selectedPackageId) return;

		try {
			setIsUpdatingImageId(targetImageId);

			const formData = new FormData();
			formData.append("packageId", selectedPackageId);
			formData.append("package_id", selectedPackageId);
			formData.append("imageId", targetImageId);
			formData.append("id", targetImageId);
			formData.append("pimage", file);

			const response = await axios.put(
				`${import.meta.env.VITE_BACKEND_URL}/admin/packageimage/${targetImageId}`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				},
			);

			toast.success(response?.data?.message || "Image updated successfully");
			loadSavedImages(selectedPackageId);
		} catch (error) {
			toast.error(error?.response?.data?.message || "Failed to update image");
		} finally {
			setIsUpdatingImageId(null);
			replaceTargetImageRef.current = null;
			if (replaceInputRef.current) {
				replaceInputRef.current.value = "";
			}
		}
	};

	const deleteImage = async (imageId) => {
		if (!selectedPackageId || !imageId) return;

		try {
			setIsDeletingImageId(imageId);
			const response = await axios.delete(
				`${import.meta.env.VITE_BACKEND_URL}/admin/packageimage/${imageId}`,
				{
					data: {
						packageId: selectedPackageId,
						package_id: selectedPackageId,
						imageId,
					},
				},
			);

			toast.success(response?.data?.message || "Image deleted successfully");
			loadSavedImages(selectedPackageId);
		} catch (error) {
			toast.error(error?.response?.data?.message || "Failed to delete image");
		} finally {
			setIsDeletingImageId(null);
		}
	};

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<Link
				to="/admin/rooms/roomManagement?tab=packages"
				className="text-gray-600 hover:text-gray-800 mb-4 inline-block"
			>
				← Back
			</Link>

			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-800">Add Package Images</h1>
				<p className="text-gray-500 mt-1">Select a package and upload one or more images.</p>
			</div>

			<div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
				<div className="bg-[#2c4a6b] p-6 flex items-center gap-4">
					<div>
						<h2 className="text-lg font-bold text-white">Package Image Upload</h2>
						<p className="text-gray-300 text-sm">Choose package first, then add image files.</p>
					</div>
				</div>

				<div className="p-5">
					<input
						type="file"
						accept="image/*"
						ref={replaceInputRef}
						onChange={onSelectReplacementImage}
						className="hidden"
					/>

					<div className="mb-5">
						<label className="block text-sm font-semibold mb-1">Select Package</label>
						<select
							value={selectedPackageId}
							onChange={(e) => setSelectedPackageId(e.target.value)}
							disabled={isLoadingPackages || isSubmitting}
							className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
						>
							<option value="">Choose a package</option>
							{packages.map((pkg) => (
								<option key={pkg.id} value={pkg.id}>
									{pkg.pname}
								</option>
							))}
						</select>
					</div>

					{selectedPackageId && (
						<div className="mb-5">
							<div className="flex items-center justify-between mb-2">
								<p className="block text-sm font-semibold">Saved Images</p>
								<button
									type="button"
									onClick={() => loadSavedImages(selectedPackageId)}
									disabled={isLoadingSavedImages || isSubmitting}
									className="text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
								>
									Refresh
								</button>
							</div>

							{isLoadingSavedImages ? (
								<div className="py-4 text-sm text-gray-500">Loading images...</div>
							) : savedImages.length === 0 ? (
								<div className="py-3 px-4 text-sm text-gray-500 bg-gray-50 rounded-md border border-gray-200">
									No saved images for this package.
								</div>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{savedImages.map((imageItem) => (
										<div
											key={String(imageItem.id)}
											className="border border-gray-200 rounded-md p-2"
										>
											<img
												src={imageItem.url}
												alt="Package"
												className="w-full h-28 object-cover rounded"
											/>
											<div className="flex items-center justify-between mt-2 gap-2">
												<button
													type="button"
													onClick={() => onClickReplaceImage(imageItem.id)}
													disabled={isUpdatingImageId === imageItem.id || isSubmitting}
													className="flex-1 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
												>
													{isUpdatingImageId === imageItem.id ? "Updating..." : "Update"}
												</button>
												<button
													type="button"
													onClick={() => deleteImage(imageItem.id)}
													disabled={isDeletingImageId === imageItem.id || isSubmitting}
													className="flex-1 text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
												>
													{isDeletingImageId === imageItem.id ? "Deleting..." : "Delete"}
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					<div className="mb-5">
						<label className="block text-sm font-semibold mb-1">Package Images</label>
						<input
							type="file"
							accept="image/*"
							multiple
							ref={fileInputRef}
							onChange={onSelectImages}
							disabled={!selectedPackageId}
							className="hidden"
						/>

						<div className="flex items-center gap-3">
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								disabled={isSubmitting || !selectedPackageId}
								className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSubmitting ? "Uploading..." : "Choose Images"}
							</button>
							<span className="text-sm text-gray-600">
								{imageFiles.length > 0 ? `${imageFiles.length} image(s) selected` : "No files chosen"}
							</span>
						</div>
					</div>

					{imageFiles.length > 0 && (
						<div className="mb-5">
							<p className="block text-sm font-semibold mb-2">Selected Files</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{imageFiles.map((file, index) => (
									<div
										key={`${file.name}-${file.lastModified}-${index}`}
										className="flex items-center gap-3 border border-gray-200 rounded-md px-3 py-2"
									>
										<img
											src={imagePreviews[index]}
											alt={file.name}
											className="w-14 h-14 rounded object-cover border border-gray-200"
										/>
										<div className="flex-1 min-w-0">
											<p className="text-sm text-gray-700 truncate">{file.name}</p>
										</div>
										<button
											type="button"
											onClick={() => removeImage(index)}
											disabled={isSubmitting}
											className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
										>
											Remove
										</button>
									</div>
								))}
							</div>
						</div>
					)}

					<div className="flex justify-end gap-4 pt-4">
						<Link
							to="/admin/rooms/roomManagement?tab=packages"
							className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
						>
							Cancel
						</Link>

						<button
							onClick={savePackageImages}
							disabled={isSubmitting || isLoadingPackages}
							className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{isSubmitting ? (
								<>
									<span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
									Adding...
								</>
							) : (
								"Add Images"
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default PackageImageForm;