import { useState, useRef } from "react";

function PackageForm({ closeOpenModal }) {
    const [pname, setPname] = useState("");
    const [pprice, setPprice] = useState("");
    const [pimage, setPimage] = useState(null);
    const [maxAdults, setMaxAdults] = useState(2);
    const [maxKids, setMaxKids] = useState(0);
    const fileInputRef = useRef(null);

    const handleAddPackage = () => {
        if (!pname || !pprice) {
            return alert("Please enter a name and price for the package.");
        }

        const newPackage = {
            pname,
            pprice: Number(pprice),
            pimage,
            maxAdults,
            maxKids
        };

        console.log("Saving package:", newPackage);
        // TODO: replace with API call

        // Reset form
        setPname("");
        setPprice("");
        setPimage(null);
        setMaxAdults(2);
        setMaxKids(0);
        closeOpenModal();
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-transparent bg-opacity-40 z-40"
                onClick={closeOpenModal}
            />
            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto border">
                    <button
                        onClick={closeOpenModal}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                    >
                        ✕
                    </button>
                    <h2 className="text-2xl font-bold text-center mb-6">Add New Package</h2>

                    {/* Package Name */}
                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1">Package Name</label>
                        <input
                            type="text"
                            value={pname}
                            onChange={(e) => setPname(e.target.value)}
                            placeholder="Enter package name"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Price */}
                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1">Price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="number"
                                value={pprice}
                                onChange={(e) => setPprice(e.target.value)}
                                placeholder="Enter price"
                                className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>

                    {/* Image File */}
                    <div className="mb-5">
                        <label className="block text-sm font-semibold mb-1">Package Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={(e) => setPimage(e.target.files[0])}
                            className="hidden"
                        />
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                            >
                                Choose File
                            </button>
                            <span className="text-sm text-gray-600">
                                {pimage ? pimage.name : "No file chosen"}
                            </span>
                        </div>
                    </div>

                    {/* Max Adults/Kids */}
                    <div className="flex gap-4 mb-5">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold mb-1">Max Adults</label>
                            <input
                                type="number"
                                value={maxAdults}
                                min={0}
                                onChange={(e) => setMaxAdults(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold mb-1">Max Kids</label>
                            <input
                                type="number"
                                value={maxKids}
                                min={0}
                                onChange={(e) => setMaxKids(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between gap-4">
                        <button
                            onClick={closeOpenModal}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddPackage}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                        >
                            Add Package
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PackageForm;