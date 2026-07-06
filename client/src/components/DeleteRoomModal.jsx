import { FaTrash } from "react-icons/fa";

export default function DeleteRoomModal({ isOpen, room, onCancel, onConfirm, isDeleting }) {
    if (!isOpen || !room) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="bg-red-500 p-6 flex items-center gap-4">
                    <div className="bg-red-600/60 rounded-full p-3">
                        <FaTrash className="text-white text-xl" />
                    </div>
                    <div>
                        <h2 className="text-white text-2xl font-bold">Delete Room</h2>
                        <p className="text-red-100">This action cannot be undone.</p>
                    </div>
                </div>

                <div className="p-6">
                    <p className="text-slate-700 text-lg font-semibold">
                        Are you sure you want to remove room <span className="font-bold">{room.roomNo || room.roomNumber || room.id}</span>?
                    </p>
                    <p className="text-slate-500 mt-2">
                        Type: {room.RoomPackage?.pname || "N/A"}
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
                        <FaTrash /> {isDeleting ? "Deleting..." : "Delete Room"}
                    </button>
                </div>
            </div>
        </div>
    );
}
