import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis, LineChart, Line } from 'recharts';

const AnalyticsTab = ({
    legDistributionFilter,
    setLegDistributionFilter,
    pieData,
    getAverageLegs,
    selectedMonth,
    setSelectedMonth,
    spendingChartView,
    setSpendingChartView,
    chartData,
    getDailySpendingData,
    trendChartType,
    setTrendChartType,
    formatCurrency
}) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leg Distribution Pie Chart */}
        <Card className="bg-white">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Leg Distribution</CardTitle>
                    <Select
                        value={legDistributionFilter}
                        onValueChange={setLegDistributionFilter}
                    >
                        <SelectTrigger className="w-32 hover:bg-gray-200">
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
                {/* Average Legs*/}
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
        <Card className="bg-white">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <CardTitle>
                            {selectedMonth
                                ? `Daily ${spendingChartView === "risked" ? "Risked" : "Profit/Loss"} - ${selectedMonth}`
                                : `Monthly ${spendingChartView === "risked" ? "Risked" : "Profit/Loss"}`
                            }
                        </CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSpendingChartView(spendingChartView === "risked" ? "profit" : "risked")}
                            className="hover:bg-gray-200"
                        >
                            View {spendingChartView === "risked" ? "Profit/Loss" : "Risked"}
                        </Button>
                    </div>
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
                            formatter={(value, name) => {
                                if (spendingChartView === "profit") {
                                    return [`${name === "profit" ? "Profit/Loss" : name}: ${formatCurrency(value)}`];
                                }
                                return [`Risked: ${formatCurrency(value)}`];
                            }}
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
                            dataKey={spendingChartView === "profit" ? "profit" : "spent"}
                            fill="#3b82f6"
                            style={{ cursor: selectedMonth ? 'default' : 'pointer' }}
                        >
                            {spendingChartView === "profit" && (selectedMonth ? getDailySpendingData(selectedMonth) : chartData).map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.profit >= 0 ? "#10b981" : "#ef4444"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        {/* Combined Trend Chart */}
        <Card className="lg:col-span-2 bg-white">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>
                        {trendChartType === "winRate" ? "Win Rate Trend" : "Profit Trend"}
                    </CardTitle>
                    <Select
                        value={trendChartType}
                        onValueChange={setTrendChartType}
                    >
                        <SelectTrigger className="w-32 hover:bg-gray-200">
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
);

export default AnalyticsTab; 