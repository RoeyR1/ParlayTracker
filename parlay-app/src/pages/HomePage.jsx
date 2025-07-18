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
/*
TODOS:
Keep adding parlay modal open 
Make Parlay viewing page easier to read.
Change monthly spending chart to monthly P/L
Finish w/l line chart to show win rate history over time
Add Legs breakdown Pie chart and Legs Per Win pie chart breakdown (show avg legs/win)


*/
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
    const navigate = useNavigate();


    // TODO: Add better error handling and user feedback

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
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
                acc[day] = { day, spent: 0, count: 0 };
            }
            acc[day].spent += parseFloat(parlay.money_spent || 0);
            acc[day].count += 1;
            return acc;
        }, {});

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

        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                                <Target className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Parlay Tracker</h1>
                        </div>

                        {/* TODO: Add user profile/avatar here */}
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
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
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
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100">Total Risked</p>
                                            <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                                        </div>
                                        <DollarSign className="h-8 w-8 text-blue-200" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-100">Win Rate</p>
                                            <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-green-200" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100">Total Parlays</p>
                                            <p className="text-2xl font-bold">{parlays.length}</p>
                                        </div>
                                        <Target className="h-8 w-8 text-purple-200" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={`bg-gradient-to-r ${stats.totalProfit >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} text-white`}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white/80">Net Profit</p>
                                            <p className="text-2xl font-bold">{formatCurrency(stats.totalProfit)}</p>
                                        </div>
                                        {stats.totalProfit >= 0 ?
                                            <TrendingUp className="h-8 w-8 text-white/80" /> :
                                            <TrendingDown className="h-8 w-8 text-white/80" />
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Add New Parlay Section */}
                        <div className="space-y-4 flex justify-center">
                            <div className="w-2/3">
                                <div className="flex justify-start items-center mb-4">
                                    <Button
                                        onClick={() => setShowInlineForm(!showInlineForm)}
                                        variant="default"
                                        className={`flex items-center space-x-2 ${showInlineForm ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                                            }`}
                                    >
                                        {showInlineForm ? (
                                            <>
                                                <span>Cancel</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4" />
                                                <span>Add New Parlay</span>
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {showInlineForm && (
                                    <form
                                        onSubmit={handleSubmit}
                                        className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg shadow-sm"
                                    >
                                        <div>
                                            <Label htmlFor="date">Date</Label>
                                            <Input
                                                type="date"
                                                id="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="money_spent">Amount (USD)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                id="money_spent"
                                                name="money_spent"
                                                value={formData.money_spent}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="num_legs">Number of Legs</Label>
                                            <Input
                                                type="number"
                                                id="num_legs"
                                                name="num_legs"
                                                value={formData.num_legs}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="win">Result</Label>
                                            <Select
                                                name="win"
                                                value={formData.win}
                                                onValueChange={(value) => setFormData({ ...formData, win: value })}
                                            >
                                                <SelectTrigger id="win">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                                                    <SelectItem value="true" className="hover:bg-gray-100 cursor-pointer">Win</SelectItem>
                                                    <SelectItem value="false" className="hover:bg-gray-100 cursor-pointer">Loss</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col justify-end">
                                            {formData.win === "true" ? (
                                                <>
                                                    <Label htmlFor="payout">Payout (USD)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        id="payout"
                                                        name="payout"
                                                        value={formData.payout}
                                                        onChange={handleInputChange}
                                                        required={formData.win === "true"}
                                                    />
                                                    <Button
                                                        type="submit"
                                                        className="bg-green-500 hover:bg-green-600 mt-2"
                                                    >
                                                        Add Parlay
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col justify-end h-full">
                                                    <Button
                                                        type="submit"
                                                        className="bg-green-500 hover:bg-green-600"
                                                    >
                                                        Add Parlay
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Parlays List */}
                        <div className="flex justify-center">
                            <Card className="w-2/3">
                                <CardHeader>
                                    <CardTitle>Your Parlays</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {parlaysToShow.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                <p>No parlays yet. Add your first parlay above!</p>
                                            </div>
                                        ) : (
                                            parlaysToShow.map((parlay) => (
                                                <div key={parlay.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            {/* Top row: Date, Legs, Amount */}
                                                            <div className="flex items-center space-x-4 mb-2">
                                                                <span className="text-sm text-gray-500">
                                                                    {new Date(parlay.date).toLocaleDateString()}
                                                                </span>
                                                                <span className="text-sm text-gray-600">
                                                                    <span className="font-medium">{parlay.num_legs}</span> legs
                                                                </span>
                                                                <span className="text-sm text-gray-600">
                                                                    {formatCurrency(parseFloat(parlay.money_spent))}
                                                                </span>
                                                            </div>
                                                            {/* Bottom row: Win/Loss and Payout/Loss Amount */}
                                                            <div className="flex items-center space-x-4">
                                                                <Badge variant={parlay.win ? "default" : "secondary"}>
                                                                    {parlay.win ? "Win" : "Loss"}
                                                                </Badge>
                                                                {parlay.win ? (
                                                                    <span className="text-sm text-green-600 font-medium">
                                                                        +{formatCurrency(parseFloat(parlay.payout || 0))}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-sm text-red-600 font-medium">
                                                                        -{formatCurrency(parseFloat(parlay.money_spent || 0))}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2 ml-4">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleEditClick(parlay)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleRemove(parlay.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        {parlays.length > 5 && (
                                            <div className="flex justify-center">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowAllParlays(!showAllParlays)}
                                                    className="mt-4 hover:bg-gray-200"
                                                >
                                                    {showAllParlays ? "Show Less" : "Show All"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Leg Distribution Pie Chart */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Leg Distribution</CardTitle>
                                        <Select
                                            value={legDistributionFilter}
                                            onValueChange={setLegDistributionFilter}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border border-gray-200 shadow-lg">
                                                <SelectItem value="all" className="hover:bg-gray-100 cursor-pointer">All Parlays</SelectItem>
                                                <SelectItem value="wins" className="hover:bg-gray-100 cursor-pointer">Wins Only</SelectItem>
                                                <SelectItem value="losses" className="hover:bg-gray-100 cursor-pointer">Losses Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardHeader>
                                <CardContent className="relative">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value, name) => [`${name}: ${value} parlays`]} />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Average Legs Text */}
                                    <div className="absolute bottom-0 left-0 p-4">
                                        {legDistributionFilter === "all" && (
                                            <p className="text-sm text-gray-600 font-medium">
                                                Average Legs: {getAverageLegs()}
                                            </p>
                                        )}
                                        {legDistributionFilter === "wins" && (
                                            <p className="text-sm text-gray-600 font-medium">
                                                Average Legs per Win: {getAverageLegs()}
                                            </p>
                                        )}
                                        {legDistributionFilter === "losses" && (
                                            <p className="text-sm text-gray-600 font-medium">
                                                Average Legs per Loss: {getAverageLegs()}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Monthly/Daily Spending Chart */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>
                                            {selectedMonth ? `Daily Risked - ${selectedMonth}` : "Monthly Risked"}
                                        </CardTitle>
                                        {selectedMonth && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedMonth(null)}
                                                className="flex items-center space-x-2 hover:bg-gray-200"
                                            >
                                                <span>← Back</span>
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={selectedMonth ? getDailySpendingData(selectedMonth) : chartData}
                                            onClick={(data) => {
                                                if (!selectedMonth && data && data.activeLabel) {
                                                    setSelectedMonth(data.activeLabel);
                                                }
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey={selectedMonth ? "day" : "month"} />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value) => [`Risked: ${formatCurrency(value)}`]}
                                                labelFormatter={(label) => {
                                                    if (selectedMonth) {
                                                        // Extract month name from selectedMonth (e.g., "Jul 2025" -> "Jul")
                                                        const monthName = selectedMonth.split(' ')[0];
                                                        return `${monthName} ${label}`;
                                                    }
                                                    return label;
                                                }}
                                            />
                                            <Bar
                                                dataKey="spent"
                                                fill="#3b82f6"
                                                style={{ cursor: selectedMonth ? 'default' : 'pointer' }}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Combined Trend Chart */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>
                                            {trendChartType === "winRate" ? "Win Rate Trend" : "Profit Trend"}
                                        </CardTitle>
                                        <Select
                                            value={trendChartType}
                                            onValueChange={setTrendChartType}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border border-gray-200 shadow-lg">
                                                <SelectItem value="winRate" className="hover:bg-gray-100 cursor-pointer">Win Rate</SelectItem>
                                                <SelectItem value="profit" className="hover:bg-gray-100 cursor-pointer">Profit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis
                                                domain={trendChartType === "winRate" ? [0, 100] : undefined}
                                            />
                                            <Tooltip
                                                formatter={(value, name, props) => {
                                                    const currentMonth = props.payload.month;
                                                    const firstMonth = chartData[0]?.month;
                                                    const dateRange = firstMonth === currentMonth ? currentMonth : `${firstMonth} - ${currentMonth}`;
                                                    const label = trendChartType === "winRate" ? 'Win Rate' : 'Cumulative Profit';
                                                    const formattedValue = trendChartType === "winRate"
                                                        ? `${value.toFixed(1)}%`
                                                        : formatCurrency(value);

                                                    return [
                                                        <div>
                                                            <div>{dateRange}</div>
                                                            <div>{label}: {formattedValue}</div>
                                                        </div>
                                                    ];
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey={trendChartType === "winRate" ? "winRate" : "cumulativeProfit"}
                                                stroke={trendChartType === "winRate" ? "#10b981" : "#3b82f6"}
                                                strokeWidth={3}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Update Parlay Modal */}
                <Dialog open={isUpdatePopupOpen} onOpenChange={setIsUpdatePopupOpen}>
                    <DialogOverlay className="bg-black/10" />
                    <DialogContent className="bg-white p-6 rounded-lg">
                        <DialogHeader>
                            <DialogTitle>Edit Parlay</DialogTitle>
                            <DialogDescription>
                                Update the details of your selected parlay below. Change any field and click Save to update.
                            </DialogDescription>
                        </DialogHeader>
                        {parlayToUpdate && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleUpdate(parlayToUpdate);
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="update-date">Date</Label>
                                    <Input
                                        type="date"
                                        id="update-date"
                                        name="date"
                                        value={parlayToUpdate.date}
                                        onChange={handleUpdateInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="update-money">Amount</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        id="update-money"
                                        name="money_spent"
                                        value={parlayToUpdate.money_spent}
                                        onChange={handleUpdateInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="update-legs">Number of Legs</Label>
                                    <Input
                                        type="number"
                                        id="update-legs"
                                        name="num_legs"
                                        value={parlayToUpdate.num_legs}
                                        onChange={handleUpdateInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="update-win">Result</Label>
                                    <select
                                        name="win"
                                        value={parlayToUpdate.win}
                                        onChange={handleUpdateInputChange}
                                        className="w-full p-2 border rounded dark:border-gray-600"
                                    >
                                        <option value="true">Win</option>
                                        <option value="false">Loss</option>
                                    </select>
                                </div>
                                {parlayToUpdate?.win === "true" && (
                                    <div>
                                        <Label htmlFor="update-payout">Payout (USD)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            id="update-payout"
                                            name="payout"
                                            value={parlayToUpdate.payout || ""}
                                            onChange={handleUpdateInputChange}
                                            required={parlayToUpdate.win === "true"}
                                        />
                                    </div>
                                )}
                                <div className="flex justify-end space-x-2">
                                    <Button type="button"
                                        className="bg-red-500 hover:bg-red-600"
                                        onClick={() => setIsUpdatePopupOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit"
                                        className="bg-green-500 hover:bg-green-600"
                                    >Save</Button>
                                </div>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
export default HomePage;