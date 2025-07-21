import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Trash2, Edit, TrendingUp, TrendingDown, DollarSign, Target, Calendar, LogOut, Plus, BarChart3 } from 'lucide-react';
import { toast } from "sonner";
import ParlayStats from "../components/ParlayStats";
import ParlayForm from "../components/ParlayForm";
import ParlayList from "../components/ParlayList";
import UpdateParlayDialog from "../components/UpdateParlayDialog";
import AnalyticsTab from "../components/AnalyticsTab";

const HomePage = () => {
    // State management
    const [parlays, setParlays] = useState([]);
    const [formData, setFormData] = useState({
        date: "",
        money_spent: "",
        num_legs: "",
        win: "true",
        payout: ""
    });
    const [parlayToUpdate, setParlayToUpdate] = useState(null);
    const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("parlays");
    const [showInlineForm, setShowInlineForm] = useState(false);
    const [legDistributionFilter, setLegDistributionFilter] = useState("all");
    const [trendChartType, setTrendChartType] = useState("winRate");
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [showAllParlays, setShowAllParlays] = useState(false);
    const [user, setUser] = useState(null);
    const [spendingChartView, setSpendingChartView] = useState("risked"); // "risked" or "profit"
    const navigate = useNavigate();


    // TODO: Add better error handling and user feedback

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token) {
            navigate('/login');
        } else if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [navigate]);

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
            toast.error("Error Fetchin Parlays!");

        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
                    payout: formData.win === "true" ? formData.payout : 0
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
                payout: "",
            });
            setIsModalOpen(false);
            fetchParlays();
            toast.success("Parlay added successfully!");
        } catch (error) {
            console.error("Error adding parlay:", error);
            toast.error("Error adding parlay!");

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
            toast.success("Parlay removed successfully!");

        } catch (error) {
            console.error("Error removing parlay:", error);
            toast.error("Error removing parlay!");

        }
    };

    const handleEditClick = (parlay) => {
        const formattedDate = new Date(parlay.date).toISOString().split('T')[0];

        setParlayToUpdate({
            ...parlay,
            date: formattedDate,
            win: parlay.win ? "true" : "false"
        });
        setIsUpdatePopupOpen(true);
    };

    const handleUpdate = async (updatedData) => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:5001/api/parlays/${parlayToUpdate.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({
                    ...updatedData,
                    win: updatedData.win === "true",
                    payout: updatedData.win === "true" ? updatedData.payout : 0
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update parlay");
            }

            setIsUpdatePopupOpen(false);
            //setParlayToUpdate(null);
            fetchParlays();
            toast.success("Parlay updated successfully!");

        } catch (error) {
            console.error("Error updating parlay:", error);
            toast.error("Error updating parlay!");

        }
    };

    const handleUpdateInputChange = (e) => {
        setParlayToUpdate({
            ...parlayToUpdate,
            [e.target.name]: e.target.value,
        });
    };

    //END BACKEND FUNCTIONS 

    // Analytics calculations
    const calculateStats = () => {
        if (parlays.length === 0) return { totalSpent: 0, totalWins: 0, winRate: 0, totalProfit: 0 };

        const totalSpent = parlays.reduce((sum, parlay) => sum + parseFloat(parlay.money_spent || 0), 0);
        const wins = parlays.filter(parlay => parlay.win);
        const totalWins = wins.length;
        const winRate = (totalWins / parlays.length) * 100;
        const totalProfit = wins.reduce((sum, parlay) => sum + parseFloat(parlay.payout || 0), 0) - totalSpent;

        return { totalSpent, totalWins, winRate, totalProfit };
    };

    const getChartData = () => {
        // Sort parlays by date to ensure chronological order
        const sortedParlays = [...parlays].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Group parlays by month
        const monthlyData = sortedParlays.reduce((acc, parlay) => {
            const month = new Date(parlay.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!acc[month]) {
                acc[month] = { month, wins: 0, losses: 0, spent: 0, payout: 0 };
            }
            if (parlay.win) {
                acc[month].wins++;
                acc[month].payout += parseFloat(parlay.payout || 0);
            } else {
                acc[month].losses++;
            }
            acc[month].spent += parseFloat(parlay.money_spent || 0);
            return acc;
        }, {});

        // Calculate profit/loss for each month
        Object.values(monthlyData).forEach(month => {
            month.profit = month.payout - month.spent;
        });

        // Calculate cumulative win rate and profit over time
        let cumulativeWins = 0;
        let cumulativeLosses = 0;
        let cumulativeSpent = 0;
        let cumulativePayout = 0;

        const chartData = Object.values(monthlyData).map(month => {
            cumulativeWins += month.wins;
            cumulativeLosses += month.losses;
            cumulativeSpent += month.spent;
            cumulativePayout += month.payout;

            return {
                ...month,
                winRate: cumulativeWins + cumulativeLosses > 0 ? (cumulativeWins / (cumulativeWins + cumulativeLosses)) * 100 : 0,
                cumulativeProfit: cumulativePayout - cumulativeSpent
            };
        });

        return chartData;
    };

    const getPieData = () => {
        // Filter parlays based on the selected filter
        let filteredParlays = parlays;
        if (legDistributionFilter === "wins") {
            filteredParlays = parlays.filter(parlay => parlay.win);
        } else if (legDistributionFilter === "losses") {
            filteredParlays = parlays.filter(parlay => !parlay.win);
        }

        // Count the distribution of legs across filtered parlays
        const legDistribution = filteredParlays.reduce((acc, parlay) => {
            const numLegs = parseInt(parlay.num_legs) || 0;
            if (numLegs > 0) {
                acc[numLegs] = (acc[numLegs] || 0) + 1;
            }
            return acc;
        }, {});

        // Convert to array format for the pie chart
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

        return Object.entries(legDistribution)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([legs, count], index) => ({
                name: `${legs} Leg${parseInt(legs) === 1 ? '' : 's'}`,
                value: count,
                color: colors[index % colors.length]
            }));
    };

    const getAverageLegs = () => {
        let filteredParlays = parlays;
        if (legDistributionFilter === "wins") {
            filteredParlays = parlays.filter(parlay => parlay.win);
        } else if (legDistributionFilter === "losses") {
            filteredParlays = parlays.filter(parlay => !parlay.win);
        }

        if (filteredParlays.length === 0) return 0;

        const totalLegs = filteredParlays.reduce((sum, parlay) => sum + (parseInt(parlay.num_legs) || 0), 0);
        return (totalLegs / filteredParlays.length).toFixed(1);
    };

    const getDailySpendingData = (month) => {
        // Filter parlays for the specific month
        const monthParlays = parlays.filter(parlay => {
            const parlayMonth = new Date(parlay.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            return parlayMonth === month;
        });

        // Group by day
        const dailyData = monthParlays.reduce((acc, parlay) => {
            const day = new Date(parlay.date).getDate();
            if (!acc[day]) {
                acc[day] = { day, spent: 0, payout: 0, count: 0 };
            }
            acc[day].spent += parseFloat(parlay.money_spent || 0);
            if (parlay.win) {
                acc[day].payout += parseFloat(parlay.payout || 0);
            }
            acc[day].count += 1;
            return acc;
        }, {});

        // Calculate profit/loss for each day
        Object.values(dailyData).forEach(day => {
            day.profit = day.payout - day.spent;
        });

        // Convert to array and sort by day
        return Object.values(dailyData).sort((a, b) => a.day - b.day);
    };

    // Load data on component mount
    useEffect(() => {
        // TODO: Add authentication check here
        fetchParlays();
    }, []);

    const stats = calculateStats();
    const chartData = getChartData();
    const pieData = getPieData();
    const parlaysToShow = showAllParlays ? parlays : parlays.slice(0, 5);

    const formatCurrency = (amount) => {
        return `$${amount.toFixed(2)}`;
    };

    return (

        <div className="relative min-h-screen overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 -z-10">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
            </div>
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-12">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                                <Target className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Parlay Tracker</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {user && (
                                <span className="text-gray-700 font-semibold text-lg">
                                    Hello, {user.username.split(' ')[0]}!
                                </span>
                            )}
                        </div>

                        <div className="flex items-center">
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="flex items-center space-x-2 hover:bg-gray-200"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-white">
                        <TabsTrigger value="parlays" className="flex items-center space-x-2">
                            <Target className="h-4 w-4" />
                            <span>Parlays</span>
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4" />
                            <span>Analytics</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Parlays Tab */}
                    <TabsContent value="parlays" className="space-y-6">
                        <Card className="bg-white border-0 shadow-lg mb-8">
                            <CardContent className="pt-4 pb-4 px-6 space-y-4">
                                {/* Quick Stats */}
                                <ParlayStats stats={stats} parlays={parlays} formatCurrency={formatCurrency} />
                                {/* Add New Parlay Section */}
                                <ParlayForm
                                    formData={formData}
                                    showInlineForm={showInlineForm}
                                    setShowInlineForm={setShowInlineForm}
                                    handleInputChange={handleInputChange}
                                    handleSubmit={handleSubmit}
                                    setFormData={setFormData}
                                />
                                {/* Parlays List */}
                                <ParlayList
                                    parlaysToShow={parlaysToShow}
                                    parlays={parlays}
                                    showAllParlays={showAllParlays}
                                    setShowAllParlays={setShowAllParlays}
                                    handleEditClick={handleEditClick}
                                    handleRemove={handleRemove}
                                    formatCurrency={formatCurrency}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="space-y-6">
                        <AnalyticsTab
                            legDistributionFilter={legDistributionFilter}
                            setLegDistributionFilter={setLegDistributionFilter}
                            pieData={pieData}
                            getAverageLegs={getAverageLegs}
                            selectedMonth={selectedMonth}
                            setSelectedMonth={setSelectedMonth}
                            spendingChartView={spendingChartView}
                            setSpendingChartView={setSpendingChartView}
                            chartData={chartData}
                            getDailySpendingData={getDailySpendingData}
                            trendChartType={trendChartType}
                            setTrendChartType={setTrendChartType}
                            formatCurrency={formatCurrency}
                        />
                    </TabsContent>
                </Tabs>

                {/* Update Parlay Modal */}
                <UpdateParlayDialog
                    isUpdatePopupOpen={isUpdatePopupOpen}
                    setIsUpdatePopupOpen={setIsUpdatePopupOpen}
                    parlayToUpdate={parlayToUpdate}
                    handleUpdate={handleUpdate}
                    handleUpdateInputChange={handleUpdateInputChange}
                />
            </div>
        </div>
    );
};
export default HomePage;