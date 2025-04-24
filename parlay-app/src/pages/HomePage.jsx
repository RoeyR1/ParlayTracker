import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UpdatePopup from '../components/UpdatePopup';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';


const HomePage = () => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2'];
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

    const totalWins = parlays.filter(p => p.win).length;
    const winRate = ((totalWins / parlays.length) * 100).toFixed(1);

    const avgLegsPerWin = (
        parlays.filter(p => p.win).reduce((acc, p) => acc + p.num_legs, 0) / totalWins || 0
    ).toFixed(1);

    const totalSpent = parlays.reduce((acc, p) => acc + Number(p.money_spent), 0).toFixed(2);


    const getMultiplier = (legs) => {
        switch (Number(legs)) {
            case 2: return 3;
            case 3: return 5;
            case 4: return 10;
            case 5: return 19.5;
            case 6: return 36.5;
            default: return 1; // No multiplier for invalid leg count
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return date.toLocaleDateString('en-US', options);
    }

    const legCounts = parlays.reduce((acc, { num_legs }) => {
        acc[num_legs] = (acc[num_legs] || 0) + 1;
        return acc;
    }, {});

    const legsPieData = Object.entries(legCounts).map(([legs, count]) => ({
        name: `${legs} Legs`,
        value: count
    }));

    const winLossCounts = parlays.reduce(
        (acc, { win }) => {
            win ? acc.wins++ : acc.losses++;
            return acc;
        },
        { wins: 0, losses: 0 }
    );

    const winLossPieData = [
        { name: 'Wins', value: winLossCounts.wins },
        { name: 'Losses', value: winLossCounts.losses }
    ];



    const totalPL = parlays.reduce((acc, p) => {
        const amount = Number(p.money_spent);
        const multiplier = getMultiplier(p.num_legs);

        if (p.win) {
            return acc + (amount * multiplier - amount); // profit = winnings - stake
        } else {
            return acc - amount; // total loss
        }
    }, 0).toFixed(2);

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

    function ParlayLegsPieChart({ data }) {
        return (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow w-full max-w-md mx-auto">
                <h2 className="text-xl font-semibold text-center mb-4 text-gray-700 dark:text-gray-200">
                    Legs Breakdown
        </h2>
                <PieChart width={300} height={300}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>
        );
    }


    function WinLossPieChart({ data }) {
        const COLORS = ['#00C49F', '#FF6B6B'];

        return (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow w-full max-w-md mx-auto">
                <h2 className="text-xl font-semibold text-center mb-4 text-gray-700 dark:text-gray-200">
                    W/L
            </h2>
                <PieChart width={300} height={300}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>
        );
    }

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
                <div className="fixed inset-0 flex items-center justify-center">
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

            <div className="flex">
                {/* Parlays List (Left Side) */}
                <div className="w-full max-w-[50%]">
                    <h3 className="text-xl font-semibold mb-4">Your Parlays</h3>
                    <div className="grid gap-4">
                        {parlays.map((parlay) => (
                            <div
                                key={parlay.id}
                                className="p-4 border rounded-lg dark:border-gray-700 flex flex-col justify-between"
                            >
                                {/* Top Info Section */}
                                <div>
                                    <p className="font-medium">Date: {formatDate(parlay.date)}</p>
                                    <p>Spent: ${parlay.money_spent}</p>
                                    <p>
                                        <span className="font-medium">Legs: {parlay.num_legs}  </span>
                                        <span className="text-sm text-gray-500">
                                            Multiplier: {getMultiplier(parlay.num_legs)}x
                                        </span>
                                    </p>
                                    <p className={parlay.win ? "text-green-500" : "text-red-500"}>
                                        {parlay.win ? "Win  " : "Loss   "}



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
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full md:w-1/2">
                    <h3 className="text-xl font-semibold mb-4">Parlay Stats</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <p className="font-medium text-gray-700 dark:text-gray-200">Win Rate</p>
                            <p className="text-2xl">{winRate}%</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <p className="font-medium text-gray-700 dark:text-gray-200">Avg Legs / Win
                            </p>
                            <p className="text-2xl">{avgLegsPerWin}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="flex justify-start items-start">
                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-200">Total Money Spent</p>
                                    <p className="text-2xl">${totalSpent}   </p>
                                    <p className="font-medium text-gray-700 dark:text-gray-200">Total Profit/Loss</p>
                                    <p className="text-2xl">${totalPL}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/2">
                    <WinLossPieChart data={winLossPieData} />
                    <ParlayLegsPieChart data={legsPieData} />
                </div>

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