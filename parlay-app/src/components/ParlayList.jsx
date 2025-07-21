import React from 'react';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Edit, Trash2, Target } from 'lucide-react';

const ParlayList = ({ parlaysToShow, parlays, showAllParlays, setShowAllParlays, handleEditClick, handleRemove, formatCurrency }) => (
    <div className="flex justify-center">
        <div className="w-2/3">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Parlays</h3>
            </div>
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
                                    <div className="flex items-center space-x-4 mb-2">
                                        <span className="text-sm text-gray-500">
                                            {new Date(parlay.date).toLocaleDateString()}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            Legs: <span className="font-medium">{parlay.num_legs}</span>
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {formatCurrency(parseFloat(parlay.money_spent))}
                                        </span>
                                    </div>
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
                            className="mt-2 hover:bg-gray-200"
                        >
                            {showAllParlays ? "Show Less" : "Show All"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default ParlayList; 