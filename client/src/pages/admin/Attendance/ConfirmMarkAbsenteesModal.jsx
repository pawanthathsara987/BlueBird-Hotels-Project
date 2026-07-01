import React from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

export default function ConfirmMarkAbsenteesModal({ isOpen, onClose, onConfirm, isMarking }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100/50 overflow-hidden transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-rose-500 to-red-600 px-6 py-5 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-2xl">
                            <FaExclamationTriangle className="text-xl text-yellow-100 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Confirm Mark Absentees</h3>
                            <p className="text-xs text-rose-100/80 mt-0.5">Please verify before proceeding</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isMarking}
                        className="text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-6">
                    <p className="text-slate-700 text-base font-semibold leading-relaxed">
                        Are you sure you want to mark today's absentees?
                    </p>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                        This action will find all employees who have not clocked in today and mark their attendance status as <span className="font-bold text-rose-600">Absent</span>.
                    </p>
                    <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-2.5">
                        <FaExclamationTriangle className="text-amber-500 mt-0.5 text-xs flex-shrink-0" />
                        <p className="text-xs text-amber-700 font-medium">
                            Only run this at the end of the day or after the check-in window has closed.
                        </p>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="px-6 pb-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isMarking}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all duration-200 active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isMarking}
                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md hover:shadow-lg active:scale-98 transition-all duration-200 disabled:bg-rose-400 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isMarking ? "Marking..." : "Confirm & Mark"}
                    </button>
                </div>
            </div>
        </div>
    );
}
