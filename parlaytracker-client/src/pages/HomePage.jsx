import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const HomePage = () => {
    const [parlays, setParlays] = useState([]);
    const [formData, setFormData] = useState({
        date: "",
        money_spent: "",
        num_legs: "",
        win: "true",
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => { //fetch parlays 
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
                    ...formData, //convert formdata to json and send it in body
                    //backend receive thru req.body
                    win: formData.win === "true", //ensure win is boolean
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add parlay");
            }

            setFormData({
                date: "",
                money_spent: "",
                num_legs: "",
                win: formData.win === "true" ? true : false,
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

            //remove parlay from state and update ui
            setParlays(parlays.filter(parlay => parlay.id !== id));
        } catch (error) {
            console.error("Error removing parlay:", error);
            alert("Error removing parlay");
        }
    };



    return (
        <div className="home-page">
            <button onClick={handleLogout}>Logout</button>

            <button onClick={() => setIsModalOpen(true)}>Add Parlay</button>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Add Parlay</h2>

                        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className="p-2 border rounded"
                                required
                            />
                            <input
                                type="number"
                                name="money_spent"
                                value={formData.money_spent}
                                onChange={handleInputChange}
                                placeholder="Money Spent"
                                className="p-2 border rounded"
                                required
                            />
                            <input
                                type="number"
                                name="num_legs"
                                value={formData.num_legs}
                                onChange={handleInputChange}
                                placeholder="Number of Legs"
                                className="p-2 border rounded"
                                required
                            />
                            <select
                                name="win"
                                value={formData.win}
                                onChange={handleInputChange}
                                className="p-2 border rounded"
                            >
                                <option value="true">Win</option>
                                <option value="false">Loss</option>
                            </select>

                            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                                Add Parlay
                            </button>
                        </form>

                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}


            <h3>Your Parlays</h3>
            <ul>
                {parlays.map((parlay) => (
                    <li key={parlay.id}>
                        <span>Date: {parlay.date}</span>
                        <br />
                        <span>Spent: ${parlay.money_spent}</span>
                        <br />
                        <span>Legs: {parlay.num_legs}</span>
                        <br />
                        <span>W/L: {parlay.win ? "Win" : "Loss"}</span>
                        <button onClick={() => handleRemove(parlay.id)}>Remove</button>
                    </li>
                ))}
            </ul>

        </div>
    );
};

export default HomePage;
