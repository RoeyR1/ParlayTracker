import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const UpdateParlayDialog = ({ isUpdatePopupOpen, setIsUpdatePopupOpen, parlayToUpdate, handleUpdate, handleUpdateInputChange }) => (
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
);

export default UpdateParlayDialog; 