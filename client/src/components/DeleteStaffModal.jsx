import { FaTrash } from "react-icons/fa";

export default function DeleteStaffModal({ isOpen, member, onCancel, onConfirm, isDeleting }) {
    if (!isOpen || !member) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                <div className="bg-red-500 p-6 flex items-center gap-4">
                    <div className="bg-red-600/60 rounded-full p-3">
                        <FaTrash className="text-white text-xl" />
                    </div>
                    <div>
                        <h2 className="text-white text-2xl font-bold">Delete Staff Member</h2>
                        <p className="text-red-100">This action cannot be undone.</p>
                    </div>
                </div>

                <div className="p-6">
                    <p className="text-slate-700 text-xl font-semibold">
                        Are you sure you want to remove <span className="font-bold">{member.name}</span>?
                    </p>
                </div>

                <div className="px-6 pb-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="px-7 py-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-7 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                        <FaTrash /> {isDeleting ? "Deleting..." : "Delete Member"}
                    </button>
                </div>
            </div>
        </div>
    );
}
