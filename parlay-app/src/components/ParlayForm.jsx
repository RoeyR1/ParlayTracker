import React from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus } from 'lucide-react';

const ParlayForm = ({ formData, showInlineForm, setShowInlineForm, handleInputChange, handleSubmit, setFormData }) => (
    <div className="space-y-4 flex justify-center mb-2">
        <div className="w-2/3">
            <div className="flex justify-start items-center mb-4">
                <Button
                    onClick={() => setShowInlineForm(!showInlineForm)}
                    variant="default"
                    className={`flex items-center space-x-2 ${showInlineForm ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
                >
                    {showInlineForm ? (
                        <span>Cancel</span>
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
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg shadow-sm bg-white"
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
);

export default ParlayForm; 