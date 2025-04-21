import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UpdatePopup from '../components/UpdatePopup';

const HomePage = () => {
    const [parlays, setParlays] = useState([]);
    const [formData, setFormData] = useState({
        date: "",
        money_spent: "",
        num_legs: "",
        win: "true",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
    const [parlayToUpdate, setParlayToUpdate] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        fetchParlays();
    }, []);

    const fetchParlays = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/parlays', {
                method: "GET",
                headers: { Authorization: token },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch parlays");
            }

            const data = await response.json();
            setParlays(data);
        } catch (error) {
            console.error("Error fetching parlays:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:5001/api/parlays", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({
                    ...formData,
                    win: formData.win === "true",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add parlay");
            }

            setFormData({
                date: "",
                money_spent: "",
                num_legs: "",
                win: "true",
            });
            setIsModalOpen(false);
            fetchParlays();
        } catch (error) {
            console.error("Error adding parlay:", error);
            alert("Error adding parlay");
        }
    };

    const handleRemove = async (id) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:5001/api/parlays/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to remove parlay");
            }

            setParlays(parlays.filter(parlay => parlay.id !== id));
        } catch (error) {
            console.error("Error removing parlay:", error);
            alert("Error removing parlay");
        }
    };

    const handleEditClick = (parlay) => {
        setParlayToUpdate({
            ...parlay,
            win: parlay.win ? "true" : "false"
        });
        setIsUpdatePopupOpen(true);
    };

    const handleUpdate = async (updatedData) => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:5001/api/parlays/${updatedData.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({
                    ...updatedData,
                    win: updatedData.win === "true",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update parlay");
            }

            setIsUpdatePopupOpen(false);
            fetchParlays();
        } catch (error) {
            console.error("Error updating parlay:", error);
            alert("Error updating parlay");
        }
    };

    const handleUpdateInputChange = (e) => {
        setParlayToUpdate({
            ...parlayToUpdate,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="home-page p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Parlay Tracker</h1>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
            <button
                onClick={() => setIsModalOpen(true)}
                className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Add Parlay
            </button>

            {/* Add Parlay Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-auto p-6 relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Add Parlay</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-1">Money Spent</label>
                                <input
                                    type="number"
                                    name="money_spent"
                                    value={formData.money_spent}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Amount"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-1">Number of Legs</label>
                                <input
                                    type="number"
                                    name="num_legs"
                                    value={formData.num_legs}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Legs"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-1">Result</label>
                                <select
                                    name="win"
                                    value={formData.win}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="true">Win</option>
                                    <option value="false">Loss</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Add Parlay
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Parlays List */}
            <h3 className="text-xl font-semibold mb-4">Your Parlays</h3>
            <div className="grid gap-4">
                {parlays.map((parlay) => (
                    <div key={parlay.id} className="p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium">Date: {parlay.date}</p>
                                <p>Spent: ${parlay.money_spent}</p>
                                <p>Legs: {parlay.num_legs}</p>
                                <p className={parlay.win ? "text-green-500" : "text-red-500"}>
                                    {parlay.win ? "Win" : "Loss"}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditClick(parlay)}
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleRemove(parlay.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>



            <UpdatePopup
                isOpen={isUpdatePopupOpen}
                onClose={() => setIsUpdatePopupOpen(false)}
                title="Update Parlay"
            >
                {parlayToUpdate && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdate(parlayToUpdate);
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={parlayToUpdate.date}
                                onChange={handleUpdateInputChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">Money Spent</label>
                            <input
                                type="number"
                                name="money_spent"
                                value={parlayToUpdate.money_spent}
                                onChange={handleUpdateInputChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">Number of Legs</label>
                            <input
                                type="number"
                                name="num_legs"
                                value={parlayToUpdate.num_legs}
                                onChange={handleUpdateInputChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">Result</label>
                            <select
                                name="win"
                                value={parlayToUpdate.win}
                                onChange={handleUpdateInputChange}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="true">Win</option>
                                <option value="false">Loss</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Update Parlay
                        </button>
                    </form>
                )}
            </UpdatePopup>
        </div>
    );
};

export default HomePage;