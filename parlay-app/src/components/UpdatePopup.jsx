import { useEffect } from "react";

const UpdatePopup = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-auto p-6 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                >
                    ✕
        </button>

                {/* Header */}

                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Update Parlay
                    </h2>


                {/* Content */}
                <div>{children}</div>
            </div>
        </div>
    );
};

export default UpdatePopup;
