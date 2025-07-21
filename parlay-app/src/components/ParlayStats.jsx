import React from 'react';
import { Card, CardContent } from "./ui/card";
import { DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react';

const ParlayStats = ({ stats, parlays, formatCurrency }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
);

export default ParlayStats; 