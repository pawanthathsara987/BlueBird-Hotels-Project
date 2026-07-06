import PropTypes from "prop-types";

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message, isLoading = false }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity duration-300 animate-fadeIn"
                onClick={onClose}
            />
            {/* Modal container */}
            <div className="fixed inset-0 flex items-center justify-center z-[101] px-4">
                <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full border border-slate-100 animate-scaleUp">
                    {/* Header / Title */}
                    <p className="text-lg font-bold text-slate-800 mb-3">
                        {title}
                    </p>
                    
                    {/* Body message */}
                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                        {message}
                    </p>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm shadow-sm shadow-rose-600/10"
                        >
                            {isLoading ? (
                                <>
                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

ConfirmDeleteModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.node.isRequired,
    message: PropTypes.node.isRequired,
    isLoading: PropTypes.bool,
};

export default ConfirmDeleteModal;
